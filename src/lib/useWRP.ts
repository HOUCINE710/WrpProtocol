import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Link, NodeState, SimulationStats } from '../types/wrp';
import { WRPEngine, WRPEvent } from './wrp-engine';

export function useWRP(initialNodes: Node[], initialLinks: Link[]) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [nodeStates, setNodeStates] = useState<Map<string, NodeState>>(new Map());
  const [events, setEvents] = useState<WRPEvent[]>([]);
  const [stats, setStats] = useState<SimulationStats>({
    updatesSent: 0,
    messagesSent: 0,
    convergenceTime: 0,
    lastUpdateTime: Date.now(),
  });
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2000); // Slower speed: 2 seconds per step
  const [autoScenario, setAutoScenario] = useState<{ active: boolean; step: number; message: string }>({
    active: false,
    step: 0,
    message: '',
  });
  
  const engineRef = useRef<WRPEngine | null>(null);

  useEffect(() => {
    engineRef.current = new WRPEngine(nodes, links);
    setNodeStates(new Map(engineRef.current.getStates()));
  }, []);

  const runStep = useCallback(() => {
    if (!engineRef.current) return;
    
    const changed = engineRef.current.step();
    if (changed) {
      setNodeStates(new Map(engineRef.current.getStates()));
      setStats(prev => ({
        ...prev,
        updatesSent: prev.updatesSent + 1,
        messagesSent: prev.messagesSent + nodes.length, // Simplified
        lastUpdateTime: Date.now(),
      }));
    }
    return changed;
  }, [nodes.length]);

  useEffect(() => {
    if (engineRef.current) {
      setEvents([...engineRef.current.getEvents()]);
    }
  }, [nodeStates]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        const changed = runStep();
        
        if (autoScenario.active && !changed) {
          // If network converged, move to next scenario step
          setAutoScenario(prev => {
            const nextStep = prev.step + 1;
            let nextMsg = '';
            
            if (nextStep === 1) {
              // Trigger a failure
              const activeLink = links.find(l => l.status === 'active');
              if (activeLink) {
                toggleLinkStatus(activeLink.source as string, activeLink.target as string);
                nextMsg = 'تم قطع اتصال! لاحظ كيف ستبحث الأجهزة عن مسار بديل...';
              } else {
                return { ...prev, active: false, message: 'لا يوجد روابط نشطة لقطعها.' };
              }
            } else if (nextStep === 2) {
              // Restore link
              const brokenLink = links.find(l => l.status === 'broken');
              if (brokenLink) {
                toggleLinkStatus(brokenLink.source as string, brokenLink.target as string);
                nextMsg = 'تم استعادة الاتصال. الأجهزة تعيد تحديث جداولها للمسار الأقصر.';
              }
            } else if (nextStep === 3) {
              // Deactivate a node
              const nodeToKill = nodes.find(n => n.status === 'active' && n.id !== 'node-1');
              if (nodeToKill) {
                toggleNodeStatus(nodeToKill.id);
                nextMsg = `الجهاز ${nodeToKill.name} توقف عن العمل. الشبكة تعيد التنظيم.`;
              }
            } else {
              // End scenario
              return { ...prev, active: false, message: 'انتهت المحاكاة التلقائية. الشبكة الآن مستقرة.' };
            }
            
            return { ...prev, step: nextStep, message: nextMsg };
          });
        }
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, speed, runStep, autoScenario, links, nodes]);

  const addNode = (x: number, y: number) => {
    const id = `node-${Date.now()}`;
    const newNode: Node = { id, name: `Node ${nodes.length + 1}`, x, y, status: 'active' };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    engineRef.current?.updateTopology(newNodes, links);
  };

  const removeNode = (id: string) => {
    const newNodes = nodes.filter(n => n.id !== id);
    const newLinks = links.filter(l => l.source !== id && l.target !== id);
    setNodes(newNodes);
    setLinks(newLinks);
    engineRef.current?.updateTopology(newNodes, newLinks);
  };

  const toggleNodeStatus = (id: string) => {
    const newNodes = nodes.map(n => n.id === id ? { ...n, status: n.status === 'active' ? 'inactive' : 'active' } as Node : n);
    setNodes(newNodes);
    engineRef.current?.updateTopology(newNodes, links);
  };

  const addLink = (source: string, target: string) => {
    if (source === target) return;
    if (links.some(l => (l.source === source && l.target === target) || (l.source === target && l.target === source))) return;
    
    const newLink: Link = { source, target, cost: 1, status: 'active' };
    const newLinks = [...links, newLink];
    setLinks(newLinks);
    engineRef.current?.updateTopology(nodes, newLinks);
  };

  const removeLink = (source: string, target: string) => {
    const newLinks = links.filter(l => !((l.source === source && l.target === target) || (l.source === target && l.target === source)));
    setLinks(newLinks);
    engineRef.current?.updateTopology(nodes, newLinks);
  };

  const toggleLinkStatus = (source: string, target: string) => {
    const newLinks = links.map(l => 
      ((l.source === source && l.target === target) || (l.source === target && l.target === source))
      ? { ...l, status: l.status === 'active' ? 'broken' : 'active' } as Link
      : l
    );
    setLinks(newLinks);
    engineRef.current?.updateTopology(nodes, newLinks);
  };

  const reset = () => {
    setNodes(initialNodes);
    setLinks(initialLinks);
    engineRef.current = new WRPEngine(initialNodes, initialLinks);
    setNodeStates(new Map(engineRef.current.getStates()));
    setStats({
      updatesSent: 0,
      messagesSent: 0,
      convergenceTime: 0,
      lastUpdateTime: Date.now(),
    });
    setIsRunning(false);
    setAutoScenario({ active: false, step: 0, message: '' });
  };

  const startFullAutoMode = () => {
    reset();
    setTimeout(() => {
      setIsRunning(true);
      setAutoScenario({ active: true, step: 0, message: 'جاري تشغيل الشبكة وفحص المسارات الأولية...' });
    }, 500);
  };

  return {
    nodes,
    links,
    nodeStates,
    stats,
    isRunning,
    speed,
    setIsRunning,
    setSpeed,
    addNode,
    removeNode,
    toggleNodeStatus,
    addLink,
    removeLink,
    toggleLinkStatus,
    reset,
    runStep,
    events,
    autoScenario,
    startFullAutoMode,
  };
}
