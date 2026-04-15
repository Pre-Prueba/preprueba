import type { Materia, SesionIniciada, RespuestaResult, SesionFinalizada, StatsResumen, User, Subscription, ForumPost, ForumComment } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'preprueba_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    if (token && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')) {
      clearToken();
      throw new Error(data.error ?? 'Sesión expirada');
    }
    throw new Error(data.error ?? 'Acceso no autorizado');
  }

  if (res.status === 403) {
    const data = await res.json() as { code?: string; error?: string };
    if (data.code === 'SUBSCRIPTION_REQUIRED') {
      throw new Error('SUBSCRIPTION_REQUIRED');
    }
    throw new Error(data.error ?? 'Acceso denegado');
  }

  if (!res.ok) {
    const data = await res.json() as { error?: string };
    throw new Error(data.error ?? 'Algo salió mal. Inténtalo en unos minutos.');
  }

  return res.json() as Promise<T>;
}

// Auth
export const auth = {
  register: (email: string, password: string, nombre?: string) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre }),
    }),

  login: (email: string, password: string) =>
    request<{ user: User; subscription: Subscription | null; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User & { subscription: Subscription | null }>('/auth/me'),

  onboarding: (pruebaType: string, comunidad: string) =>
    request<{ success: boolean }>('/auth/onboarding', {
      method: 'PATCH',
      body: JSON.stringify({ pruebaType, comunidad }),
    }),

  update: (data: { 
    nombre?: string; 
    fechaExamen?: string;
    phone?: string;
    provincia?: string;
    bio?: string;
    pais?: string;
  }) =>
    request<{ success: boolean; user: User }>('/auth/update', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  uploadAvatar: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${API_URL}/auth/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? 'Error al subir la imagem');
    }

    return res.json() as Promise<{ success: boolean; avatarUrl: string }>;
  },
};

// Materias
export const materias = {
  list: () => request<Materia[]>('/materias'),
  get: (id: string) => request<Materia>(`/materias/${id}`),
};

// Sesiones
export const sesiones = {
  iniciar: (
    materiaId: string,
    params?: {
      totalPreguntas?: number;
      tipo?: string;
      codigo?: string;
      tema?: string;
      soloNoRespondidas?: boolean;
    }
  ) =>
    request<SesionIniciada>('/sesiones/iniciar', {
      method: 'POST',
      body: JSON.stringify({ materiaId, ...params }),
    }),

  responder: (sesionId: string, data: { preguntaId: string; opcionId?: string; respuestaTexto?: string; tiempoRespuesta?: number }) =>
    request<RespuestaResult>(`/sesiones/${sesionId}/responder`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  finalizar: (sesionId: string) =>
    request<SesionFinalizada>(`/sesiones/${sesionId}/finalizar`, { method: 'POST' }),

  pausar: (sesionId: string, currentIndex: number) =>
    request<{ success: boolean; estado: string }>(`/sesiones/${sesionId}/pausar`, {
      method: 'POST',
      body: JSON.stringify({ currentIndex }),
    }),

  historial: () => request<any[]>('/sesiones/historial'),
  
  detalles: (id: string) => request<any>(`/sesiones/${id}/detalles`),
};

// Stats
export const stats = {
  resumen: () => request<StatsResumen>('/stats/resumen'),
  tips: () => request<string[]>('/stats/tips'),
  ranking: () => request<{id: string, nombre: string, aciertos: number}[]>('/stats/ranking'),
};

// Stripe
export const stripe = {
  checkout: () => request<{ checkoutUrl: string }>('/stripe/checkout', { method: 'POST' }),
  portal: () => request<{ portalUrl: string }>('/stripe/portal'),
};

// Admin
export const admin = {
  listPreguntas: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{
      preguntas: Array<{
        id: string;
        enunciado: string;
        tipo: 'TEST' | 'ABIERTA';
        dificultad: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
        fuente: 'OFICIAL' | 'GENERADA';
        activa: boolean;
        materiaNombre: string;
        materiaId: string;
        opciones: { id: string; texto: string; esCorrecta: boolean; orden: number }[];
        createdAt: string;
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/preguntas?${qs}`);
  },

  getPregunta: (id: string) => request<unknown>(`/admin/preguntas/${id}`),

  createPregunta: (data: Record<string, unknown>) =>
    request<unknown>('/admin/preguntas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePregunta: (id: string, data: Record<string, unknown>) =>
    request<unknown>(`/admin/preguntas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  togglePregunta: (id: string) =>
    request<{ id: string; activa: boolean }>(`/admin/preguntas/${id}/toggle`, {
      method: 'PATCH',
    }),

  deletePregunta: (id: string) =>
    request<{ success: boolean }>(`/admin/preguntas/${id}`, {
      method: 'DELETE',
    }),

  importCSV: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/admin/preguntas/import`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? 'Error al importar');
    }

    return res.json() as Promise<{
      insertadas: number;
      errores: number;
      total: number;
      detalle: { fila: number; status: 'ok' | 'error'; error?: string; enunciado?: string }[];
    }>;
  },

  stats: () =>
    request<{ materiaId: string; nombre: string; activas: number; inactivas: number; total: number }[]>('/admin/stats'),
};

// Planner
export const planner = {
  get: () => request<any[]>('/planner'),
  sync: (tasks: any[]) => request<{ count: number }>('/planner/sync', {
    method: 'POST',
    body: JSON.stringify({ tasks }),
  }),
  toggleTask: (id: string, completada: boolean) => request<any>(`/planner/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completada }),
  }),
  suggest: () => request<any[]>('/planner/suggest', {
    method: 'POST',
  }),
};

