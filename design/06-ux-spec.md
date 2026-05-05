# UX Spec: Preprueba Site Publico

## Overview

Preprueba e um SaaS para adultos na Espanha que preparam as pruebas de acceso a la universidad para mayores de 25, 40 e 45 anos. O site publico deve converter visitantes frios em contas criadas, explicando rapido para quem e, como funciona, quanto custa e por que e mais pratico que PDFs soltos ou academia cara.

Este documento define o wireframe consolidado da home, com copy real em espanhol iberico, pronto para orientar a proxima implementacao em `apps/web/src/pages/Landing`.

---

## Decisoes De Produto Para A Landing

### Foco

Focar em **pruebas de acceso para mayores +25/+40/+45**. Evitar usar "PAU" como promessa principal, porque PAU/EBAU geral amplia demais o publico e dilui a proposta.

### PIPO

PIPO entra como apoio visual e elemento de habito, nao como promessa central do hero. O primeiro contato precisa vender clareza, confianca e utilidade.

### Claims Permitidos

- "Preguntas tipo examen"
- "Correccion inmediata"
- "Explicaciones claras"
- "Progreso por materia"
- "Sesiones cortas"
- "9,99 EUR/mes"
- "Cancela cuando quieras"

### Claims A Evitar Ate Haver Prova

- "Aprobacion garantizada"
- "Historias reales" se forem ficticias
- "Miles de preguntas" se o banco ainda nao tiver esse volume
- "Preguntas oficiales" como claim absoluto
- "Sin tarjeta" ate confirmar a configuracao real do Stripe/trial
- Numeros de aprovacao ou nota media sem fonte verificavel

---

## Information Architecture

### Navigation Structure

```text
Preprueba
├── Home (/)
│   ├── Como funciona
│   ├── Pruebas
│   ├── Materias
│   ├── Demo
│   ├── Precio
│   └── FAQ
├── Login (/login)
├── Registro (/register)
├── Privacidad (/privacidad)
└── Terminos (/terminos)
```

### Post-MVP SEO Structure

```text
Preprueba
├── /mayores-25
├── /mayores-40
├── /mayores-45
├── /materias
│   ├── /materias/lengua-castellana
│   ├── /materias/historia-espana
│   └── /materias/ingles
└── /recursos
    ├── /recursos/guia-acceso-mayores-25
    ├── /recursos/diferencias-25-40-45
    └── /recursos/fechas-comunidades
```

### Key User Paths

1. **Visitante con dolor claro:** Google/redes -> Home -> Hero -> Demo -> Registro.
2. **Visitante desconfiado:** Home -> Comparacion -> FAQ -> Precio -> Registro.
3. **Visitante por prueba:** Home -> Card "+25/+40/+45" -> Registro.
4. **Visitante retornando:** Home -> Login -> Dashboard.

---

## Home Wireframe Consolidado

### Screen: Home

**URL/Route:** `/`

**Purpose:** Explicar Preprueba, construir confianca e levar o usuario a criar conta.

**Entry points:** Busca organica, link social, indicacao, campanha paga, footer/legal.

#### Desktop Layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Logo       Como funciona  Pruebas  Materias  Demo  Precio  FAQ      │
│                                             Entrar  [Empieza gratis] │
├─────────────────────────────────────────────────────────────────────┤
│ HERO                                                                │
│ H1 + lead + CTAs + proof chips           Product demo card           │
├─────────────────────────────────────────────────────────────────────┤
│ TRUST STRIP                                                         │
│ +25/+40/+45 | Sesiones cortas | Correccion inmediata | 9,99 EUR/mes  │
├─────────────────────────────────────────────────────────────────────┤
│ PROBLEMA                                                            │
│ PDFs sueltos + academias caras -> practica guiada y medible          │
├─────────────────────────────────────────────────────────────────────┤
│ COMO FUNCIONA                                                        │
│ 1. Elige prueba y comunidad | 2. Practica | 3. Corrige y revisa      │
├─────────────────────────────────────────────────────────────────────┤
│ PRUEBAS                                                              │
│ Card +25 | Card +40 | Card +45                                       │
├─────────────────────────────────────────────────────────────────────┤
│ DEMO INTERACTIVA / PRODUCTO POR DENTRO                               │
│ Tabs: Practica | Feedback | Errores | Progreso                       │
├─────────────────────────────────────────────────────────────────────┤
│ MATERIAS                                                             │
│ Chips/lista + nota de cobertura inicial                              │
├─────────────────────────────────────────────────────────────────────┤
│ COMPARACION                                                          │
│ PDFs sueltos vs academia vs Preprueba                                │
├─────────────────────────────────────────────────────────────────────┤
│ PRECIO                                                               │
│ Plan unico + CTA + cancelacion                                       │
├─────────────────────────────────────────────────────────────────────┤
│ FAQ                                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ FINAL CTA                                                            │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER legal + aviso no afiliacion oficial                           │
└─────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout

