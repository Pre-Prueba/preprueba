import type { Materia, SesionIniciada, RespuestaResult, SesionFinalizada, StatsResumen, User, Subscription } from '../types';

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
};

// Materias
export const materias = {
  list: () => request<Materia[]>('/materias'),
  get: (id: string) => request<Materia>(`/materias/${id}`),
};

// Sesiones
export const sesiones = {
  iniciar: (materiaId: string, totalPreguntas = 10) =>
    request<SesionIniciada>('/sesiones/iniciar', {
      method: 'POST',
      body: JSON.stringify({ materiaId, totalPreguntas }),
    }),

  responder: (sesionId: string, data: { preguntaId: string; opcionId?: string; respuestaTexto?: string; tiempoRespuesta?: number }) =>
    request<RespuestaResult>(`/sesiones/${sesionId}/responder`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  finalizar: (sesionId: string) =>
    request<SesionFinalizada>(`/sesiones/${sesionId}/finalizar`, { method: 'POST' }),
};

// Stats
export const stats = {
  resumen: () => request<StatsResumen>('/stats/resumen'),
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
