import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Node, Link, NodeState } from '../types/wrp';
import { motion, AnimatePresence } from 'motion/react';

interface NetworkGraphProps {
  nodes: Node[];
  links: Link[];
  onNodeClick: (node: Node) => void;
  onLinkClick: (link: Link) => void;
  selectedNodeId?: string;
  activePath?: string[];
  nodeStates: Map<string, NodeState>;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  onNodeClick,
  onLinkClick,
  selectedNodeId,
  activePath = [],
  nodeStates,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    // Create a group for the entire graph to allow zooming/panning if needed
    const g = svg.append('g');

    const simulation = d3.forceSimulation<any>(nodes)
      .force('link', d3.forceLink<any, any>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        if (d.status === 'broken') return '#ef4444';
        const isSourceInPath = activePath.includes(typeof d.source === 'string' ? d.source : (d.source as any).id);
        const isTargetInPath = activePath.includes(typeof d.target === 'string' ? d.target : (d.target as any).id);
        if (isSourceInPath && isTargetInPath) return '#22c55e';
        return '#4b5563';
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => d.status === 'broken' ? 1 : 2)
      .attr('stroke-dasharray', d => d.status === 'broken' ? '5,5' : '0')
      .style('cursor', 'pointer')
      .on('click', (event, d) => onLinkClick(d));

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick(d))
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => d.status === 'inactive' ? '#374151' : (d.id === selectedNodeId ? '#3b82f6' : '#1f2937'))
      .attr('stroke', d => {
        if (d.status === 'inactive') return '#4b5563';
        if (activePath.includes(d.id)) return '#22c55e';
        return d.id === selectedNodeId ? '#60a5fa' : '#9ca3af';
      })
      .attr('stroke-width', 2)
      .style('filter', d => d.status === 'active' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none');

    // Add mini tables above nodes
    const miniTables = node.selectAll('.mini-table')
      .data(d => {
        const state = nodeStates.get(d.id);
        if (!state) return [];
        return Array.from(state.routingTable.values())
          .filter((e: any) => e.destination !== d.id)
          .slice(0, 3); // Show top 3 routes
      })
      .join('g')
      .attr('class', 'mini-table')
      .attr('transform', (d, i) => `translate(-40, ${-55 - i * 16})`);

    miniTables.append('rect')
      .attr('width', 80)
      .attr('height', 14)
      .attr('fill', 'rgba(15, 23, 42, 0.95)')
      .attr('stroke', 'rgba(59, 130, 246, 0.5)')
      .attr('rx', 4);

    miniTables.append('text')
      .attr('x', 6)
      .attr('y', 10)
      .attr('fill', '#f8fafc')
      .style('font-size', '8px')
      .style('font-weight', 'bold')
      .style('font-family', 'monospace')
      .text((d: any) => {
        const destName = nodes.find(n => n.id === d.destination)?.name || d.destination;
        const nextName = nodes.find(n => n.id === d.nextHop)?.name || d.nextHop;
        return `${destName} → ${nextName} (${d.distance})`;
      });

    node.append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [nodes, links, selectedNodeId, activePath]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-950/50 rounded-xl border border-slate-800 relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600" />
          <span>Active Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600 opacity-50" />
          <span>Inactive Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-400" />
          <span>Selected Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 border border-green-400" />
          <span>Active Path</span>
        </div>
      </div>
    </div>
  );
};