```text
┌─────────────────────────────┐
│ Logo             [CTA]      │
├─────────────────────────────┤
│ H1                          │
│ Lead                        │
│ [Empieza gratis]            │
│ [Ver demo]                  │
│ Chips stacked               │
├─────────────────────────────┤
│ Product demo card           │
├─────────────────────────────┤
│ Trust strip stacked         │
├─────────────────────────────┤
│ Sections in one column      │
└─────────────────────────────┘
```

---

## Section Specs And Copy

### 1. Header

**Purpose:** Navegacao curta e CTA constante.

**Nav labels:**

- Como funciona
- Pruebas
- Materias
- Demo
- Precio
- FAQ

**Actions:**

- `Entrar` -> `/login`
- `Empieza gratis` -> `/register`

**Behavior:**

- Desktop: sticky, links visiveis.
- Mobile: logo + CTA. Menu hamburguer opcional, mas nao obrigatorio para MVP se a pagina for curta.

---

### 2. Hero

**Goal:** Em 5 segundos, o usuario entende se serve para ele.

**Copy:**

```text
Eyebrow:
Pruebas de acceso +25, +40 y +45

H1:
Practica la prueba de acceso para mayores sin academia.

Lead:
Prepara tu acceso a la universidad con preguntas tipo examen, correccion inmediata y sesiones cortas para estudiar incluso si trabajas.

Primary CTA:
Empieza gratis

Secondary CTA:
Ver una pregunta demo

Microcopy:
9,99 EUR/mes · Sin permanencia · Cancela cuando quieras
```

**Hero visual:**

Use a product card, not an abstract illustration. It should show:

- Question progress: `Pregunta 4 de 10`
- Subject: `Lengua Castellana`
- Multiple choice options
- Feedback block
- Small progress stat

**Hero product mockup copy:**

```text
Lengua Castellana
Pregunta 4 de 10

¿Cual de estas opciones expresa mejor la idea principal del texto?

A. ...
B. ...
C. ...
D. ...

Feedback inmediato
La respuesta correcta es B. La idea principal resume el argumento central, no un detalle secundario.
```

**Do not include:**

- Fake approval rates
- Fake testimonials
- "Sin tarjeta" unless confirmed
- Huge PIPO as the main hero object

---

### 3. Trust Strip

**Purpose:** Reduzir ansiedade logo abaixo do hero.

**Copy:**

```text
+25, +40 y +45
Adaptado a las vias de acceso para mayores.

Sesiones de 10-15 min
Para estudiar en bloques cortos.

Correccion inmediata
Explicaciones claras al responder.

9,99 EUR/mes
Un plan simple, sin permanencia.
```

---

### 4. Problem Section

**Purpose:** Nomear a dor sem dramatizar.

**Copy:**

```text
Eyebrow:
EL PROBLEMA

H2:
Preparar la prueba por tu cuenta no deberia ser tan desordenado.

Body:
Los examenes en PDF ayudan, pero no te dicen si vas mejorando. Las academias pueden funcionar, pero no siempre encajan con tu horario ni con tu bolsillo. Preprueba convierte la practica en un sistema claro: eliges materia, respondes, corriges y ves tu progreso.
```

**Cards:**

```text
PDFs sueltos
Tienes material, pero no seguimiento.

Academia tradicional
Mas apoyo, pero mas coste y horarios fijos.

Preprueba
Practica guiada, feedback inmediato y progreso visible.
```

---

### 5. How It Works

**Purpose:** Explicar mecanismo de valor.

**Copy:**

```text
Eyebrow:
COMO FUNCIONA

H2:
Tres pasos para practicar con menos caos.

Step 1:
Elige tu prueba y comunidad
Selecciona si preparas acceso +25, +40 o +45 y ajusta tu contexto.

Step 2:
Practica por materia
Haz sesiones cortas con preguntas tipo examen y dificultad progresiva.

Step 3:
Corrige y revisa errores
Recibe una explicacion al momento y vuelve sobre lo que mas necesitas reforzar.
```

**Interaction:**

- Cards can reveal a small product preview on hover/click.
- Mobile uses stacked cards.

---

### 6. Test Type Cards

**Purpose:** Confirmar cobertura do caso de uso.

**Copy:**

```text
Eyebrow:
PARA QUE PRUEBA TE PREPARAS

H2:
Elige la via que encaja contigo.
```

**Cards:**

```text
Mayores de 25
Para adultos que quieren acceder a la universidad sin bachillerato. Incluye fase general y materias especificas segun itinerario.
CTA: Preparar acceso +25

Mayores de 40
Para personas con experiencia profesional relacionada con los estudios que quieren cursar. Te ayudamos a practicar la parte comun cuando aplique.
CTA: Preparar acceso +40

Mayores de 45
Para quienes buscan acceder por la via de mayores de 45. Practica comprension, expresion y materias de base.
CTA: Preparar acceso +45
```

