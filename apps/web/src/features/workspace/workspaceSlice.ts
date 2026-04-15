import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false_group'
  | 'short_text'
  | 'long_text'
  | 'multi_part'
  | 'resource_commentary'
  | 'essay_topic'
  | 'formula_problem';

export type WorkspaceMode = 'practice' | 'simulation' | 'review';
export type QuestionStatus = 'pending' | 'answered' | 'marked_review';

export interface Resource {
  id: string;
  type: 'image' | 'map' | 'text_passage' | 'formula_block' | 'table' | 'source';
  content: string;
  image_url?: string;
  alt_text?: string;
  zoom_enabled: boolean;
}

export interface QuestionPart {
  id: string;
  label: string; // "a", "b", "2.1"
  prompt: string;
  score: number;
  expected_response_type: string;
}

export interface Question {
  id: string;
  option_id?: string; // 'A' | 'B'
  order: number;
  title: string;
  prompt: string;
  type: QuestionType;
  max_score: number;
  estimated_time?: number;
  response_format?: any;
  resource_id?: string;
  parts?: QuestionPart[];
}

export interface ExamOption {
  exam_id: string;
  option_label: 'A' | 'B';
  warning_rule: string;
}

export interface ExamSession {
  id: string;
  comunidad: string;
  universidad: string;
  año: number;
  convocatoria: string;
  materia: string;
  duración: number;
  instrucciones_generales: string;
  options: ExamOption[];
  questions: Question[];
  resources: Record<string, Resource>;
}

export interface WorkspaceState {
  mode: WorkspaceMode;
  activeExam: ExamSession | null;
  selectedOption: 'A' | 'B' | null;
  currentQuestionId: string | null;
  responses: Record<string, any>;
  statuses: Record<string, QuestionStatus>;
  startTime: number | null;
  timeRemainingMs: number | null;
}

const initialState: WorkspaceState = {
  mode: 'practice',
  activeExam: null,
  selectedOption: null,
  currentQuestionId: null,
  responses: {},
  statuses: {},
  startTime: null,
  timeRemainingMs: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaceMode: (state, action: PayloadAction<WorkspaceMode>) => {
      state.mode = action.payload;
    },
    setActiveExam: (state, action: PayloadAction<ExamSession>) => {
      state.activeExam = action.payload;
      // Initializes statuses as 'pending'
      const statusMap: Record<string, QuestionStatus> = {};
      action.payload.questions.forEach((q) => {
        statusMap[q.id] = 'pending';
      });
      state.statuses = statusMap;
      state.responses = {};
      state.selectedOption = null;
      if (action.payload.questions.length > 0) {
        state.currentQuestionId = action.payload.questions[0].id;
      }
    },
    selectOption: (state, action: PayloadAction<'A' | 'B'>) => {
      state.selectedOption = action.payload;
      // Auto-navigate to first question of selected option if it exists
      if (state.activeExam) {
        const optionQuestions = state.activeExam.questions.filter(
          (q) => !q.option_id || q.option_id === action.payload
        );
        if (optionQuestions.length > 0) {
          state.currentQuestionId = optionQuestions[0].id;
        }
      }
    },
    setCurrentQuestionId: (state, action: PayloadAction<string>) => {
      state.currentQuestionId = action.payload;
    },
    saveResponse: (state, action: PayloadAction<{ questionId: string; response: any }>) => {
      state.responses[action.payload.questionId] = action.payload.response;
      // Se tiver uma resposta, marca como answered (a menos que já estivesse como revisão)
      if (state.statuses[action.payload.questionId] !== 'marked_review') {
        state.statuses[action.payload.questionId] = 'answered';
      }
    },
    markQuestionStatus: (state, action: PayloadAction<{ questionId: string; status: QuestionStatus }>) => {
      state.statuses[action.payload.questionId] = action.payload.status;
    },
    startSessionTimer: (state) => {
      state.startTime = Date.now();
      if (state.activeExam && state.activeExam.duración) {
        state.timeRemainingMs = state.activeExam.duración * 60 * 1000;
      }
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemainingMs = action.payload;
    },
  },
});

export const {
  setWorkspaceMode,
  setActiveExam,
  selectOption,
  setCurrentQuestionId,
  saveResponse,
  markQuestionStatus,
  startSessionTimer,
  updateTimeRemaining,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
