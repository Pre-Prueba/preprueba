# PREPRUEBA — Guía Completa de Construcción
> Documento para el agente de desarrollo (Antigravity / Claude Code)
> Versión 1.0 · Vitória Ferreira · 2026
> **LEE TODO ESTE DOCUMENTO ANTES DE ESCRIBIR CUALQUIER LÍNEA DE CÓDIGO.**

---

## ¿QUÉ ES PREPRUEBA?

Preprueba es una plataforma web SaaS donde adultos que se preparan para las pruebas de acceso a la universidad en España (mayores de 25, 40 y 45 años) pueden practicar preguntas reales de exámenes anteriores con corrección automática por IA.

**Problema que resuelve:** No existe en España un banco de preguntas interactivo para estas pruebas. Las academias cobran €300+. Los PDFs de exámenes no tienen corrección ni feedback.

**Modelo de negocio:** Suscripción mensual de €9,99/mes. Un solo plan en el MVP.

**Deadline:** Lanzamiento en septiembre 2026.

---

## DESIGN SYSTEM — LEE ESTO PRIMERO, SIEMPRE

Cada componente visual que construyas debe seguir este sistema. No inventes colores. No uses colores de librerías por defecto. Aplica siempre estas variables.

### Colores

```css
/* COLORES PRINCIPALES */
--color-carrot:        #EF8F00;   /* naranja — CTA, botones primarios, acentos */
--color-persian-blue:  #0038BC;   /* azul — headers, nav, elementos de marca */
--color-platinum:      #EEEEEE;   /* gris claro — fondos de tarjetas, inputs */

/* COLORES NEUTROS */
--color-white:         #FFFFFF;
--color-black:         #0A0A0A;
--color-text:          #1A1A1A;   /* texto principal */
--color-text-muted:    #6B6B6B;   /* texto secundario, placeholders */
--color-border:        #D8D8D8;   /* bordes de inputs y tarjetas */
--color-bg:            #F5F5F5;   /* fondo general de la app */

/* ESTADOS */
--color-success:       #1A7A4A;
--color-error:         #C0392B;
--color-warning:       #EF8F00;   /* mismo que carrot */
```

### Tipografía

```css
/* Fuente principal: Inter (Google Fonts) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

font-family: 'Inter', sans-serif;

/* Escala tipográfica */
--text-xs:   12px;
--text-sm:   14px;
--text-base: 16px;
--text-lg:   18px;
--text-xl:   22px;
--text-2xl:  28px;
--text-3xl:  36px;
--text-4xl:  48px;
```

### Espaciado

```css
/* Usar múltiplos de 4px */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Bordes y Sombras

```css
--radius-sm:  8px;
--radius-md:  12px;
--radius-lg:  16px;
--radius-xl:  24px;
--radius-full: 9999px;

--shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
--shadow-md: 0 4px 12px rgba(0,0,0,0.10);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
```

### Componentes Base

**Botón primario:**
```css
background: #EF8F00;
color: #FFFFFF;
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;
font-size: 16px;
border: none;
cursor: pointer;
transition: opacity 0.15s;

&:hover { opacity: 0.88; }
&:disabled { opacity: 0.4; cursor: not-allowed; }
```

**Botón secundario:**
```css
background: transparent;
color: #0038BC;
border: 2px solid #0038BC;
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;
```

**Input:**
```css
background: #FFFFFF;
border: 1.5px solid #D8D8D8;
border-radius: 10px;
padding: 12px 16px;
font-size: 16px;
color: #1A1A1A;
width: 100%;

