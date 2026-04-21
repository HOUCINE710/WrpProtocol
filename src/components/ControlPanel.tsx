import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Link as LinkIcon, 
  Trash2, 
  FastForward,
  Info,
  BookOpen
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  onAddNode: () => void;
  onAddLink: () => void;
  onRemoveSelected: () => void;
  speed: number;
  onSpeedChange: (val: number) => void;
  onShowEducation: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onToggleRunning,
  onReset,
  onAddNode,
  onAddLink,
  onRemoveSelected,
  speed,
  onSpeedChange,
  onShowEducation,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200">تحكم المحاكاة</h3>
        <Button variant="ghost" size="sm" onClick={onShowEducation} className="h-7 text-[10px] text-purple-400 hover:text-purple-300">
          <BookOpen className="h-3 w-3 mr-1" />
          ما هو WRP؟
        </Button>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={isRunning ? "secondary" : "default"} 
          className={`flex-1 gap-2 ${isRunning ? "bg-amber-500/20 text-amber-500" : "bg-blue-600"}`}
          onClick={onToggleRunning}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isRunning ? "إيقاف مؤقت" : "بدء المحاكاة"}
        </Button>
        <Button variant="outline" size="icon" onClick={onReset} className="border-slate-700">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="bg-slate-800" />

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={onAddNode} className="text-[11px] border-slate-700">
          <Plus className="h-3 w-3 mr-1 text-green-500" />
          إضافة جهاز
        </Button>
        <Button variant="outline" size="sm" onClick={onAddLink} className="text-[11px] border-slate-700">
          <LinkIcon className="h-3 w-3 mr-1 text-blue-500" />
          ربط أجهزة
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>سرعة التحديث</span>
          <span>{speed}ms</span>
        </div>
        <Slider 
          value={[2000 - speed]} 
          max={1900} 
          min={100} 
          step={100} 
          onValueChange={(val) => onSpeedChange(2000 - val[0])}
        />
      </div>
    </div>
  );
};
