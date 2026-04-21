import React from 'react';
import { Node, NodeState, RoutingEntry } from '../types/wrp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Info, Network, ListTree, Database, Power, PowerOff } from 'lucide-react';

interface NodeDetailsPanelProps {
  node: Node | null;
  state: NodeState | null;
  allNodes: Node[];
  onToggleStatus?: (id: string) => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ node, state, allNodes, onToggleStatus }) => {
  if (!node || !state) {
    return (
      <Card className="h-full bg-slate-900/50 border-slate-800 flex items-center justify-center text-slate-500">
        <div className="text-center p-6">
          <Info className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">اختر جهازاً لرؤية مساراته</p>
        </div>
      </Card>
    );
  }

  const getNodeName = (id: string) => allNodes.find(n => n.id === id)?.name || id;

  return (
    <Card className="h-full bg-slate-900/50 border-slate-800 flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Network className="h-4 w-4 text-blue-500" />
            {node.name}
          </CardTitle>
          <Badge variant={node.status === 'active' ? 'default' : 'destructive'} className="text-[10px]">
            {node.status === 'active' ? 'نشط' : 'متوقف'}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-slate-500">ID: {node.id}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onToggleStatus?.(node.id)}
            className="h-6 px-2 text-[9px] gap-1"
          >
            {node.status === 'active' ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
            {node.status === 'active' ? 'إيقاف' : 'تشغيل'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">خريطة التوجيه (أين يرسل البيانات؟)</h4>
            <div className="space-y-2">
              {Array.from(state.routingTable.values())
                .filter((e: any) => e.destination !== node.id)
                .map((entry: RoutingEntry) => (
                <div key={entry.destination} className="flex items-center justify-between p-2 rounded bg-slate-800/40 border border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">إلى: {getNodeName(entry.destination)}</span>
                    <span className="text-[10px] text-slate-500">عبر: {getNodeName(entry.nextHop)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-blue-400">{entry.distance} قفزة</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
