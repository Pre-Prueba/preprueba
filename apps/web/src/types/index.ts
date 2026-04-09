export interface User {
  id: string;
  email: string;
  nombre: string | null;
  pruebaType: 'MAYORES_25' | 'MAYORES_40' | 'MAYORES_45' | null;
  comunidad: string | null;
  onboardingDone: boolean;
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
  feedbackIA: string;
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
  }[];
}
