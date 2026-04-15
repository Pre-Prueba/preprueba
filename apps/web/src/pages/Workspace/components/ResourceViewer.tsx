import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { Map, Image as ImageIcon, BookOpen, Quote } from 'lucide-react';

export const ResourceViewer: React.FC = () => {
  const { activeExam, currentQuestionId } = useSelector((state: RootState) => state.workspace);

  if (!activeExam || !currentQuestionId) return null;

  const currentQuestion = activeExam.questions.find((q: any) => q.id === currentQuestionId);
  const resourceId = currentQuestion?.resource_id;

  if (!resourceId) return null;

  const resource = activeExam.resources[resourceId];
  if (!resource) return null;

  return (
    <div className="flex-1 bg-[#FBFBFA] border-r border-[#EAEAEA] p-8 overflow-y-auto hidden md:block">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 opacity-60">
          {resource.type === 'image' && <ImageIcon className="w-5 h-5" />}
          {resource.type === 'map' && <Map className="w-5 h-5" />}
          {resource.type === 'text_passage' && <BookOpen className="w-5 h-5" />}
          {resource.type === 'source' && <Quote className="w-5 h-5" />}
          <span className="text-xs font-semibold uppercase tracking-widest text-[#111111]">
            Documento de Apoyo
          </span>
        </div>

        {resource.type === 'text_passage' || resource.type === 'source' ? (
          <div className="prose prose-stone prose-h2:text-[#111111] prose-p:text-[#2F3437] prose-p:leading-[1.7] max-w-none">
            {/* The soft-skill typographic constraints are handled here via explicit colors and text measure */}
            <p className="text-[#2F3437] text-[15px] leading-[1.8] font-serif text-justify border-l-2 border-[#EAEAEA] pl-6 tracking-[-0.01em]">
              {resource.content}
            </p>
          </div>
        ) : (
          <div className="border border-[#EAEAEA] p-2 bg-white rounded-md shadow-sm">
            {resource.image_url ? (
              <img 
                src={resource.image_url} 
                alt={resource.alt_text || "Recurso visual de la pregunta"}
                className="w-full h-auto object-contain bg-[#FBFBFA] rounded" 
              />
            ) : (
              <div className="w-full h-64 bg-[#FBFBFA] flex flex-col items-center justify-center text-[#787774] border border-dashed border-[#EAEAEA] rounded">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Imagen no disponible</p>
              </div>
            )}
            {resource.content && (
              <p className="mt-4 text-sm text-[#787774] italic text-center px-4">
                {resource.content}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