&:focus {
  border-color: #0038BC;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,56,188,0.12);
}
```

**Tarjeta:**
```css
background: #FFFFFF;
border-radius: 16px;
padding: 24px;
box-shadow: 0 4px 12px rgba(0,0,0,0.08);
border: 1px solid #EEEEEE;
```

**Badge de materia:**
```css
background: #EEF2FF;   /* azul muy claro */
color: #0038BC;
border-radius: 9999px;
padding: 4px 12px;
font-size: 13px;
font-weight: 600;
```

---

## STACK TECNOLÓGICO

No cambies el stack. Cada decisión tiene un motivo.

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| Frontend | React + Vite | Stack conocido por Viví, rápido de desarrollar |
| Estilos | CSS modules o Tailwind | Sin componentes externos pesados |
| Backend | Node.js + TypeScript + Express | Tipado estricto, mismo stack que Operand |
| ORM | Prisma | Migraciones fáciles, buen DX |
| Base de datos | PostgreSQL en Neon | Serverless, gratis para empezar |
| Auth | JWT + bcrypt | Simple, sin dependencias externas |
| IA / LLM | Anthropic Claude API (claude-sonnet-4-5) | Para corrección y feedback |
| Pagos | Stripe | Estándar para SaaS |
| Deploy frontend | Vercel | Gratis, deploy automático desde git |
| Deploy backend | Railway | Fácil, plan gratuito disponible |

---

## ESTRUCTURA DE CARPETAS

Crear exactamente esta estructura. No improvisar nombres.

```
preprueba/
├── apps/
│   ├── web/                    # Frontend React + Vite
│   │   ├── src/
│   │   │   ├── components/     # Componentes reutilizables
│   │   │   │   ├── ui/         # Botones, inputs, tarjetas base
│   │   │   │   ├── layout/     # Navbar, Sidebar, PageWrapper
│   │   │   │   └── practice/   # Componentes de sesión de práctica
│   │   │   ├── pages/          # Una carpeta por página
│   │   │   │   ├── Landing/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Onboarding/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Practice/
│   │   │   │   ├── Stats/
│   │   │   │   └── Settings/
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── services/       # Llamadas a la API
│   │   │   ├── store/          # Estado global (Context o Zustand)
│   │   │   ├── types/          # TypeScript types compartidos
│   │   │   ├── utils/          # Funciones helper
│   │   │   ├── styles/         # Variables CSS globales
│   │   │   │   └── globals.css # Aquí van TODAS las variables del design system
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                    # Backend Node + Express
│       ├── src/
│       │   ├── routes/         # Una carpeta por recurso
│       │   │   ├── auth.ts
│       │   │   ├── materias.ts
│       │   │   ├── preguntas.ts
│       │   │   ├── sesiones.ts
│       │   │   └── stripe.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts     # Verificar JWT
│       │   │   └── subscription.ts  # Verificar suscripción activa
│       │   ├── services/
│       │   │   ├── claude.ts   # Toda la lógica de la API de Claude
│       │   │   └── stripe.ts   # Toda la lógica de Stripe
│       │   ├── lib/
│       │   │   └── prisma.ts   # Cliente Prisma singleton
│       │   └── index.ts        # Entry point del servidor
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts         # Datos iniciales de materias y preguntas
│       └── package.json
│
├── .env.example                # Template de variables de entorno
├── .gitignore
└── README.md
```

---

## VARIABLES DE ENTORNO

Crear `.env.example` con esto. El archivo `.env` real nunca va al repositorio.

```env
# Base de datos
DATABASE_URL="postgresql://user:password@host/preprueba"

# Auth
JWT_SECRET="cambiar-por-secreto-largo-aleatorio"
JWT_EXPIRES_IN="7d"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."   # ID del precio de €9,99/mes en Stripe

# URLs
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3000"

# Puerto del servidor
PORT=3000
```

---

## MODELO DE DATOS — PRISMA SCHEMA

Copiar esto exactamente en `prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PruebaType {
  MAYORES_25
  MAYORES_40
  MAYORES_45
}

enum TipoPregunta {
  TEST        // Opciones múltiples
  ABIERTA     // Respuesta corta
}

enum Dificultad {
  BASICO
  INTERMEDIO
  AVANZADO
}

enum FuentePregunta {
  OFICIAL     // De examen real publicado por la CCAA
  GENERADA    // Generada por IA
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  TRIALING
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  nombre            String?
  pruebaType        PruebaType?
  comunidad         String?   // Comunidad autónoma seleccionada
  onboardingDone    Boolean   @default(false)
  stripeCustomerId  String?   @unique
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  subscription      Subscription?
  sesiones          Sesion[]
  respuestas        RespuestaUsuario[]

  @@map("users")
}

model Subscription {
  id                    String             @id @default(cuid())
  userId                String             @unique
  stripeSubscriptionId  String             @unique
  status                SubscriptionStatus
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean            @default(false)
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  user                  User               @relation(fields: [userId], references: [id])

  @@map("subscriptions")
}

model Materia {
  id          String       @id @default(cuid())
  nombre      String
  descripcion String?
  pruebaType  PruebaType[] // Una materia puede estar en múltiples pruebas
  fase        String       // "GENERAL" o "ESPECIFICA"
  orden       Int          @default(0)
  activa      Boolean      @default(true)
  createdAt   DateTime     @default(now())

  preguntas   Pregunta[]
  sesiones    Sesion[]

  @@map("materias")
}

