export interface User {
  id: string;
  email: string;
  nombre: string | null;
  pruebaType: 'MAYORES_25' | 'MAYORES_40' | 'MAYORES_45' | null;
  comunidad: string | null;
  onboardingDone: boolean;
  role: 'USER' | 'ADMIN';
  fechaExamen?: string;
  avatarUrl?: string;
  phone?: string;
  provincia?: string;
  bio?: string;
  pais?: string;
}

export interface Subscription {
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
  currentPeriodEnd: string;
}

export interface Materia {
  id: string;
  nombre: string;
  descripcion: string | null;
  fase: string;
  totalPreguntas: number;
  miProgreso: {
    totalRespondidas: number;
    porcentajeAcierto: number;
    ultimaSesion: string | null;
  };
}

export interface Opcion {
  id: string;
  texto: string;
  orden: number;
}

export interface Pregunta {
  id: string;
  enunciado: string;
  tipo: 'TEST' | 'ABIERTA';
  dificultad: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
  opciones: Opcion[];
}

export interface SesionIniciada {
  sesionId: string;
  preguntas: Pregunta[];
}

export interface RespuestaResult {
  esCorrecta: boolean;
  feedback: {
    correcta: boolean;
    conceptos: string;
    explicacion: string;
    valoracion: string;
  };
  opcionCorrecta: { id: string; texto: string } | null;
  sesionProgreso: {
    respondidas: number;
    totalPreguntas: number;
    aciertosHastaAhora: number;
  };
}

export interface SesionFinalizada {
  sesionId: string;
  totalPreguntas: number;
  aciertos: number;
  porcentaje: number;
  duracionSegundos: number;
  materiaId: string;
}

export interface StatsResumen {
  totalSesiones: number;
  totalRespuestas: number;
  porcentajeAcierto: number;
  racha: number;
  porMateria: {
    materiaId: string;
    materiaNombre: string;
    totalRespondidas: number;
    porcentajeAcierto: number;
    tendencia: 'mejorando' | 'estable' | 'bajando';
    avgTime: number;
  }[];
  weeklyEvolution: { name: string; acierto: number }[];
  globalAvgTime: number;
}

export interface ForumPost {
  id: string;
  userId: string;
  materiaId: string | null;
  titulo: string;
  contenido: string;
  likesCount: number;
  isSolved: boolean;
  acceptedCommentId: string | null;
  quotePostId: string | null;
  createdAt: string;
  user: { id: string; nombre: string };
  materia: { id: string; nombre: string } | null;
  quotePost: ForumPost | null;
  _count?: { comments: number };
  comments?: ForumComment[];
}

export interface ForumComment {
  id: string;
  postId: string;
  userId: string;
  contenido: string;
  likesCount: number;
  isAccepted: boolean;
  createdAt: string;
  user: { id: string; nombre: string };
}

export * from './community';
