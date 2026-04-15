import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { saveResponse } from '../../../features/workspace/workspaceSlice';
import cx from 'classnames';

export const QuestionViewer: React.FC = () => {
  const dispatch = useDispatch();
  const { activeExam, currentQuestionId, responses } = useSelector(
    (state: RootState) => state.workspace
  );

  if (!activeExam || !currentQuestionId) return null;

  const question = activeExam.questions.find((q: any) => q.id === currentQuestionId);
  
  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <p className="text-sm text-[#787774]">Pregunta no encontrada.</p>
      </div>
    );
  }

  const currentResponse = responses[question.id];

  const handleMultipleChoiceSelect = (choice: string) => {
    dispatch(saveResponse({ questionId: question.id, response: choice }));
  };

  const handleTextBlur = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    dispatch(saveResponse({ questionId: question.id, response: e.target.value }));
  };

  return (
    <div className="flex-1 bg-white p-8 md:p-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <span className="text-[#787774] text-sm mb-4 block">
          Pregunta {question.order}
          {question.max_score > 0 && ` • ${question.max_score} pt(s)`}
        </span>
        
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#111111] mb-8 leading-[1.3]">
          {question.prompt}
        </h2>

        <div className="mt-8 space-y-4">
          
          {/* MVP: Render Multiple Choice */}
          {question.type === 'multiple_choice' && question.response_format?.options?.map((opt: any) => {
            const isSelected = currentResponse === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleMultipleChoiceSelect(opt.id)}
                className={cx(
                  "w-full flex items-center p-4 rounded-lg border transition-all duration-200 active:scale-[0.99] text-left",
                  isSelected 
                    ? "border-[#111111] bg-[#111111] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                    : "border-[#EAEAEA] bg-white text-[#111111] hover:border-[#111111] hover:bg-[#FBFBFA]"
                )}
              >
                <span className={cx(
                  "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium mr-4 shrink-0 transition-colors",
                  isSelected ? "border-white/30 bg-white/10" : "border-[#EAEAEA] text-[#787774]"
                )}>
                  {opt.label}
                </span>
                <span className="text-[15px] leading-relaxed">
                  {opt.text}
                </span>
              </button>
            )
          })}

          {/* MVP: Render Short Text */}
          {question.type === 'short_text' && (
            <div className="w-full">
              <input
                type="text"
                defaultValue={currentResponse || ''}
                onBlur={handleTextBlur}
                placeholder="Introduza su respuesta corta..."
                className="w-full bg-[#FBFBFA] border border-[#EAEAEA] rounded-md px-4 py-4 text-[#111111] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all text-[15px]"
              />
            </div>
          )}

          {/* MVP: Render Long Text / Essay */}
          {(question.type === 'long_text' || question.type === 'essay_topic' || question.type === 'resource_commentary') && (
            <div className="w-full flex flex-col gap-2">
              <textarea
                defaultValue={currentResponse || ''}
                onBlur={handleTextBlur}
                placeholder="Escribe el desarrollo de la pregunta..."
                className="w-full min-h-[240px] resize-y bg-[#FBFBFA] border border-[#EAEAEA] rounded-md px-5 py-4 text-[#111111] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#111111] transition-all leading-relaxed font-serif text-[15px]"
              />
              <p className="text-xs text-[#787774] text-right">Sus cambios se guardan automáticamente.</p>
            </div>
          )}

          {/* MVP: Render True False Group */}
          {question.type === 'true_false_group' && question.parts?.map((part: any) => {
            const partResponse = currentResponse?.[part.id];
            
            const handleTFSelect = (val: boolean) => {
              const rootResp = currentResponse || {};
              dispatch(saveResponse({ 
                questionId: question.id, 
                response: { ...rootResp, [part.id]: val } 
              }));
            };

            return (
              <div key={part.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#EAEAEA] rounded-md gap-4">
                <span className="text-[15px] text-[#111111] leading-relaxed flex-1">
                  <span className="font-medium mr-2">{part.label}.</span>
                  {part.prompt}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleTFSelect(true)}
                    className={cx("px-4 py-2 text-sm font-medium border rounded-md transition-colors", partResponse === true ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-[#111111] border-[#EAEAEA] hover:border-[#111111]")}
                  >
                    V
                  </button>
                  <button
                    onClick={() => handleTFSelect(false)}
                    className={cx("px-4 py-2 text-sm font-medium border rounded-md transition-colors", partResponse === false ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-[#111111] border-[#EAEAEA] hover:border-[#111111]")}
                  >
                    F
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};