// Forum
export const forum = {
  list: (params?: { materiaId?: string; page?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<ForumPost[]>(`/forum?${qs}`);
  },
  get: (id: string) => request<ForumPost>(`/forum/${id}`),
  create: (data: { titulo: string; contenido: string; materiaId?: string; quotePostId?: string }) =>
    request<ForumPost>('/forum', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  comment: (postId: string, contenido: string) =>
    request<ForumComment>(`/forum/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ contenido }),
    }),
  accept: (postId: string, commentId: string) =>
    request<{ success: boolean }>(`/forum/${postId}/comments/${commentId}/accept`, {
      method: 'PATCH',
    }),
  deletePost: (id: string) => request(`/forum/${id}`, { method: 'DELETE' }),
  reportPost: (id: string, razon: string) =>
    request(`/forum/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ razon }),
    }),
  likePost: (id: string) =>
    request<{ likes: number }>(`/forum/posts/${id}/like`, { method: 'POST' }),
  likeComment: (id: string) =>
    request<{ likes: number }>(`/forum/comments/${id}/like`, { method: 'POST' }),
};

// Errores
export const errores = {
  list: (params?: { materiaId?: string; tema?: string; revisado?: boolean; page?: number }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString();
    return request<{ items: ErrorItem[]; total: number; page: number; pages: number }>(`/errores?${qs}`);
  },
  marcarRevisado: (id: string, revisado = true) =>
    request<{ success: boolean }>(`/errores/${id}/revisado`, {
      method: 'PATCH',
      body: JSON.stringify({ revisado }),
    }),
};