model Pregunta {
  id          String         @id @default(cuid())
  materiaId   String
  enunciado   String
  tipo        TipoPregunta   @default(TEST)
  dificultad  Dificultad     @default(INTERMEDIO)
  fuente      FuentePregunta @default(OFICIAL)
  anio        Int?           // Año del examen original
  comunidad   String?        // CCAA del examen, null = todas
  activa      Boolean        @default(true)
  createdAt   DateTime       @default(now())

  materia     Materia        @relation(fields: [materiaId], references: [id])
  opciones    Opcion[]
  respuestas  RespuestaUsuario[]

  @@map("preguntas")
}

model Opcion {
  id          String    @id @default(cuid())
  preguntaId  String
  texto       String
  esCorrecta  Boolean   @default(false)
  orden       Int       @default(0)

  pregunta    Pregunta  @relation(fields: [preguntaId], references: [id])
  respuestas  RespuestaUsuario[]

  @@map("opciones")
}

model Sesion {
  id              String    @id @default(cuid())
  userId          String
  materiaId       String
  totalPreguntas  Int
  aciertos        Int       @default(0)
  completada      Boolean   @default(false)
  duracionSegundos Int?
  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id])
  materia         Materia   @relation(fields: [materiaId], references: [id])
  respuestas      RespuestaUsuario[]

  @@map("sesiones")
}

model RespuestaUsuario {
  id               String    @id @default(cuid())
  userId           String
  preguntaId       String
  sesionId         String
  opcionId         String?   // null si la pregunta es abierta
  respuestaTexto   String?   // para preguntas abiertas
  esCorrecta       Boolean
  feedbackIA       String?   // Explicación generada por Claude
  tiempoRespuesta  Int?      // segundos que tardó en responder
  createdAt        DateTime  @default(now())

  user             User      @relation(fields: [userId], references: [id])
  pregunta         Pregunta  @relation(fields: [preguntaId], references: [id])
  sesion           Sesion    @relation(fields: [sesionId], references: [id])
  opcion           Opcion?   @relation(fields: [opcionId], references: [id])

  @@map("respuestas_usuario")
}
```

---

## BACKEND — ENDPOINTS COMPLETOS

### Auth (`/auth`)

#### POST /auth/register
```typescript
// Body
{ email: string, password: string, nombre?: string }

// Validaciones
// - email válido
// - password mínimo 8 caracteres
// - email no existente en la base de datos

// Response 201
{ user: { id, email, nombre }, token: string }

// Response 400
{ error: "Email ya registrado" }
```

#### POST /auth/login
```typescript
// Body
{ email: string, password: string }

// Response 200
{ user: { id, email, nombre, pruebaType, comunidad, onboardingDone }, token: string }

// Response 401
{ error: "Credenciales incorrectas" }
```

#### GET /auth/me
```typescript
// Header: Authorization: Bearer <token>

// Response 200
{ id, email, nombre, pruebaType, comunidad, onboardingDone, subscription: { status, currentPeriodEnd } | null }
```

#### PATCH /auth/onboarding
```typescript
// Header: Authorization: Bearer <token>
// Body
{ pruebaType: "MAYORES_25" | "MAYORES_40" | "MAYORES_45", comunidad: string }

// Response 200
{ success: true }
```

---

### Materias (`/materias`)

#### GET /materias
```typescript
// Header: Authorization: Bearer <token>
// Requiere: suscripción activa (middleware)

// Response 200
[
  {
    id: string,
    nombre: string,
    descripcion: string,
    fase: string,
    totalPreguntas: number,
    // Stats del usuario para esta materia:
    miProgreso: {
      totalRespondidas: number,
      porcentajeAcierto: number,
      ultimaSesion: Date | null
    }
  }
]
```

#### GET /materias/:id
```typescript
// Response 200
{ id, nombre, descripcion, fase, totalPreguntas, pruebaType }
```

---

### Sesiones y Práctica (`/sesiones`)

#### POST /sesiones/iniciar
```typescript
// Header: Authorization: Bearer <token>
// Body
{ materiaId: string, totalPreguntas?: number }  // default: 10 preguntas

// Response 201
{
  sesionId: string,
  preguntas: [
    {
      id: string,
      enunciado: string,
      tipo: "TEST" | "ABIERTA",
      dificultad: string,
      opciones: [{ id: string, texto: string, orden: number }]
      // IMPORTANTE: NO incluir esCorrecta en la respuesta
    }
  ]
}