**Small note:**

```text
Cada comunidad autonoma puede tener requisitos y formatos propios. Comprueba siempre la convocatoria oficial de tu universidad o comunidad.
```

---

### 7. Product Demo Section

**Purpose:** Mostrar o produto real antes de pedir cadastro.

**Copy:**

```text
Eyebrow:
POR DENTRO

H2:
Practica, corrige y entiende que mejorar.

Body:
No se trata solo de acumular preguntas. La clave es saber que fallas, por que fallas y que deberias practicar despues.
```

**Tabs:**

1. `Practica`
2. `Feedback`
3. `Errores`
4. `Progreso`

**Tab content:**

```text
Practica:
Sesiones de 10 preguntas por materia, pensadas para avanzar incluso con poco tiempo.

Feedback:
Correccion inmediata con una explicacion breve y clara.

Errores:
Guarda lo que fallas para repasarlo despues.

Progreso:
Ve tu porcentaje de acierto, sesiones completadas y avance por materia.
```

**Interaction:**

- Desktop: tabs update mockup.
- Mobile: accordion or stacked previews.

---

### 8. Subjects Section

**Purpose:** Cobertura curricular clara.

**Copy:**

```text
Eyebrow:
MATERIAS

H2:
Empieza por las materias que mas pesan en tu prueba.

Body:
Preprueba organiza la practica por materias para que no pierdas tiempo buscando que estudiar.
```

**Subject chips:**

- Lengua Castellana y Literatura
- Historia de Espana
- Ingles
- Matematicas
- Matematicas Aplicadas a las CCSS
- Biologia
- Quimica
- Geografia
- Historia de la Filosofia
- Historia del Arte
- Fisica

**Coverage note:**

```text
El banco de preguntas esta en crecimiento. Algunas preguntas son de fuente generada y otras estaran basadas en examenes oficiales publicados por comunidades autonomas.
```

If the current database already distinguishes `OFICIAL` and `GENERADA`, future implementation can show the source transparently.

---

### 9. Comparison Section

**Purpose:** Posicionar sem inventar numeros.

```text
Eyebrow:
COMPARA

H2:
Mas practico que estudiar con PDFs sueltos. Mas flexible que una academia.
```

| | PDFs sueltos | Academia tradicional | Preprueba |
|---|---|---|---|
| Practica interactiva | No | Depende | Si |
| Correccion inmediata | No | Depende | Si |
| Progreso por materia | No | Depende | Si |
| Estudiar cuando puedas | Si | Limitado | Si |
| Coste bajo | Si | No | Si |
| Guia diaria | No | Depende | Si |

**CTA below table:**

```text
Empieza con una sesion corta y comprueba si te ayuda.
```

---

### 10. Pricing Section

**Purpose:** Fechar objeção de preço e cancelamento.

**Copy:**

```text
Eyebrow:
PRECIO SIMPLE

H2:
Un plan para practicar sin complicarte.

Plan:
Preprueba
9,99 EUR / mes

Includes:
- Acceso a las materias disponibles
- Sesiones de practica por materia
- Correccion inmediata con IA
- Historial de progreso
- Revision de errores
- Cancelacion cuando quieras

CTA:
Empieza gratis

Microcopy:
Pago seguro con Stripe. Sin permanencia.
```

**Important:** If Stripe trial requires card, do not show "sin tarjeta".

---

### 11. FAQ

**Purpose:** Resolver objeções comuns.

```text
Q: Para quien es Preprueba?
A: Para adultos que preparan las pruebas de acceso a la universidad para mayores de 25, 40 o 45 anos en Espana y quieren practicar de forma organizada.

Q: Sirve para mi comunidad autonoma?
A: Preprueba permite adaptar tu perfil por comunidad autonoma. Aun asi, cada convocatoria puede cambiar, asi que conviene comprobar siempre la informacion oficial de tu universidad o comunidad.

Q: Las preguntas son oficiales?
A: El objetivo es combinar preguntas basadas en el formato de examenes oficiales con preguntas generadas y revisadas para ampliar la practica. Cuando una pregunta tenga fuente oficial, debe indicarse dentro de la plataforma.

Q: Como funciona la correccion con IA?
A: Al responder, la plataforma analiza tu respuesta y te muestra si es correcta junto con una explicacion breve para entender el error o reforzar el concepto.

Q: Puedo cancelar cuando quiera?
A: Si. No hay permanencia. Puedes cancelar desde tu cuenta y conservar el acceso hasta el final del periodo activo.

Q: Necesito instalar algo?
A: No. Preprueba funciona desde el navegador, en ordenador, tablet o movil.
```

