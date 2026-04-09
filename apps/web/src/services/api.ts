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
    clearToken();
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  if (res.status === 403) {
    const data = await res.json() as { code?: string };
    if (data.code === 'SUBSCRIPTION_REQUIRED') {
      window.location.href = '/checkout';
      throw new Error('Suscripción requerida');
    }
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