// Lógica de selección de preguntas:
// 1. Obtener preguntas de la materia que el usuario NO ha respondido recientemente
// 2. Si no hay suficientes nuevas, mezclar con preguntas falladas anteriormente
// 3. Ordenar aleatoriamente
```

#### POST /sesiones/:sesionId/responder
```typescript
// Header: Authorization: Bearer <token>
// Body
{ preguntaId: string, opcionId?: string, respuestaTexto?: string, tiempoRespuesta?: number }

// Lógica interna (no exponer al frontend):
// 1. Verificar que la opción es correcta consultando la base de datos
// 2. Llamar a Claude API para generar el feedback
// 3. Guardar RespuestaUsuario en la base de datos
// 4. Devolver resultado

// Response 200
{
  esCorrecta: boolean,
  feedbackIA: string,       // Explicación de Claude
  opcionCorrecta: {         // La opción correcta, para mostrar al usuario
    id: string,
    texto: string
  },
  sesionProgreso: {
    respondidas: number,
    totalPreguntas: number,
    aciertosHastaAhora: number
  }
}
```

#### POST /sesiones/:sesionId/finalizar
```typescript
// Response 200
{
  sesionId: string,
  totalPreguntas: number,
  aciertos: number,
  porcentaje: number,
  duracionSegundos: number,
  materiaId: string
}
```

---

### Estadísticas (`/stats`)

#### GET /stats/resumen
```typescript
// Response 200
{
  totalSesiones: number,
  totalRespuestas: number,
  porcentajeAcierto: number,  // global
  racha: number,              // días consecutivos practicando
  porMateria: [
    {
      materiaId: string,
      materiaNombre: string,
      totalRespondidas: number,
      porcentajeAcierto: number,
      tendencia: "mejorando" | "estable" | "bajando"
    }
  ]
}
```

---

### Stripe (`/stripe`)

#### POST /stripe/checkout
```typescript
// Header: Authorization: Bearer <token>

// Lógica:
// 1. Crear o recuperar customer en Stripe con el email del usuario
// 2. Crear Checkout Session con el STRIPE_PRICE_ID del .env
// 3. Guardar stripeCustomerId en el usuario

// Response 200
{ checkoutUrl: string }  // Redirigir al usuario a esta URL
```

#### POST /stripe/webhook
```typescript
// Header: stripe-signature
// Raw body (no parsear como JSON — Stripe requiere el raw body)

// Eventos a manejar:
// - checkout.session.completed → crear Subscription en la base de datos
// - customer.subscription.updated → actualizar status
// - customer.subscription.deleted → marcar como CANCELLED
// - invoice.payment_failed → marcar como PAST_DUE

// Response 200 siempre (incluso si el evento no se maneja)
```

#### GET /stripe/portal
```typescript
// Redirigir al usuario al portal de Stripe para gestionar su suscripción
// Response 200
{ portalUrl: string }
```

---

## MIDDLEWARE

### Middleware de Auth (`middleware/auth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

### Middleware de Suscripción (`middleware/subscription.ts`)

```typescript
export const requireSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  if (!subscription || subscription.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Suscripción requerida', code: 'SUBSCRIPTION_REQUIRED' });
  }
  next();
};
```

---

## SERVICIO CLAUDE API (`services/claude.ts`)

Este es el servicio completo. No cambiar el prompt sin aprobación de Viví.

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface FeedbackResult {
  correcta: boolean;
  explicacion: string;
  nivel: 'básico' | 'intermedio' | 'avanzado';
}

const SYSTEM_PROMPT = `Eres un corrector experto de las pruebas de acceso a la universidad de España para mayores de 25, 40 y 45 años.

Se te proporciona:
- La pregunta
- La respuesta que dio el estudiante
- La respuesta correcta

Tu tarea:
1. Confirmar si la respuesta del estudiante es correcta
2. Explicar el concepto de forma clara, en máximo 3 frases, nivel bachillerato
3. Indicar el nivel de dificultad de la pregunta

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks:
{"correcta": boolean, "explicacion": "string", "nivel": "básico|intermedio|avanzado"}`;

