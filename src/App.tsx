/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { useWRP } from './lib/useWRP';
import { NetworkGraph } from '@/src/components/NetworkGraph';
import { NodeDetailsPanel } from '@/src/components/NodeDetailsPanel';
import { ControlPanel } from '@/src/components/ControlPanel';
import { StatsDashboard } from '@/src/components/StatsDashboard';
import { EducationPanel } from '@/src/components/EducationPanel';
import { EventLog } from '@/src/components/EventLog';
import { ScenarioPanel } from '@/src/components/ScenarioPanel';
import { Node, Link, NodeState } from '@/src/types/wrp';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Network, Github, Zap, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_NODES: Node[] = [
  { id: 'node-1', name: 'Gateway', x: 100, y: 100, status: 'active' },
  { id: 'node-2', name: 'Node A', x: 300, y: 150, status: 'active' },
  { id: 'node-3', name: 'Node B', x: 200, y: 300, status: 'active' },
  { id: 'node-4', name: 'Node C', x: 450, y: 250, status: 'active' },
];

const INITIAL_LINKS: Link[] = [
  { source: 'node-1', target: 'node-2', cost: 1, status: 'active' },
  { source: 'node-1', target: 'node-3', cost: 1, status: 'active' },
  { source: 'node-2', target: 'node-4', cost: 1, status: 'active' },
  { source: 'node-3', target: 'node-4', cost: 1, status: 'active' },
];

export default function App() {
  const {
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
    events,
    autoScenario,
    startFullAutoMode,
  } = useWRP(INITIAL_NODES, INITIAL_LINKS);

  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [targetNodeId, setTargetNodeId] = useState<string | undefined>();
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const selectedNodeState = useMemo(() => nodeStates.get(selectedNodeId || '') || null, [nodeStates, selectedNodeId]);

  const activePath = useMemo(() => {
    if (!selectedNodeId || !targetNodeId || !nodeStates.has(selectedNodeId)) return [];
    
    const path: string[] = [selectedNodeId];
    let current = selectedNodeId;
    const visited = new Set<string>();

    while (current !== targetNodeId) {
      if (visited.has(current)) break; // Loop safety
      visited.add(current);

      const state = nodeStates.get(current);
      const entry = state?.routingTable.get(targetNodeId);
      
      if (!entry || entry.distance === Infinity || !entry.nextHop) break;
      
      current = entry.nextHop;
      path.push(current);
    }

    return path[path.length - 1] === targetNodeId ? path : [];
  }, [selectedNodeId, targetNodeId, nodeStates]);

  const handleNodeClick = (node: Node) => {
    if (isConnecting && selectedNodeId && selectedNodeId !== node.id) {
      addLink(selectedNodeId, node.id);
      setIsConnecting(false);
    } else {
      if (selectedNodeId === node.id) {
        setSelectedNodeId(undefined);
        setTargetNodeId(undefined);
      } else if (!selectedNodeId) {
        setSelectedNodeId(node.id);
      } else {
        setTargetNodeId(node.id);
      }
    }
  };

  const handleLinkClick = (link: Link) => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    toggleLinkStatus(sourceId, targetId);
  };

  const handleAddNodeAtCenter = () => {
    addNode(Math.random() * 400 + 100, Math.random() * 300 + 100);
  };

  const handleTriggerScenario = (type: 'failure' | 'new_node' | 'mobility') => {
    setIsRunning(true);
    if (type === 'failure') {
      // Find an active link and break it
      const activeLink = links.find(l => l.status === 'active');
      if (activeLink) {
        toggleLinkStatus(activeLink.source as string, activeLink.target as string);
      }
    } else if (type === 'new_node') {
      handleAddNodeAtCenter();
    } else if (type === 'mobility') {
      // This is simulated by adding a node or we could move one if we had refs
      handleAddNodeAtCenter();
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
        {/* Header */}
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">WRP Simulator</h1>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Wireless Routing Protocol v1.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-medium text-slate-400">{isRunning ? 'Simulation Running' : 'Simulation Paused'}</span>
              </div>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4 h-[calc(100vh-80px)] overflow-hidden">
          <AnimatePresence mode="wait">
            {!autoScenario.active ? (
              <motion.div 
                key="hero"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-12 flex flex-col items-center text-center gap-6 shadow-2xl my-auto"
              >
                <div className="bg-blue-500/10 p-4 rounded-3xl mb-2">
                  <Zap className="h-12 w-12 text-blue-500" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight">محاكاة WRP الذكية</h2>
                <p className="text-slate-400 max-w-2xl text-xl leading-relaxed">
                  بضغطة زر واحدة، سأقوم ببناء شبكة كاملة وافتعال أعطال لشرح كيف يجد البروتوكول المسارات تلقائياً.
                </p>
                <Button 
                  size="lg"
                  onClick={startFullAutoMode} 
                  className="mt-6 h-20 px-16 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-2xl shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95"
                >
                  ابدأ المحاكاة الآن
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="graph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 relative bg-slate-900/20 rounded-3xl border border-slate-800/50 overflow-hidden"
              >
                <NetworkGraph 
                  nodes={nodes} 
                  links={links} 
                  onNodeClick={handleNodeClick}
                  onLinkClick={handleLinkClick}
                  selectedNodeId={selectedNodeId}
                  activePath={activePath}
                  nodeStates={nodeStates}
                />
                
                {/* Auto Scenario Message Overlay */}
                <AnimatePresence>
                  {autoScenario.active && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-12">
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex flex-col items-center gap-2 z-50 border-4 border-blue-400 pointer-events-auto"
                      >
                        <div className="flex items-center gap-4">
                          <Zap className="h-10 w-10 animate-pulse text-yellow-300" />
                          <span className="text-3xl tracking-tight">{autoScenario.message}</span>
                        </div>
                        <div className="text-blue-200 text-sm font-medium">بروتوكول WRP يعمل الآن...</div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 z-50 pointer-events-auto"
                      >
                        <Button 
                          size="lg"
                          onClick={() => setIsRunning(!isRunning)}
                          className={`h-16 px-10 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center gap-3 ${
                            isRunning ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "bg-green-600 hover:bg-green-500 text-white"
                          }`}
                        >
                          {isRunning ? (
                            <><Pause className="h-6 w-6" /> إيقاف مؤقت</>
                          ) : (
                            <><Play className="h-6 w-6" /> استمرار</>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline"
                          size="lg"
                          onClick={reset}
                          className="h-16 px-10 rounded-2xl font-bold text-lg bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white border-2"
                        >
                          <RotateCcw className="h-6 w-6 mr-2" />
                          إعادة ضبط
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <EducationPanel isOpen={isEducationOpen} onClose={() => setIsEducationOpen(false)} />
      </div>
    </TooltipProvider>
  );
}
