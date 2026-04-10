# HANDOFF — Preprueba
> Para a próxima janela de agente. Leia isto + AGENT_CONTEXT.md antes de qualquer coisa.

---

## O Que É o Projeto

SaaS espanhol (€9,99/mês) para adultos que preparam pruebas de acceso à universidade (mayores de 25/40/45 años). Praticam com perguntas reais corrigidas por IA.

**Stack:** React 19 + Vite (frontend) · Node + Express + TypeScript (backend) · Prisma + PostgreSQL Neon · Groq API · Stripe

---

## Estado Atual — O Que Está Feito

### SPEC-01 ✅ — Troca IA (Anthropic → Groq)
- `apps/api/src/services/claude.ts` reescrito para usar `openai` SDK com Groq
- Modelo: `openai/gpt-oss-120b`
- **Atenção:** este modelo NÃO suporta `response_format: { type: 'json_object' }` — retorna erro 400. O prompt já instrui JSON direto e funciona bem sem esse campo.
- `@anthropic-ai/sdk` removido. `openai@6.34.0` instalado.
- `.env` e `.env.example` criados em `apps/api/`

### SPEC-02 ✅ — Infraestrutura DB
- Neon PostgreSQL configurado (Frankfurt, eu-central-1)
- `DATABASE_URL` no `.env`
- `JWT_SECRET` gerado (64 chars)
- `prisma migrate dev --name init` executado com sucesso
- 11 materias inseridas via seed:
  - GENERAL: Lengua Castellana y Literatura, Historia de España, Inglés
  - ESPECIFICA: Biología, Química, Matemáticas Aplicadas a las CCSS, Geografía, Historia de la Filosofía, Historia del Arte, Matemáticas, Física

### SPEC-04 ✅ — Wiring Practice Page
- Mock data removido de `PracticePage.tsx`
- Funções `iniciarSesion`, `responderPregunta`, `finalizarSesion` ligadas à API real
- Tipos `SesionIniciada`, `RespuestaResult`, `SesionFinalizada` no frontend
- Sessões reais gravadas na DB

### SPEC-05 🔧 — Stripe End-to-End (código pronto, config pendente)
- **Fixes aplicados:**
  - `subscription.ts` — agora aceita `TRIALING` além de `ACTIVE`
  - `stats.ts` — rota `GET /stats/resumen` protegida com `requireSubscription`
  - `stripe.ts` routes — tipagem limpa com `Stripe.Event` e `sig as string`
- **O código está completo e correto**
- **Pendente:** configuração manual no Stripe Dashboard (ver secção abaixo)

---

## Problemas Conhecidos e Soluções Aplicadas

### 1. Rate limit do Groq free tier (8.000 TPM)
- **Problema:** gerar 20 perguntas de uma vez pede ~8.400 tokens — ultrapassa o limite
- **Solução aplicada:** 2 lotes de 10 perguntas por materia, com pausa de 9s entre lotes
- **Pausa entre materias:** 5s

### 2. JSON malformado ocasionalmente
- **Problema:** o modelo às vezes trunca o JSON ou adiciona texto antes/depois
- **Solução aplicada:** regex `content.match(/\{[\s\S]*\}/)` para extrair JSON + retry automático até 3 tentativas com 3-4s de espera

### 3. `response_format: { type: 'json_object' }` não suportado
- **Problema:** `openai/gpt-oss-120b` no Groq retorna erro 400 com esse campo
- **Solução:** removido de todos os lugares. O prompt pede JSON explicitamente e o modelo obedece.

---

## Arquivos Críticos — Leia Antes de Tocar

| Arquivo | Estado | Observação |
|---------|--------|-----------|
| `apps/api/src/services/claude.ts` | ✅ Final | Groq wired, não mexer na assinatura |
| `apps/api/prisma/generate-questions.ts` | ✅ Final | Retry logic + lotes de 10 |
| `apps/api/prisma/schema.prisma` | ✅ Final | Não modificar |
| `apps/api/.env` | ✅ Configurado | GROQ_API_KEY e DATABASE_URL prontos |
| `apps/api/prisma/seed.ts` | ✅ Final | 11 materias, não re-executar |
| `docs/AGENT_CONTEXT.md` | ✅ | Decisões globais do projeto |
| `docs/specs/` | ✅ | SPEC-01 a SPEC-10 detalhadas |

---

## Próximos Passos — Por Ordem

### IMEDIATO — Configurar Stripe Dashboard
```
1. Criar produto no Stripe Dashboard (test mode)
   - Nome: "Preprueba — Acceso completo"
   - Preço: 9,99€ / mês (recurrente)
   - Copiar price_ID → STRIPE_PRICE_ID no .env

2. Obter secret key do Stripe
   - Stripe → Developers → API Keys → Secret key (test)
   - Copiar → STRIPE_SECRET_KEY no .env

3. Configurar webhook (para testes locais usar Stripe CLI)
   - stripe listen --forward-to localhost:3000/stripe/webhook
   - Copiar signing secret → STRIPE_WEBHOOK_SECRET no .env

4. Testar o fluxo completo:
   - Registar → login → checkout → pagar com 4242 4242 4242 4242
   - Verificar que subscription aparece na DB
   - Verificar que /materias retorna 200
```

### Depois — SPECs restantes (por prioridade)

| SPEC | O que é | Bloqueantes |
|------|---------|------------|
| SPEC-06 | Admin panel web (CRUD preguntas + import CSV) | ✅ Feito |
| SPEC-07 | Landing page copy espanhol ibérico + SEO | Independente |
| SPEC-08 | Stats + Dashboard com dados reais (remover mock) | SPEC-04 |
| SPEC-09 | E2E tests Playwright | Tudo antes |
| SPEC-10 | Monitoring (Sentry) + deploy final | Tudo antes |

**Railway e Vercel:** não são necessários agora — só para deploy em produção.

---

## Forma de Pensar Deste Projeto

- **Mudanças pequenas e incrementais** — cada SPEC toca só nos arquivos listados
- **Sem refatorações oportunistas** — se vir algo feio fora do escopo, ignora
- **Sem instalar deps não listadas** — o stack está decidido
- **Espanhol ibérico** em todo o copy — não latinoamericano
- **O mock data no frontend é temporário** — existe para UI funcionar sem DB. SPEC-04 e SPEC-08 removem isso.
- **O agente pode propor caminhos melhores** — as SPECs são guias, não prisões. Se vir uma abordagem mais simples que entrega o mesmo resultado, usa.

---

## Variáveis de Ambiente Configuradas

```
GROQ_API_KEY=gsk_...                    ← configurado apenas no `.env` local
DATABASE_URL=postgresql://...           ← configurado apenas no `.env` local
JWT_SECRET=gerado-localmente-64+chars   ← configurado apenas no `.env` local
STRIPE_*=pendente
```

---

## Verificação Rápida de Estado

```bash
cd apps/api

# Quantas perguntas existem por materia:
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.pregunta.groupBy({ by: ['materiaId'], _count: true })
  .then(r => { console.log(r); p.\$disconnect(); });
"

# Ou via Prisma Studio:
npx prisma studio
```
