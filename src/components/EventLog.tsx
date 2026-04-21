import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { WRPEvent } from '../lib/wrp-engine';

interface EventLogProps {
  events: WRPEvent[];
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const getIcon = (type: WRPEvent['type']) => {
    switch (type) {
      case 'update_received': return <Info className="h-3 w-3 text-blue-400" />;
      case 'table_changed': return <Terminal className="h-3 w-3 text-purple-400" />;
      case 'link_failure': return <AlertTriangle className="h-3 w-3 text-red-400" />;
      case 'convergence': return <CheckCircle className="h-3 w-3 text-green-400" />;
    }
  };

  return (
    <Card className="h-full bg-slate-900/50 border-slate-800 flex flex-col overflow-hidden">
      <CardHeader className="py-3 border-b border-slate-800">
        <CardTitle className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Protocol Activity Log (سجل النشاط)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-3">
          <div className="space-y-2">
            {events.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4 italic">No activity yet. Start the simulation.</p>
            )}
            {[...events].reverse().map((event, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-800/30 border border-slate-800/50 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(event.type)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-tight">{event.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
