# PRD — Preprueba
> Documento de Producto · Versión 1.0 · Abril 2026
> **Lee este documento antes de cualquier SPEC o implementación.**

---

## 1. Qué es Preprueba

Preprueba es una plataforma SaaS donde adultos españoles que desean acceder a la universidad sin título de bachillerato pueden practicar las pruebas de acceso para mayores de 25, 40 y 45 años.

**Problema:** No existe en España un banco de preguntas interactivo para estas pruebas. Las academias presenciales cobran 300€+. Los PDFs de exámenes oficiales no tienen corrección ni feedback.

**Solución:** Banco de preguntas real + corrección automática por IA + estadísticas de progreso. Todo por 9,99€/mes.

---

## 2. Usuarios Objetivo

### Persona principal — "Carmen, 38 años"
- Trabajadora activa que quiere estudiar una carrera
- No tiene bachillerato, accede por la prueba de mayores de 40
- Estudia por las noches y los fines de semana
- No tiene dinero para academia presencial (o no puede desplazarse)
- Le cuesta encontrar material de práctica actualizado
- **Necesita:** practicar con preguntas reales, saber si lo hace bien, ver su progreso

### Persona secundaria — "Miguel, 27 años"
- Lleva años sin estudiar, quiere entrar a la universidad
- Accede por la prueba de mayores de 25
- Más cómodo con tecnología que Carmen
- **Necesita:** material organizado por materias, feedback inmediato, motivación continua

### Persona terciaria — "Rosa, 52 años"
- Prejubilada que quiere estudiar algo que le guste
- Accede por la prueba de mayores de 45
- Menos digital, necesita interfaz simple y clara
- **Necesita:** confianza, facilidad de uso, explicaciones detalladas

---

## 3. Tipos de Prueba

| Tipo | Para quién | Materias |
|------|-----------|---------|
| Mayores de 25 | Adultos sin titulación | Fase General (Lengua, Historia, Inglés) + Fase Específica (optativas) |
| Mayores de 40 | Solo experiencia laboral acreditada | Solo Fase General (Lengua, Historia, Inglés) |
| Mayores de 45 | Mayores de 45 con experiencia | Solo entrevista + Fase General simplificada |

Cada comunidad autónoma gestiona su propia prueba con variaciones en temario y formato.

---

## 4. Funcionalidades Core (MVP)

### 4.1 Autenticación
- Registro con email + contraseña
- Login
- Onboarding: elegir tipo de prueba (25/40/45) + comunidad autónoma
- JWT con expiración de 7 días

### 4.2 Suscripción
- 7 días de prueba gratuita (trial)
- Plan único: 9,99€/mes
- Pago via Stripe
- Cancelación en cualquier momento (desde Stripe portal)
- Sin suscripción activa → acceso bloqueado a práctica y estadísticas

### 4.3 Práctica de Preguntas
- Selección de materia en el dashboard
- Sesión de 10 preguntas aleatorias de la materia
- Tipos de pregunta:
  - **TEST:** 4 opciones, solo una correcta
  - **ABIERTA:** respuesta de texto libre evaluada por IA
- Feedback inmediato tras cada respuesta (generado por IA)
- Resultado final: porcentaje de aciertos + resumen

### 4.4 Estadísticas
- Sesiones totales completadas
- Porcentaje global de aciertos
- Racha de días consecutivos
- Progreso por materia (tendencia: mejorando / estable / bajando)

### 4.5 Materias Disponibles (MVP)
Las 11 materias del seed inicial:
- Fase General: Lengua Castellana, Historia de España, Lengua Extranjera (Inglés)
- Fase Específica: Matemáticas, Filosofía, Geografía, Física, Química, Biología, Historia del Arte, Economía

---

## 5. Modelo de Negocio

| Concepto | Detalle |
|----------|---------|
| Precio | 9,99€/mes (IVA incluido) |
| Trial | 7 días gratis sin tarjeta (ajustar según Stripe config) |
| Facturación | Mensual, renovación automática |
| Cancelación | Hasta fin del período en curso |
| Objetivo MRR (sep 2026) | 500 suscriptores = 4.995€/mes |

---

## 6. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Estilos | CSS Modules + CSS Custom Properties |
| Backend | Node.js + TypeScript + Express |
| ORM | Prisma |
| Base de datos | PostgreSQL (Neon serverless) |
| Auth | JWT + bcrypt |
| IA / Corrección | Groq API — modelo `openai/gpt-oss-120b` |
| Pagos | Stripe |
| Deploy frontend | Vercel |
| Deploy backend | Railway |

