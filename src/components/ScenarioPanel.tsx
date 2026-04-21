import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, AlertTriangle, Move, Zap, Info } from 'lucide-react';

interface ScenarioPanelProps {
  onTrigger: (type: 'failure' | 'new_node' | 'mobility') => void;
}

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({ onTrigger }) => {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="py-3 border-b border-slate-800">
        <CardTitle className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-amber-500" />
          Interactive Scenarios (سيناريوهات تفاعلية)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3 border-red-900/30 bg-red-950/10 hover:bg-red-950/20 text-red-200"
            onClick={() => onTrigger('failure')}
          >
            <AlertTriangle className="h-5 w-5 mr-3 text-red-500 shrink-0" />
            <div className="text-left">
              <div className="text-sm font-bold">Link Failure (فشل اتصال)</div>
              <div className="text-[10px] text-red-400/70">Break a critical link and watch WRP find a backup route.</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-3 border-blue-900/30 bg-blue-950/10 hover:bg-blue-950/20 text-blue-200"
            onClick={() => onTrigger('new_node')}
          >
            <Zap className="h-5 w-5 mr-3 text-blue-500 shrink-0" />
            <div className="text-left">
              <div className="text-sm font-bold">New Node (إضافة جهاز)</div>
              <div className="text-[10px] text-blue-400/70">Add a node and see how proactive updates spread.</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-3 border-purple-900/30 bg-purple-950/10 hover:bg-purple-950/20 text-purple-200"
            onClick={() => onTrigger('mobility')}
          >
            <Move className="h-5 w-5 mr-3 text-purple-500 shrink-0" />
            <div className="text-left">
              <div className="text-sm font-bold">Mobility (تحرك الأجهزة)</div>
              <div className="text-[10px] text-purple-400/70">Simulate a node moving to a new location.</div>
            </div>
          </Button>
        </div>

        <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20 flex gap-3">
          <Info className="h-5 w-5 text-blue-400 shrink-0" />
          <p className="text-[11px] text-blue-300/80 leading-relaxed">
            <strong>WRP</strong> هو بروتوكول استباقي. هذا يعني أن الأجهزة تتبادل المعلومات باستمرار لتكون مستعدة لأي تغيير في الشبكة قبل حدوثه.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
