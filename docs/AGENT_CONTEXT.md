# Contexto do Projeto — Para Agentes de IA

> Leia este arquivo ANTES de qualquer SPEC. Não explore o projeto sem ler isso primeiro.

---

## O que é o Preprueba

SaaS espanhol (€9,99/mês) onde adultos preparam as pruebas de acceso à universidade (mayores de 25/40/45 años). Praticam com perguntas reais corrigidas por IA. Deadline: setembro 2026.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite (`apps/web/`) |
| Estilos | CSS Modules + CSS Custom Properties (sem Tailwind, sem shadcn) |
| Backend | Node.js + TypeScript + Express (`apps/api/`) |
| ORM | Prisma + PostgreSQL (Neon) |
| Auth | JWT + bcrypt |
| IA | Groq API — modelo `openai/gpt-oss-120b` (compatível com OpenAI SDK) |
| Pagos | Stripe |

---

## Estrutura de Pastas

```
preprueba/
├── apps/
│   ├── api/src/
│   │   ├── routes/        → auth.ts, materias.ts, sesiones.ts, stats.ts, stripe.ts
│   │   ├── services/      → claude.ts (usa Groq, NÃO Anthropic)
│   │   ├── middleware/    → auth.ts, subscription.ts
│   │   └── lib/prisma.ts
│   └── web/src/
│       ├── pages/         → Landing, Auth, Onboarding, Dashboard, Practice, Stats, Settings, Checkout
│       ├── components/ui/ → Button, Input, Card, Badge, ProgressBar, Spinner
│       ├── services/      → api.ts (chamadas HTTP ao backend)
│       ├── store/         → useAuthStore (Zustand)
│       └── styles/globals.css → todos os tokens CSS
├── docs/
│   ├── PRD.md
│   ├── AGENT_CONTEXT.md   → este arquivo
│   └── specs/             → SPEC-01 a SPEC-10
```

---

## Decisões Já Tomadas — NÃO Reverter

| Decisão | Detalhe |
|---------|---------|
| IA provider | Groq API com SDK `openai` (baseURL: `https://api.groq.com/openai/v1`) |
| Modelo | `openai/gpt-oss-120b` — sem `response_format: json_object` (não suportado) |
| SEM Anthropic | `@anthropic-ai/sdk` foi removido. Nunca reinstalar. |
| Idioma do produto | Espanhol ibérico (Espanha). Não usar termos latinoamericanos. |
| Estilos | CSS Modules + variáveis CSS. Sem Tailwind. Sem componentes externos. |
| Auth | JWT simples. Sem NextAuth, sem Clerk, sem Auth.js. |

---

## O Que Já Foi Feito (SPECs concluídas)

- **SPEC-01 ✅** — `apps/api/src/services/claude.ts` reescrito para Groq. `openai` instalado. `@anthropic-ai/sdk` removido. `.env` e `.env.example` criados.
- **SPEC-02 ✅** — Neon PostgreSQL configurado, `prisma migrate dev --name init` executado e 11 materias inseridas via seed.
- **SPEC-03 ✅** — `apps/api/prisma/generate-questions.ts` criado, `npm run generate:questions` registrado e banco preenchido com 220 perguntas (11 materias × 20). Script continua reanudable para futuras execuções.
- **SPEC-04 ✅** — Mock data removido de `PracticePage.tsx`. Fluxo ligado à API real (`iniciarSesion`, `responderPregunta`, `finalizarSesion`).
- **SPEC-05 🔧** — Código Stripe verificado e corrigido (middleware aceita TRIALING, stats protegido com subscription). Pendente: configuração manual no Stripe Dashboard (secret key, price_id, webhook secret).
- **SPEC-06 ✅** — Admin panel web criado. Migration `add-user-role` executada. Backend: middleware `requireAdmin`, rotas CRUD de preguntas (list, detail, create, edit, toggle, delete), import CSV com `multer`, stats por materia. Frontend: `AdminPage.tsx` com tabela paginada + filtros, `PreguntaForm.tsx` com modal create/edit, `ImportCSV.tsx` com preview e upload. Rota `/admin` protegida com `AdminGuard`. `multer` instalado como dependência.

---

## Regras Para o Agente

1. **Leia a SPEC completa antes de tocar qualquer arquivo**
2. **Toque APENAS nos arquivos listados na SPEC** — nada além
3. **Pode instalar dependências se forem genuinamente necessárias para a SPEC** (ex: multer para upload CSV)
4. **Não refatore código fora do escopo da SPEC**
5. **Não adicione comentários ou docstrings em código que não modificou**
6. **Confirme o critério de aceite ao terminar**
7. Se a SPEC diz "não tocar em X" — não toque, sem exceções

---

## Variáveis de Entorno (apps/api/.env)

```
GROQ_API_KEY=gsk_...          ← configurado
DATABASE_URL=postgresql://...  ← preencher após SPEC-02
JWT_SECRET=...                 ← gerar com openssl rand -base64 32
STRIPE_SECRET_KEY=sk_test_...  ← preencher após configurar Stripe
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173
PORT=3000
```

---

## Como Corrigir Respostas (referência rápida)

```typescript
// apps/api/src/services/claude.ts — interface que NÃO muda entre SPECs
generarFeedback(enunciado, respuestaUsuario, respuestaCorrecta): Promise<{
  correcta: boolean;
  explicacion: string;
  nivel: 'básico' | 'intermedio' | 'avanzado';
}>
```

---

## Design System (referência rápida)

```css
--color-carrot:       #EF8F00;  /* laranja — botões primários */
--color-persian-blue: #0038BC;  /* azul — marca, headers */
--color-bg:           #F5F5F5;  /* fundo geral */
--color-text:         #1A1A1A;
--color-text-muted:   #6B6B6B;
--color-success:      #1A7A4A;
--color-error:        #C0392B;
```