export async function generarFeedback(
  enunciado: string,
  respuestaUsuario: string,
  respuestaCorrecta: string
): Promise<FeedbackResult> {
  const userMessage = `Pregunta: ${enunciado}
Respuesta del estudiante: ${respuestaUsuario}
Respuesta correcta: ${respuestaCorrecta}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as FeedbackResult;
  } catch {
    // Fallback si Claude no devuelve JSON válido
    return {
      correcta: respuestaUsuario === respuestaCorrecta,
      explicacion: 'No se pudo generar una explicación en este momento.',
      nivel: 'intermedio'
    };
  }
}
```

---

## FRONTEND — PÁGINAS Y COMPONENTES

### 1. Landing Page (`/`)

**Estructura de la página:**
1. Navbar con logo "Preprueba" (azul `#0038BC`) y botón "Empezar" (naranja `#EF8F00`)
2. Hero: Título grande, subtítulo, CTA principal
3. Sección "Cómo funciona" (3 pasos)
4. Sección de precio (una tarjeta €9,99/mes)
5. FAQ básico (4–5 preguntas)
6. Footer con logo y links

**Textos del Hero:**
```
Título: "Practica para la prueba de acceso a la universidad"
Subtítulo: "El banco de preguntas que los estudiantes adultos en España necesitaban. Corrección inmediata con IA. Sin academia. Sin compromisos."
CTA: "Empezar a practicar →"
```

**Sección de precio:**
```
Plan único: €9,99/mes
- Acceso a todas las materias
- Corrección automática con IA
- Historial de progreso
- Sin permanencia, cancela cuando quieras
CTA: "Empezar ahora"
Nota: "Sin tarjeta de crédito para el periodo de prueba"
```

---

### 2. Registro (`/register`)

**Campos:**
- Nombre (opcional)
- Email
- Contraseña (mínimo 8 caracteres)
- Botón "Crear cuenta"
- Link "¿Ya tienes cuenta? Inicia sesión"

**Comportamiento:**
- Validar en tiempo real (borde rojo + mensaje si falla)
- Al registrar exitosamente → redirigir a `/onboarding`
- Guardar JWT en `localStorage` con key `preprueba_token`

---

### 3. Login (`/login`)

**Campos:**
- Email
- Contraseña
- Botón "Iniciar sesión"
- Link "¿No tienes cuenta? Regístrate"

**Comportamiento:**
- Si `onboardingDone === false` → redirigir a `/onboarding`
- Si tiene suscripción activa → redirigir a `/dashboard`
- Si no tiene suscripción → redirigir a `/checkout`

---

### 4. Onboarding (`/onboarding`)

**Paso 1 — Selección de prueba:**
```
¿Para qué prueba te preparas?
[ Mayores de 25 años ]  [ Mayores de 40 años ]  [ Mayores de 45 años ]
```
Cards clicables. Al seleccionar, se marca en azul `#0038BC` con borde naranja `#EF8F00`.

**Paso 2 — Selección de comunidad autónoma:**
Dropdown con todas las CCAA de España.

**Paso 3 — Pantalla de bienvenida:**
```
"¡Todo listo, [nombre]!"
"Ahora empieza tu período de prueba de 7 días gratis."
Botón "Ir a practicar" → /dashboard
```

---

### 5. Dashboard (`/dashboard`)

**Layout:**
- Navbar superior con logo, nombre del usuario, y botón de perfil
- Bienvenida: "Hola, [nombre]. ¿Qué practicamos hoy?"
- Grid de materias (2 columnas en mobile, 3 en desktop)
- Widget de racha de días en la parte superior derecha

**Tarjeta de materia:**
```
┌─────────────────────────────────┐
│ [Badge de fase: GENERAL]        │
│ Lengua Castellana               │
│ y Literatura                    │
│                                 │
│ ████████░░  78% acierto         │
│ 124 preguntas respondidas       │
│                                 │
│ [ Practicar →]                  │
└─────────────────────────────────┘
```
- Background: blanco
- Border-radius: 16px
- Badge GENERAL: azul claro fondo, `#0038BC` texto
- Badge ESPECÍFICA: naranja claro fondo, `#EF8F00` texto
- Barra de progreso: `#EF8F00` sobre `#EEEEEE`
- Botón "Practicar": naranja `#EF8F00`

---

### 6. Sesión de Práctica (`/practice/:materiaId`)

**Flujo completo:**

**Estado 1 — Cargando preguntas:**
```
Spinner centrado con el color naranja #EF8F00
Texto: "Preparando tu sesión..."
```

**Estado 2 — Mostrando pregunta:**
```
┌─────────────────────────────────────────┐
│ Lengua Castellana     Pregunta 3 de 10  │
│ ████████████░░░░░░░░  [Barra progreso]  │
├─────────────────────────────────────────┤
│                                         │
│ ¿Cuál de las siguientes opciones        │
│ corresponde a una oración subordinada   │
│ adverbial causal?                       │
│                                         │
│ ○ A) "Llegó tarde porque perdió el tren"│
│ ○ B) "Estudia mucho aunque no aprueba"  │
│ ○ C) "Cuando llegues, llámame"          │
│ ○ D) "Si estudias, aprobarás"           │
│                                         │
│ [Responder →]  (deshabilitado hasta     │
│                que se seleccione)       │
└─────────────────────────────────────────┘
```

**Opciones de respuesta:**
- Sin seleccionar: borde `#D8D8D8`, fondo blanco
- Seleccionada: borde `#0038BC` (2px), fondo `#EEF2FF`
- Cursor: pointer siempre

**Estado 3 — Feedback (después de responder):**
```
Correcta:
- La opción elegida: fondo verde claro `#ECFDF5`, borde `#1A7A4A`
- Ícono ✓ verde
- Texto "¡Correcto!"

Incorrecta:
- La opción elegida: fondo rojo claro `#FEF2F2`, borde `#C0392B`
- La opción correcta: fondo verde claro `#ECFDF5`, borde `#1A7A4A`
- Ícono ✗ rojo
- Texto "Incorrecto"

En ambos casos, mostrar card de feedback:
┌─────────────────────────────────────────┐
│ 💡 Explicación                          │
│ [Texto generado por Claude API]         │
└─────────────────────────────────────────┘
Card con fondo `#FFFBEB`, borde `#EF8F00`

Botón "Siguiente pregunta →" (naranja)
```

**Estado 4 — Resultado final:**
```
┌─────────────────────────────────────────┐
│ Sesión completada 🎉                    │
│                                         │
│      7 / 10                             │
│      70% de acierto                     │
│                                         │
│ Lengua Castellana                       │
│                                         │
│ [Ver respuestas]  [Nueva sesión]        │
└─────────────────────────────────────────┘
```
- Número grande en `#EF8F00`
- Si ≥ 70%: mensaje positivo
- Si < 70%: mensaje motivacional (no negativo)

---

### 7. Estadísticas (`/stats`)

**Secciones:**
1. Resumen general (total sesiones, promedio de acierto, racha actual)
2. Progreso por materia (tabla con barra de progreso por cada materia)
3. Últimas sesiones (lista de las 10 más recientes)

---

### 8. Configuración y Pago (`/settings`)

**Secciones:**
1. Datos de cuenta (nombre, email — editable)
2. Suscripción:
   - Si activa: "Plan activo — €9,99/mes · Próximo cobro [fecha]" + botón "Gestionar suscripción" (→ portal Stripe)
   - Si no activa: card con el plan y botón "Suscribirse" (→ Stripe Checkout)
3. Cambiar contraseña
4. Cerrar sesión

---

### 9. Checkout (`/checkout`)

**Solo mostrar si el usuario no tiene suscripción activa.**

```
┌─────────────────────────────────────────┐
│ Empieza a practicar hoy                 │
│                                         │
│ Plan Preprueba                          │
│ €9,99 / mes                             │
│                                         │
│ ✓ Todas las materias                    │
│ ✓ Corrección con IA                     │
│ ✓ Historial de progreso                 │
│ ✓ Sin permanencia                       │
│                                         │
│ [Pagar con tarjeta →]                   │
│                                         │
│ Pago seguro con Stripe                  │
└─────────────────────────────────────────┘
```

Al hacer click en el botón: llamar a `POST /stripe/checkout` y redirigir a la URL devuelta.

---

## SEED DE BASE DE DATOS

El archivo `prisma/seed.ts` debe insertar las materias iniciales. Usar exactamente estos nombres:

```typescript
const materias = [
  // FASE GENERAL — para todas las pruebas
  { nombre: "Lengua Castellana y Literatura", fase: "GENERAL", orden: 1, pruebaType: ["MAYORES_25", "MAYORES_40", "MAYORES_45"] },
  { nombre: "Historia de España", fase: "GENERAL", orden: 2, pruebaType: ["MAYORES_25", "MAYORES_40", "MAYORES_45"] },
  { nombre: "Inglés", fase: "GENERAL", orden: 3, pruebaType: ["MAYORES_25", "MAYORES_40", "MAYORES_45"] },

  // FASE ESPECÍFICA — Ciencias de la Salud
  { nombre: "Biología", fase: "ESPECIFICA", orden: 4, pruebaType: ["MAYORES_25"] },
  { nombre: "Química", fase: "ESPECIFICA", orden: 5, pruebaType: ["MAYORES_25"] },

  // FASE ESPECÍFICA — Ciencias Sociales
  { nombre: "Matemáticas Aplicadas a las CCSS", fase: "ESPECIFICA", orden: 6, pruebaType: ["MAYORES_25"] },
  { nombre: "Geografía", fase: "ESPECIFICA", orden: 7, pruebaType: ["MAYORES_25"] },

  // FASE ESPECÍFICA — Humanidades
  { nombre: "Historia de la Filosofía", fase: "ESPECIFICA", orden: 8, pruebaType: ["MAYORES_25"] },
  { nombre: "Historia del Arte", fase: "ESPECIFICA", orden: 9, pruebaType: ["MAYORES_25"] },

  // FASE ESPECÍFICA — Científico-Tecnológica
  { nombre: "Matemáticas", fase: "ESPECIFICA", orden: 10, pruebaType: ["MAYORES_25"] },
  { nombre: "Física", fase: "ESPECIFICA", orden: 11, pruebaType: ["MAYORES_25"] },
];
```

---

## REGLAS OBLIGATORIAS DE DESARROLLO

Lee estas reglas antes de cada sesión de trabajo. Nunca violarlas.

### Seguridad
1. **Nunca exponer la API key de Anthropic al frontend.** Todas las llamadas a Claude van desde el backend.
2. **Nunca devolver `esCorrecta` de las opciones al frontend** antes de que el usuario responda. Solo después.
3. **Siempre validar el JWT** en cada endpoint protegido usando el middleware `requireAuth`.
4. **Siempre verificar la suscripción** antes de servir preguntas o sesiones usando `requireSubscription`.
5. **Hashear contraseñas con bcrypt** (mínimo 10 salt rounds). Nunca guardar contraseñas en texto plano.

### TypeScript
6. **TypeScript estricto en todo el backend.** `strict: true` en `tsconfig.json`. Sin `any`.
7. **Validar todos los inputs** con `zod` antes de que lleguen a la base de datos.
8. **Tipado explícito en todos los servicios.** Definir interfaces para todos los objetos que viajan entre funciones.

### Base de datos
9. **Nunca hacer queries directas a la base de datos desde los endpoints.** Toda la lógica de datos va en el servicio correspondiente o directamente con el cliente Prisma en una función dedicada.
10. **Usar transacciones de Prisma** cuando se necesite escribir en más de una tabla a la vez (ej: crear sesión y registrar respuesta).

### Frontend
11. **Guardar el JWT en `localStorage`** con la key exacta `preprueba_token`.
12. **Interceptar 401 y 403 globalmente.** Si el servidor devuelve 401 → redirigir a `/login`. Si devuelve 403 con `code: "SUBSCRIPTION_REQUIRED"` → redirigir a `/checkout`.
13. **Nunca hardcodear la URL de la API.** Usar variable de entorno `VITE_API_URL`.
14. **Estados de carga siempre visibles.** Cada operación async muestra un estado de loading antes de mostrar el resultado.

### Diseño
15. **Usar siempre las variables CSS del design system.** Nunca escribir colores hex directos en los componentes. Siempre `var(--color-carrot)`, `var(--color-persian-blue)`, etc.
16. **Mobile-first.** Diseñar para 375px primero, luego escalar a desktop.
17. **No instalar librerías de componentes UI** (no MUI, no Chakra, no Ant Design). Construir los componentes del design system desde cero siguiendo las especificaciones de este documento.

### General
18. **Cada endpoint que falle devuelve JSON**, nunca HTML de error. Formato siempre: `{ error: "Mensaje legible" }`.
19. **Logs claros en el backend.** Al iniciar el servidor, loggear en qué puerto corre y si la conexión a la base de datos fue exitosa.
20. **No hacer commits con código comentado.** Si algo no funciona, eliminarlo o arreglarlo.

---

## ORDEN DE CONSTRUCCIÓN — PASO A PASO

Seguir este orden estrictamente. No saltar pasos.

- [ ] **PASO 1** — Inicializar el monorepo: crear carpetas `apps/web` y `apps/api`, inicializar `package.json` en cada una.
- [ ] **PASO 2** — Configurar el backend: instalar dependencias (`express`, `typescript`, `prisma`, `@prisma/client`, `bcrypt`, `jsonwebtoken`, `zod`, `@anthropic-ai/sdk`, `stripe`, `cors`, `dotenv`).
- [ ] **PASO 3** — Crear `prisma/schema.prisma` con el schema completo de este documento.
- [ ] **PASO 4** — Conectar a Neon (PostgreSQL). Ejecutar `npx prisma migrate dev --name init`.
- [ ] **PASO 5** — Crear `src/lib/prisma.ts` con el cliente Prisma singleton.
- [ ] **PASO 6** — Implementar `POST /auth/register` y `POST /auth/login` con bcrypt y JWT.
- [ ] **PASO 7** — Implementar `GET /auth/me` y `PATCH /auth/onboarding` con middleware de auth.
- [ ] **PASO 8** — Implementar `GET /materias` y `GET /materias/:id` (sin datos reales aún — con seed básico).
- [ ] **PASO 9** — Crear `prisma/seed.ts` con las materias de este documento. Ejecutar el seed.
- [ ] **PASO 10** — Implementar `services/claude.ts` con la función `generarFeedback`. Testear con una pregunta de ejemplo.
- [ ] **PASO 11** — Implementar `POST /sesiones/iniciar` con lógica de selección de preguntas.
- [ ] **PASO 12** — Implementar `POST /sesiones/:id/responder` integrando `generarFeedback`.
- [ ] **PASO 13** — Implementar `POST /sesiones/:id/finalizar`.
- [ ] **PASO 14** — Implementar `GET /stats/resumen`.
- [ ] **PASO 15** — Implementar `POST /stripe/checkout`, `POST /stripe/webhook`, `GET /stripe/portal`.
- [ ] **PASO 16** — Configurar el frontend: `npm create vite@latest web -- --template react-ts`. Instalar dependencias.
- [ ] **PASO 17** — Crear `src/styles/globals.css` con **todas** las variables del design system de este documento.
- [ ] **PASO 18** — Crear componentes base en `src/components/ui/`: `Button`, `Input`, `Card`, `Badge`, `Spinner`, `ProgressBar`.
- [ ] **PASO 19** — Configurar React Router. Crear rutas para todas las páginas.
- [ ] **PASO 20** — Crear el contexto de autenticación (`AuthContext`) con estado del usuario, login, logout.
- [ ] **PASO 21** — Crear `src/services/api.ts` con las funciones de llamada a la API (fetch con el JWT automático).
- [ ] **PASO 22** — Construir página de Landing (`/`).
- [ ] **PASO 23** — Construir páginas de Auth (`/login` y `/register`).
- [ ] **PASO 24** — Construir página de Onboarding (`/onboarding`).
- [ ] **PASO 25** — Construir Dashboard (`/dashboard`) con grid de materias.
- [ ] **PASO 26** — Construir sesión de práctica (`/practice/:materiaId`) — los 4 estados: cargando, pregunta, feedback, resultado.
- [ ] **PASO 27** — Construir página de Estadísticas (`/stats`).
- [ ] **PASO 28** — Construir página de Checkout (`/checkout`) y Settings (`/settings`).
- [ ] **PASO 29** — Testear flujo completo: registro → onboarding → checkout → práctica → stats.
- [ ] **PASO 30** — Configurar deploy: frontend en Vercel, backend en Railway. Variables de entorno en producción.
- [ ] **PASO 31** — Testear en producción con Stripe en modo test. Confirmar webhooks funcionando.
- [ ] **PASO 32** — Insertar primeras preguntas reales (exámenes oficiales de Lengua e Historia).

---

## MENSAJES DE ERROR ESTÁNDAR

Usar siempre estos textos en español. Sin mensajes técnicos al usuario.

| Situación | Mensaje al usuario |
|-----------|-------------------|
| Email ya registrado | "Ya existe una cuenta con este email." |
| Credenciales incorrectas | "Email o contraseña incorrectos." |
| Sin suscripción | "Necesitas un plan activo para practicar." |
| Token expirado | "Tu sesión ha caducado. Inicia sesión de nuevo." |
| Error de red | "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo." |
| Error del servidor | "Algo salió mal. Inténtalo en unos minutos." |
| Sesión no encontrada | "Esta sesión no existe o ya ha finalizado." |

---

## NOTAS FINALES

- **El nombre del producto es Preprueba.** No "PrepruebA", no "pre-prueba". Siempre "Preprueba".
- **El precio es €9,99/mes.** No cambiarlo sin aprobación de Viví.
- **El modelo de Claude es `claude-sonnet-4-5`.** No usar versiones anteriores ni otros modelos.
- **En caso de duda sobre diseño**, aplicar las variables del design system y seguir el estilo de las pantallas descritas en este documento. Si algo no está especificado, usar los colores y el espaciado del sistema, no inventar.
- **Preguntar antes de tomar decisiones de arquitectura** que no estén en este documento.

---

*Preprueba · Vitória Ferreira · Estúdio VY · Build Document v1.0 · 2026*
*Confidencial — solo para uso interno del equipo de desarrollo*