---

### 12. Final CTA

**Copy:**

```text
H2:
Empieza con una sesion corta.

Body:
Crea tu cuenta, elige tu prueba y practica la primera materia sin perderte entre PDFs.

CTA:
Empieza gratis
```

PIPO can appear here as a small supportive element.

---

### 13. Footer

**Columns:**

```text
Producto
- Como funciona
- Pruebas
- Materias
- Precio

Cuenta
- Entrar
- Crear cuenta

Legal
- Privacidad
- Terminos
- Contacto
```

**Legal note:**

```text
Preprueba no esta afiliada a ningun organismo oficial, universidad o administracion publica. Consulta siempre la convocatoria oficial de tu comunidad autonoma o universidad.
```

**Copyright:**

```text
© 2026 Preprueba. Todos los derechos reservados.
```

---

## Components

### Component: PublicHeader

**Used in:** Home and future SEO pages.

**Purpose:** Brand, navigation and CTA.

**Variants:**

- Desktop sticky header
- Mobile compact header

**Actions:**

- Internal anchor scroll
- Login link
- Register CTA

### Component: ProductQuestionMockup

**Used in:** Hero, product demo section.

**Purpose:** Show the practical value of answering and getting feedback.

**States:**

- Unanswered
- Answer selected
- Feedback shown

### Component: TestTypeCard

**Used in:** Test type section, future SEO pages.

**Purpose:** Explain +25/+40/+45 entry points.

**Props:**

| Prop | Type | Description |
|---|---|---|
| title | string | `Mayores de 25`, `Mayores de 40`, `Mayores de 45` |
| description | string | Short explanation |
| ctaLabel | string | CTA text |
| href | string | Destination |

### Component: ComparisonTable

**Used in:** Home.

**Purpose:** Differentiate Preprueba without fake numbers.

**Behavior:**

- Desktop: 3-column comparison.
- Mobile: cards per option or horizontally scrollable table.

### Component: PricingCard

**Used in:** Home, checkout.

**Purpose:** Price transparency.

**Rule:**

Only show one plan in MVP unless Stripe/product strategy changes.

---

## Interactions

### Interaction: Hero CTA

**Trigger:** Click `Empieza gratis`.

**Response:** Navigate to `/register`.

**Feedback:** Instant route transition.

### Interaction: Demo CTA

**Trigger:** Click `Ver una pregunta demo`.

**Response:** Scroll to product demo section.

**Feedback:** Smooth anchor scroll.

### Interaction: Product Demo Tabs

**Trigger:** Click tab.

**Response:** Update product mockup content.

**Duration:** 150-250ms.

**Feedback:** Active tab state + content transition.

### Interaction: FAQ Toggle

**Trigger:** Click question.

**Response:** Expand answer, collapse only if same item is clicked again.

**Duration:** 150-250ms.

---

## Responsive Behavior

**Breakpoints:**

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

**Key adaptations:**

- Header: hide nav links on mobile, keep CTA visible.
- Hero: text first, CTA second, mockup third.
- Trust strip: 2-column on tablet, single column on mobile.
- Test cards: 3 columns desktop, 1 column mobile.
- Product demo: tabs can become stacked cards on mobile.
- Comparison: convert table to cards if text gets cramped.
- Pricing: card full width on mobile.

---

## Implementation Notes

### Current Landing To Replace Or Rewrite

The current `LandingPage.tsx` already contains many useful sections, but it should be simplified around this order:

1. Header
2. Hero
3. Trust strip
4. Problem
5. How it works
6. Test type cards
7. Product demo
8. Subjects
9. Comparison
10. Pricing
11. FAQ
12. Final CTA
13. Footer

### Current Content To Remove Or Rewrite

- Rewrite hero from "PAU" to "+25/+40/+45".
- Remove fake-looking testimonials until real testimonials exist.
- Remove approval/stat comparison unless sources are verified.
- Do not use "miles de preguntas" unless database supports it.
- Move PIPO from primary hero focus to secondary support.
- Keep legal pages and footer links.

### Design Direction

- Use the current app tokens as implementation source for now.
- Keep the interface adult, clear and useful. Avoid childish gamification.
- Use product screenshots/mockups over decorative illustration.
- Do not create a marketing-only hero that hides the product.

---

## Acceptance Criteria

- Home headline mentions `prueba de acceso para mayores`.
- Above the fold makes clear: +25/+40/+45, practice, correction, price/cancelability.
- No fake testimonials or unsupported success metrics.
- CTA routes to `/register`.
- Header includes `Entrar`.
- FAQ includes community/autonomous region, official source, AI correction and cancellation.
- Footer includes legal links and non-affiliation notice.
- Mobile version keeps CTA and headline visible without overflow.
