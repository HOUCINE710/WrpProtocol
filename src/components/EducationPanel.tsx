import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

interface EducationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationPanel: React.FC<EducationPanelProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-500" />
            Wireless Routing Protocol (WRP)
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Understanding Proactive Routing in Ad Hoc Networks
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">What is WRP?</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The Wireless Routing Protocol (WRP) is a <strong>proactive</strong> unicast routing protocol for mobile ad hoc networks (MANETs). 
                Unlike reactive protocols (like AODV) that find routes on-demand, WRP maintains up-to-date routing information at every node at all times.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-green-400">Key Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-500" /> Routing Table
                  </h4>
                  <p className="text-xs text-slate-400">Stores the destination, next hop, distance, and predecessor for each known node.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-500" /> Distance Table
                  </h4>
                  <p className="text-xs text-slate-400">Maintains the distance to each destination through each neighbor.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-500" /> Link Cost Table
                  </h4>
                  <p className="text-xs text-slate-400">Tracks the cost of the link to each immediate neighbor.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-500" /> MRL
                  </h4>
                  <p className="text-xs text-slate-400">Message Retransmission List ensures reliable delivery of update messages.</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-amber-400">Loop Avoidance</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                WRP avoids the "count-to-infinity" problem by using <strong>predecessor information</strong>. 
                When a node updates its path, it checks if the new path would create a loop by looking at the predecessor reported by its neighbors.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Advantages
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                  <li>Low latency for route discovery</li>
                  <li>Fast convergence after topology changes</li>
                  <li>Effective loop avoidance mechanism</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" /> Disadvantages
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                  <li>High power consumption (proactive)</li>
                  <li>Significant bandwidth overhead for updates</li>
                  <li>Scalability issues in very large networks</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