**Decisión clave:** Se usa Groq con `openai/gpt-oss-120b` en lugar de Anthropic Claude.
- Costo: ~0,15$/M tokens entrada, ~0,75$/M tokens salida
- A 50.000 correcciones/mes → ~11-12$/mes
- Compatible con OpenAI SDK (base_url = https://api.groq.com/openai/v1)

---

## 7. Arquitectura de Contenido

### Estrategia híbrida:
1. **Fase 1 (MVP):** IA (Groq) genera ~20 preguntas por materia = ~220 preguntas iniciales. `fuente = GENERADA`
2. **Fase 2 (post-lanzamiento):** Importación de preguntas reales de exámenes oficiales publicados por las CCAA. `fuente = OFICIAL`
3. **Fase 3 (escala):** Admin panel para curar, aprobar y enriquecer el banco

### Criterios de calidad de preguntas generadas:
- Basadas en el temario oficial de cada materia
- Nivel de dificultad distribuido: 40% básico, 40% intermedio, 20% avanzado
- Preguntas TEST: 4 opciones bien diferenciadas, una sola correcta
- Preguntas ABIERTAS: enunciado claro, respuesta de 2-5 líneas esperada
- Idioma: español ibérico (Castilla, no Latinoamérica)

---

## 8. GDPR / LOPD

**Decisión:** Compliance completo se implementa post-lanzamiento (prioridad Fase 2).

Para MVP mínimo obligatorio:
- Política de privacidad básica (enlace en footer del landing)
- Términos de uso (enlace en footer del landing)
- Checkbox de aceptación en registro

**Restricción importante:** No usar DeepSeek (datos procesados en China, incompatible con LOPD). Groq (EE.UU.) es aceptable para MVP.

---

## 9. Criterios de Éxito del MVP

| Métrica | Objetivo (septiembre 2026) |
|---------|--------------------------|
| Usuarios registrados | 2.000 |
| Suscriptores activos | 500 |
| Conversión trial → pago | >25% |
| Churn mensual | <10% |
| Preguntas en banco | >200 (20 por materia mínimo) |
| NPS | >30 |
| Uptime | >99% |

---

## 10. Fuera del Scope (MVP)

- App móvil nativa
- Modo estudio (solo leer, sin preguntas)
- Simulacro cronometrado oficial
- Comunidad / foro entre usuarios
- Planes familiares o institucionales
- Soporte por chat en vivo
- Múltiples idiomas (catalán, gallego, euskera)
- Certificados de progreso

---

## 11. Roadmap Post-MVP

| Fase | Funcionalidades |
|------|----------------|
| v1.1 (oct 2026) | Import masivo preguntas CCAA · Admin panel web |
| v1.2 (nov 2026) | Simulacro cronometrado · Modo repaso de errores |
| v1.3 (ene 2027) | GDPR compliance completo · Analytics avanzado |
| v2.0 (mar 2027) | App móvil · Planes institucionales · Comunidades CCAA |

---

## 12. SPECs de Implementación

El trabajo se divide en 10 SPECs. Cada SPEC es ejecutada por un agente independiente con contexto limpio.

| SPEC | Título | Prioridad |
|------|--------|-----------|
| [SPEC-01](specs/SPEC-01-troca-ia.md) | Troca IA: Anthropic → Groq | 🔴 Bloqueante |
| [SPEC-02](specs/SPEC-02-infra.md) | Infraestructura real (DB + Deploy) | 🔴 Bloqueante |
| [SPEC-03](specs/SPEC-03-banco-preguntas.md) | Banco de preguntas (generación IA) | 🔴 Bloqueante |
| [SPEC-04](specs/SPEC-04-practice-wiring.md) | Wiring página de práctica | 🟠 Alta |
| [SPEC-05](specs/SPEC-05-stripe.md) | Stripe end-to-end | 🟠 Alta |
| [SPEC-06](specs/SPEC-06-admin-panel.md) | Admin panel web | 🟡 Media |
| [SPEC-07](specs/SPEC-07-landing-copy.md) | Landing page + copy español | 🟡 Media |
| [SPEC-08](specs/SPEC-08-stats-dashboard.md) | Stats + Dashboard con datos reales | 🟡 Media |
| [SPEC-09](specs/SPEC-09-e2e-tests.md) | Tests E2E críticos (Playwright) | 🟢 Baja |
| [SPEC-10](specs/SPEC-10-monitoring-deploy.md) | Monitoring + Deploy final | 🟢 Baja |
