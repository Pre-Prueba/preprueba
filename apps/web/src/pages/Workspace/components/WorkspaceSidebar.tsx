import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { selectOption, setCurrentQuestionId } from '../../../features/workspace/workspaceSlice';
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import cx from 'classnames';

export const WorkspaceSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { activeExam, selectedOption, currentQuestionId, statuses } = useSelector(
    (state: RootState) => state.workspace
  );

  if (!activeExam) return null;

  const hasOptions = activeExam.options && activeExam.options.length > 0;

  // Filtrar as questões disponíveis baseado na opção.
  // Se não tem opções no exame (quiz geral), mostra todas. Se selecionada, mostra as gerais + as da opção.
  const visibleQuestions = activeExam.questions.filter(
    (q: any) => !q.option_id || q.option_id === selectedOption
  );

  return (
    <aside className="w-80 flex flex-col border-r border-[#EAEAEA] bg-white h-[calc(100dvh-4rem)]">
      
      {/* Sector de Seleção de Opção */}
      {hasOptions && (
        <div className="p-6 border-b border-[#EAEAEA]">
          <h3 className="text-xs font-semibold text-[#787774] uppercase tracking-wider mb-4">
            Selecciona una opción
          </h3>
          <div className="flex gap-2">
            {activeExam.options.map((opt: any) => (
              <button
                key={opt.option_label}
                onClick={() => dispatch(selectOption(opt.option_label))}
                className={cx(
                  "flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-all",
                  selectedOption === opt.option_label
                    ? "bg-[#111111] text-white border-[#111111]"
                    : "bg-white text-[#111111] border-[#EAEAEA] hover:border-[#111111]"
                )}
              >
                Opción {opt.option_label}
              </button>
            ))}
          </div>
          
          {selectedOption && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-[#FBFBFA] border border-[#EAEAEA] rounded-md">
              <AlertCircle className="w-4 h-4 text-[#787774] shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-[#787774] leading-relaxed">
                {activeExam.options.find((o: any) => o.option_label === selectedOption)?.warning_rule}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lista de Questões */}
      <div className="flex-1 overflow-y-auto p-4">
        {(!hasOptions || selectedOption) ? (
          <div className="space-y-1">
            {visibleQuestions.length > 0 ? (
              visibleQuestions.map((question: any, index: number) => {
                const status = statuses[question.id];
                const isActive = currentQuestionId === question.id;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => dispatch(setCurrentQuestionId(question.id))}
                    className={cx(
                      "w-full flex items-center justify-between p-3 rounded-md text-left transition-colors text-sm",
                      isActive ? "bg-[#F7F6F3]" : "hover:bg-[#FBFBFA]"
                    )}
                  >
                    <span className={cx(
                      "font-medium truncate pr-4",
                      isActive ? "text-[#111111]" : "text-[#787774]"
                    )}>
                      {index + 1}. {question.title}
                    </span>
                    
                    {status === 'answered' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#346538] shrink-0" strokeWidth={2.5} />
                    ) : status === 'marked_review' ? (
                      <AlertCircle className="w-4 h-4 text-[#956400] shrink-0" strokeWidth={2.5} />
                    ) : (
                      <Circle className="w-4 h-4 text-[#EAEAEA] shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-[#787774] px-2 py-4">
                No hay preguntas disponibles para esta opción.
              </p>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <p className="text-sm text-[#787774] max-w-[20ch]">
              Debes seleccionar la Opción A o B para ver las preguntas.
            </p>
          </div>
        )}
      </div>
      
    </aside>
  );
};
