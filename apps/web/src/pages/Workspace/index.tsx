import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setActiveExam, setWorkspaceMode } from '../../features/workspace/workspaceSlice';
import { WorkspaceTopbar } from './components/WorkspaceTopbar';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { ResourceViewer } from './components/ResourceViewer';
import { QuestionViewer } from './components/QuestionViewer';

export const QuestionWorkspace: React.FC = () => {
  const dispatch = useDispatch();
  const activeExam = useSelector((state: RootState) => state.workspace.activeExam);

  useEffect(() => {
    dispatch(setWorkspaceMode('practice'));
    dispatch(
      setActiveExam({
        id: 'exam_demo_1',
        comunidad: 'Madrid',
        universidad: 'Universidad Complutense',
        año: 2024,
        convocatoria: 'Ordinaria',
        materia: 'Historia de España',
        duración: 90,
        instrucciones_generales: 'Responda a las preguntas de la Opción A o de la Opción B.',
        options: [
          { exam_id: 'exam_demo_1', option_label: 'A', warning_rule: 'Solo puedes responder a las preguntas de la Opción A.' },
          { exam_id: 'exam_demo_1', option_label: 'B', warning_rule: 'Solo puedes responder a las preguntas de la Opción B.' },
        ],
        questions: [
          {
            id: 'q1',
            option_id: 'A',
            order: 1,
            title: 'Análisis de Fuente Histórica',
            prompt: 'Analice el siguiente fragmento del Manifiesto de los Persas y comente su importancia en la restauración del absolutismo.',
            type: 'resource_commentary',
            max_score: 3,
            resource_id: 'res1',
          },
          {
            id: 'q2',
            option_id: 'A',
            order: 2,
            title: 'Conceptos Cortos',
            prompt: 'Describa brevemente en qué consistió el motín de Aranjuez.',
            type: 'short_text',
            max_score: 1.5,
          },
          {
            id: 'q3',
            option_id: 'B',
            order: 1,
            title: 'Test de Conocimiento',
            prompt: '¿Qué constitución española fue conocida popularmente como "La Pepa"?',
            type: 'multiple_choice',
            max_score: 1,
            response_format: {
              options: [
                { id: 'opt1', label: 'A', text: 'Constitución de 1812' },
                { id: 'opt2', label: 'B', text: 'Estatuto Real de 1834' },
                { id: 'opt3', label: 'C', text: 'Constitución de 1876' },
                { id: 'opt4', label: 'D', text: 'Constitución de 1931' },
              ]
            }
          },
          {
            id: 'q4',
            option_id: 'B',
            order: 2,
            title: 'Verdadero o Falso',
            prompt: 'Indique si las siguientes afirmaciones son verdaderas o falsas.',
            type: 'true_false_group',
            max_score: 2,
            parts: [
              { id: 'p1', label: '2.1', prompt: 'La I República Española duró menos de dos años.', score: 0.5, expected_response_type: 'boolean' },
              { id: 'p2', label: '2.2', prompt: 'El Desastre de Annual ocurrió en 1898.', score: 0.5, expected_response_type: 'boolean' },
            ]
          }
        ],
        resources: {
          'res1': {
            id: 'res1',
            type: 'text_passage',
            content: 'Señor: Era costumbre en los antiguos persas pasar cinco días en anarquía después del fallecimiento de su rey, a fin de que la experiencia de los asesinatos, robos y otras desgracias les obligase a ser más fieles a su sucesor. Para serlo España a V. M. no necesitaba igual ensayo en los seis años de su cautividad...',
            zoom_enabled: false,
          }
        },
      })
    );
  }, [dispatch]);

  if (!activeExam) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[#FBFBFA] font-sans">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <p className="text-sm text-gray-500">Preparando entorno de examen...</p>
        </div>
      </div>
    );
  }

  // Verifica se a questão atual requer split screen (tem um resource_id)
  const currentQuestionId = useSelector((state: RootState) => state.workspace.currentQuestionId);
  const currentQuestion = activeExam.questions.find((q: any) => q.id === currentQuestionId);
  const hasResource = !!currentQuestion?.resource_id;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#FBFBFA] text-[#111111] font-sans selection:bg-[#E1F3FE] selection:text-[#1F6C9F]">
      <WorkspaceTopbar />
      
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar />
        
        <main className="flex-1 flex overflow-hidden">
          {hasResource ? (
             <>
               <ResourceViewer />
               <QuestionViewer />
             </>
          ) : (
            <div className="flex-1 flex flex-col relative w-full h-full">
              {currentQuestionId ? (
                <>
                  <div className="px-8 py-6 mb-4 max-w-4xl w-full mx-auto">
                     <p className="text-[#787774] text-base leading-relaxed">
                       {activeExam.instrucciones_generales}
                     </p>
                  </div>
                  <QuestionViewer />
                </>
              ) : (
                <div className="flex justify-center items-center py-24 m-8 border border-dashed border-[#EAEAEA] rounded-lg">
                   <p className="text-sm text-[#787774]">Seleccione una pregunta para continuar</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default QuestionWorkspace;
