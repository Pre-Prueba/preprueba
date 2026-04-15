import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkspaceTopbar: React.FC = () => {
  const activeExam = useSelector((state: RootState) => state.workspace.activeExam);
  const mode = useSelector((state: RootState) => state.workspace.mode);
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[#EAEAEA] bg-white sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#F7F6F3] rounded-md transition-colors text-[#787774] hover:text-[#111111]"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-[#111111]">
              {activeExam?.materia}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-[#EDF3EC] text-[#346538] font-medium">
              {mode}
            </span>
          </div>
          <span className="text-xs text-[#787774]">
            {activeExam?.comunidad} • {activeExam?.año}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {mode === 'simulation' && activeExam?.duración && (
          <div className="flex items-center gap-2 text-[#787774]">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-mono tracking-tight text-[#111111]">01:29:45</span>
          </div>
        )}
        
        <button className="h-9 px-4 text-sm font-medium text-white bg-[#111111] hover:bg-[#333333] active:scale-[0.98] transition-transform rounded-md shadow-sm">
          Finalizar Sesión
        </button>
      </div>
    </header>
  );
};