// Favoritos
export const favoritos = {
  list: (params?: { materiaId?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<FavoritoItem[]>(`/favoritos?${qs}`);
  },
  add: (preguntaId: string) =>
    request<{ success: boolean }>('/favoritos', {
      method: 'POST',
      body: JSON.stringify({ preguntaId }),
    }),
  remove: (preguntaId: string) =>
    request<{ success: boolean }>(`/favoritos/${preguntaId}`, { method: 'DELETE' }),
};

// Flashcards
export const flashcards = {
  list: (params?: { materiaId?: string; estado?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<FlashcardItem[]>(`/flashcards?${qs}`);
  },
  create: (data: { frente: string; dorso: string; preguntaId?: string; materiaId?: string }) =>
    request<FlashcardItem>('/flashcards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEstado: (id: string, estado: 'pendiente' | 'facil' | 'dificil') =>
    request<{ success: boolean }>(`/flashcards/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/flashcards/${id}`, { method: 'DELETE' }),
};

// Examenes
export const examenes = {
  list: (params?: { materiaId?: string; comunidad?: string; anio?: number }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString();
    return request<{ examenes: ExamenItem[]; comunidades: string[]; anios: number[] }>(`/examenes?${qs}`);
  },
  getPreguntas: (key: string) =>
    request<{ preguntas: any[]; total: number }>(`/examenes/${key}/preguntas`),
};

// Exam Docs library
export const examDocs = {
  stats: () =>
    request<{ numCommunities: number; numUniversities: number; numSubjects: number; numDocuments: number }>('/exam-docs/stats'),

  list: (params?: {
    subject?: string;
    community?: string;
    university?: string;
    year?: number;
    call?: string;
    documentType?: string;
    soloOficiales?: boolean;
    soloInteractivos?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined && v !== '' && v !== false)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return request<{ docs: ExamDocItem[]; total: number; page: number; facets: ExamDocFacets }>(`/exam-docs?${qs}`);
  },

  recent: () => request<{ docs: ExamDocItem[] }>('/exam-docs/recent'),

  get: (id: string) => request<{ doc: ExamDocItem }>(`/exam-docs/${id}`),
};

// Simulacros
export const simulacros = {
  modos: () => request<{ modos: SimulacroModo[] }>('/simulacros'),
  iniciar: (modo: 'rapido' | 'materia', materiaId?: string) =>
    request<{ materiaId: string; totalPreguntas: number; duracionSegundos: number; modo: string; redirectTo: string }>('/simulacros/iniciar', {
      method: 'POST',
      body: JSON.stringify({ modo, materiaId }),
    }),
};

// Tipos locais para os novos módulos
export interface ErrorItem {
  id: string;
  preguntaId: string;
  sesionId: string;
  revisado: boolean;
  createdAt: string;
  pregunta: {
    id: string;
    enunciado: string;
    tipo: string;
    tema: string | null;
    materia: { id: string; nombre: string; fase: string };
    opciones: { id: string; texto: string; esCorrecta: boolean; orden: number }[];
  };
  opcion: { id: string; texto: string } | null;
}

export interface FavoritoItem {
  id: string;
  preguntaId: string;
  createdAt: string;
  pregunta: {
    id: string;
    enunciado: string;
    tipo: string;
    tema: string | null;
    materia: { id: string; nombre: string; fase: string };
    opciones: { id: string; texto: string; esCorrecta: boolean; orden: number }[];
  };
}

export interface FlashcardItem {
  id: string;
  frente: string;
  dorso: string;
  estado: 'pendiente' | 'facil' | 'dificil';
  preguntaId: string | null;
  materiaId: string | null;
  createdAt: string;
  materia: { id: string; nombre: string } | null;
  pregunta: { id: string; enunciado: string } | null;
}

export interface ExamenItem {
  key: string;
  materiaId: string;
  materiaNombre: string;
  materiaFase: string;
  anio: number;
  comunidad: string;
  universidad: string | null;
  totalPreguntas: number;
  duracionEstimadaMin: number;
}

export type TipoDocumento =
  | 'EXAMEN_OFICIAL'
  | 'MODELO'
  | 'CONVOCATORIA_ANTERIOR'
  | 'ORIENTACIONES'
  | 'CRITERIOS_CORRECCION'
  | 'SOLUCIONARIO';

export type DocumentoStatus =
  | 'FOUND'
  | 'DOWNLOADED'
  | 'CATALOGUED'
  | 'REVIEWED'
  | 'PUBLISHED'
  | 'INTERACTIVE_READY';

export interface ExamDocItem {
  id: string;
  title: string;
  subject: string;
  community: string;
  university: string;
  year: number;
  call: string | null;
  documentType: TipoDocumento;
  sourceUrl: string;
  sourceName: string;
  pdfUrl: string | null;
  isOfficial: boolean;
  isInteractive: boolean;
  status: DocumentoStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamDocFacets {
  communities: string[];
  universities: string[];
  subjects: string[];
  years: number[];
}

export interface SimulacroModo {
  id: string;
  nombre: string;
  descripcion: string;
  totalPreguntas: number;
  duracionMin: number;
  tipo: string;
  proximamente?: boolean;
}
