import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MessageSquare, Clock, Zap } from 'lucide-react';

interface StatsDashboardProps {
  updatesSent: number;
  messagesSent: number;
  convergenceTime: number;
  lastUpdateTime: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  updatesSent,
  messagesSent,
  convergenceTime,
  lastUpdateTime,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-slate-900/50 border-slate-800 p-3">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-blue-500" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">تحديثات الشبكة</div>
            <div className="text-lg font-bold text-slate-100">{updatesSent}</div>
          </div>
        </div>
      </Card>
      <Card className="bg-slate-900/50 border-slate-800 p-3">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">وقت الاستقرار</div>
            <div className="text-lg font-bold text-slate-100">{convergenceTime}ms</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
