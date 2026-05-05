# Preprueba — Site publico, benchmark e wireframes iniciais

> Documento de trabalho para definir o primeiro contato comercial do usuario com Preprueba.
> Base local lida em 2026-05-03: `docs/PRD.md`, `docs/AGENT_CONTEXT.md`, `PREPRUEBA_BUILD.md`, `docs/preprueba-brand.html` e landing atual em `apps/web/src/pages/Landing/LandingPage.tsx`.

---

## Decisao curta

Nao refazer o brandmark agora.

O que precisa ser feito antes e um benchmark dirigido + uma auditoria de posicionamento da landing atual. A marca ja tem material suficiente para continuar: logo, paleta, tokens, linguagem visual e personagem PIPO. O risco atual nao e falta de marca; e o site publico prometer coisas dispersas ou amplas demais, enquanto o produto tem uma tese comercial especifica:

**Preprueba e uma plataforma para adultos na Espanha que estao preparando as pruebas de acceso a la universidad para mayores de 25, 40 e 45 anos.**

O site precisa vender isso com clareza, confianca e prova de utilidade. O visual pode evoluir depois.

---

## Hipotese de posicionamento

### Posicionamento recomendado

> Practica las pruebas de acceso a la universidad para mayores desde casa, con preguntas tipo examen, correccion inmediata y progreso claro.

### Promessa principal

Preprueba substitui a bagunca de PDFs soltos e reduz a dependencia de academias caras para quem precisa praticar com constancia.

### Diferenca contra academias

- Mais barato: `9,99 EUR/mes` contra cursos de centenas de euros.
- Mais flexivel: sessoes curtas, sem deslocamento, no ritmo de quem trabalha.
- Mais pratico: perguntas, correcao e historico em um unico lugar.

### Diferenca contra sites de exames/PDFs

- Nao e so arquivo para baixar.
- Tem pratica interativa.
- Tem correcao/explicacao imediata.
- Tem progresso por materia e revisao de erros.

### Publico que a home deve priorizar

1. Adultos 25-45+ que trabalham e estudam com pouco tempo.
2. Pessoas que nao podem ou nao querem pagar academia.
3. Pessoas inseguras por estarem ha anos sem estudar.
4. Usuarios menos tecnicos que precisam sentir confianca rapido.

---

## Benchmark necessario

O benchmark deve ser usado, mas com foco. Nao precisamos fazer "brand research" infinito.

### Benchmark direto

| Referencia | O que observar | Aprender | Evitar |
|---|---|---|---|
| UNIR — Curso Acceso Mayores 25 | Curso online com exame incluso, mentor, preco alto | Confiança institucional, estrutura da prova, detalhe de metodologia | Parecer universidade/curso formal demais; Preprueba nao e uma universidade |
| CEAC / Ucademy / Educalive | Academias online para +25 | Objeções: horario, suporte, materias, inscricao, compatibilidade com trabalho | Landing longa demais com lead capture agressivo |
| acceso25.es | Plataforma direta de tests para UNED +25/+45 | Muito proximo do caso de uso: tests, recursos por asignatura, demo gratis | Nicho UNED demais; Preprueba precisa cobrir CCAA e +25/+40/+45 |
| muchosexamenes.com | Biblioteca grande de exames e exercicios | Demanda por busca de exames oficiais e acervo | Experiencia fria, pouco guiada, sem correcao/progresso |

### Benchmark adjacente

| Referencia | O que observar | Aprender |
|---|---|---|
| GoKoan | Planejamento, agenda diaria, progresso, guia dentro da plataforma | O "o que estudar hoje" e forte para adulto com pouco tempo |
| OpoJust / PreparaTest / OpositaTest | Bancos de perguntas, tests personalizados, explicacoes, estatisticas | O usuario entende valor quando ve configuracao de test + feedback + erro |
| Duolingo / Khan Academy | Habito, micro sessoes, clareza visual | Usar leveza e progresso sem infantilizar adulto |

### Fontes consultadas nesta primeira leitura

- https://www.unir.net/acceso-a-mayores/curso-mayores-25/
- https://www.muchosexamenes.com/
- https://www.acceso25.es/
- https://academia.ucademy.com/landing-acceso-uni-selectividad-25/
- https://www.educalive.com/curso/acceso-universidad-mayores-25-anos
- https://www.gokoan.com/oposiciones
- https://www.preparatest.com/
- https://www.opojust.com/

---

## Auditoria rapida da landing atual

### O que ja esta bom

- A landing ja tem estrutura modular e varias secoes importantes.
- Existem pages legais em `/privacidad` e `/terminos`.
- O app ja tem preview de dashboard, pricing, FAQ, materias e CTA.
- A identidade visual tem potencial: azul/laranja, cards limpos, personagem PIPO, produto visual.

### Problemas a corrigir antes de polir UI

1. **Foco comercial diluido**
   - A landing usa muito "PAU" de forma ampla.
   - O PRD foca "pruebas de acceso para mayores +25/+40/+45".
   - Isso muda SEO, dor, objeções e promessa.

2. **Claims arriscados**
   - Evitar "historias reales", taxa de aprovacao, milhares de perguntas ou numeros sem base.
   - O PRD fala em 220 perguntas iniciais e expansao posterior.
   - Se nao houver prova, usar copy honesto: "preguntas tipo examen", "banco en crecimiento", "basadas en el formato oficial".

3. **PIPO esta muito cedo na hierarquia**
   - PIPO pode ajudar em memoria de marca e habito.
   - Mas a primeira dobra precisa responder: "isso serve para minha prova?", "e confiavel?", "quanto custa?", "posso estudar trabalhando?".

4. **Inconsistencia de marca**
   - `docs/preprueba-brand.html` usa azul `#0038BC` e laranja `#EF8F00`.
   - `tokens.css` v3 usa azul `#355CF5` e laranja `#FF6624`.
   - Nao e caso de rebrand, mas precisa escolher a fonte canonica antes do refinamento visual.

5. **Falta uma camada forte de confiança**
   - Usuario adulto e desconfiado. Precisa ver:
     - para quais vias serve;
     - quais materias cobre;
     - como funciona por comunidade autonoma;
     - que nao e organismo oficial;
     - como cancelar;
     - como funciona IA e dados.

---

## O que o site publico precisa ter

### Essencial para MVP

1. **Home / landing principal**
   - Promessa clara.
   - CTA para criar conta/testar.
   - Demo visual da plataforma.
   - Como funciona em 3 passos.
   - Para quem e: +25, +40, +45.
   - Materias cobertas.
   - Comparacao honesta: Preprueba vs PDF solto vs academia.
   - Preco.
   - FAQ.
   - Footer legal.

2. **Paginas legais**
   - Politica de privacidade.
   - Termos de uso.
   - Aviso: nao afiliado a organismos oficiais.

3. **Pagina de registro**
   - Checkbox de termos.
   - Microcopy sobre trial, sem cartao se isso for verdade no Stripe.

4. **Pagina de pricing/checkout**
   - Um plano simples no MVP.
   - Explicar trial, cancelamento, Stripe e renovacao.

### Recomendado para aquisicao/SEO

1. **Landing por via**
   - `/mayores-25`
   - `/mayores-40`
   - `/mayores-45`

2. **Landing por materia**
   - `/materias/lengua-castellana`
   - `/materias/historia-espana`
   - `/materias/ingles`
   - Depois expandir para especificas.

3. **Recursos/guia**
   - "Como funciona la prueba de acceso para mayores de 25"
   - "Diferencias entre acceso +25, +40 y +45"
   - "Fechas por comunidad autonoma"
   - "Como estudiar si trabajas"

Essas paginas nao precisam virar blog grande agora. Podem ser paginas SEO simples, com CTA para praticar.

---

## Sitemap inicial

```text
Preprueba
├── /
│   ├── Hero
│   ├── Demo da plataforma
│   ├── Como funciona
│   ├── Vias: +25 / +40 / +45
│   ├── Materias
│   ├── Comparacao
│   ├── Preco
│   ├── FAQ
│   └── Footer legal
├── /mayores-25
├── /mayores-40
├── /mayores-45
├── /materias
│   ├── /materias/lengua-castellana
│   ├── /materias/historia-espana
│   └── /materias/ingles
├── /recursos
│   ├── /recursos/guia-acceso-mayores-25
│   ├── /recursos/diferencias-25-40-45
│   └── /recursos/fechas-comunidades
├── /login
├── /register
├── /privacidad
└── /terminos
```

Para MVP, a prioridade e `/` + legal + registro. As paginas SEO podem vir em seguida.

---

## Wireframe 1 — Home publica

```text
┌────────────────────────────────────────────────────────────────────┐
│ Logo Preprueba        Como funciona  Pruebas  Materias  Precio FAQ │
│                                                        Entrar CTA   │
├────────────────────────────────────────────────────────────────────┤
│ HERO                                                               │
│                                                                    │
│ Practica las pruebas de acceso para mayores desde casa.            │
│ Preguntas tipo examen, correccion inmediata y progreso claro       │
│ para preparar +25, +40 y +45 sin depender de una academia.          │
│                                                                    │
│ [Empieza gratis] [Ver una pregunta demo]                           │
│                                                                    │
│ Chips: +25 / +40 / +45 | 9,99 EUR/mes | Sin permanencia            │
│                                                                    │
│                         ┌────────────────────────────────────────┐ │
│                         │ Mockup de pregunta + feedback IA       │ │
│                         │ Progreso por materia                   │ │
│                         │ Revisar errores                        │ │
│                         └────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│ PROBLEMA                                                           │
│ PDFs oficiales ayudan, pero estudiar solo es desordenado.           │
│ Academias ayudan, pero cuestan mucho y no siempre encajan.          │
│ Preprueba organiza la practica diaria.                              │
├────────────────────────────────────────────────────────────────────┤
│ COMO FUNCIONA                                                       │
│ 1. Elige via y comunidad                                            │
│ 2. Practica por materia                                             │
│ 3. Recibe correccion y revisa errores                               │
├────────────────────────────────────────────────────────────────────┤
│ PARA QUE PRUEBA TE PREPARAS?                                       │
│ [Mayores de 25] [Mayores de 40] [Mayores de 45]                     │
│ Cada card explica requisitos generales, materias e CTA especifico.  │
├────────────────────────────────────────────────────────────────────┤
│ PRODUCTO POR DENTRO                                                │
│ Tabs: Practica | Errores | Progreso | Simulacros | Planificador     │
│ Mockup real ou semi-real de cada fluxo.                             │
├────────────────────────────────────────────────────────────────────┤
│ MATERIAS                                                           │
│ Lengua | Historia | Ingles | Matematicas | Biologia | Quimica ...   │
│ CTA: Ver materias disponibles                                       │
├────────────────────────────────────────────────────────────────────┤
│ COMPARACAO                                                         │
│ PDFs sueltos        Academia tradicional        Preprueba           │
│ Gratis/caotico      Caro/acompanado             Barato/interativo   │
│ Sin progreso        Horarios                    A tu ritmo          │
├────────────────────────────────────────────────────────────────────┤
│ PRECIO                                                             │
│ Plan unico: 9,99 EUR/mes                                            │
│ Incluye: materias, preguntas, IA, historial, errores, progreso      │
│ [Empieza gratis]                                                    │
├────────────────────────────────────────────────────────────────────┤
│ FAQ                                                                │
│ - Para quien es?                                                    │
│ - Cubre mi comunidad autonoma?                                      │
│ - Las preguntas son oficiales?                                      │
│ - Como funciona la IA?                                              │
│ - Puedo cancelar?                                                   │
├────────────────────────────────────────────────────────────────────┤
│ Footer: legal, contacto, aviso no afiliacion oficial                │
└────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 2 — Hero recomendado

```text
┌───────────────────────────────────────────────────────────────┐
│ PREPRUEBA                                                     │
│                                                               │
│ Practica la prueba de acceso                                  │
│ para mayores sin academia.                                    │
│                                                               │
│ Prepara +25, +40 o +45 con preguntas tipo examen,             │
│ correccion inmediata y sesiones cortas para estudiar           │
│ incluso si trabajas.                                          │
│                                                               │
│ [Empieza gratis]  [Ver demo]                                  │
│                                                               │
│ Sin tarjeta*  ·  9,99 EUR/mes  ·  Cancela cuando quieras      │
│ *solo si Stripe/trial lo confirma                             │
│                                                               │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Pregunta 4 de 10                                          │ │
│ │ Lengua Castellana                                         │ │
│ │ [opciones]                                                │ │
│ │ Resultado: Incorrecto                                     │ │
│ │ Explicacion: ...                                          │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3 — Pagina por via

Exemplo: `/mayores-25`

```text
┌───────────────────────────────────────────────────────────────┐
│ Hero                                                          │
│ Prepara la prueba de acceso a la universidad para mayores     │
│ de 25 anos.                                                   │
│ [Practicar gratis] [Ver materias]                             │
├───────────────────────────────────────────────────────────────┤
│ Que es esta via?                                               │
│ Requisitos generales + aviso de verificar en universidad/CCAA  │
├───────────────────────────────────────────────────────────────┤
│ Como suele estructurarse la prueba                             │
│ Fase general | Fase especifica | Comunidad autonoma            │
├───────────────────────────────────────────────────────────────┤
│ Como te ayuda Preprueba                                        │
│ Preguntas | Feedback | Errores | Progreso | Simulacros         │
├───────────────────────────────────────────────────────────────┤
│ Materias frecuentes                                            │
│ Lengua, Historia, Ingles, Matematicas, Biologia...             │
├───────────────────────────────────────────────────────────────┤
│ CTA + FAQ especifico                                           │
└───────────────────────────────────────────────────────────────┘
```

---

## Wireframe 4 — Demo de pergunta

Esse bloco e mais importante que depoimentos no MVP.

```text
┌───────────────────────────────────────────────────────────────┐
│ Prueba una pregunta                                            │
│                                                               │
│ Materia: Historia de Espana                                   │
│ Dificultad: Intermedio                                        │
│                                                               │
│ ¿Pregunta exemplo...?                                         │
│ ○ A                                                           │
│ ○ B                                                           │
│ ○ C                                                           │
│ ○ D                                                           │
│                                                               │
│ [Responder]                                                   │
├───────────────────────────────────────────────────────────────┤
│ Feedback inmediato                                            │
│ Correcta / Incorrecta + explicacion curta                     │
│ CTA: Crea tu cuenta para guardar tu progreso                  │
└───────────────────────────────────────────────────────────────┘
```

---

## Conteudo/copy que precisa existir

### Mensagens centrais

- "Preparar la prueba sola es dificil. Practicar no deberia serlo."
- "Estudia en sesiones cortas, a tu ritmo."
- "Preguntas tipo examen y explicaciones al momento."
- "Menos PDFs sueltos. Mas practica guiada."
- "Un plan simple por 9,99 EUR/mes."

### Evitar por enquanto

- "Aprobacion garantizada."
- "Historias reales" se forem ficticias.
- "Miles de preguntas" se o banco atual nao tem isso.
- "Preguntas oficiales" sem explicar o que e oficial, gerado ou baseado no formato.
- "PAU" como headline principal se a aquisicao desejada e +25/+40/+45.

### Linguagem

Usar espanhol iberico no site:

- "ordenador", quando necessario.
- "comunidad autonoma".
- "prueba de acceso".
- "mayores de 25/40/45 anos".
- "sin permanencia".
- "cancela cuando quieras".

---

## Checklist de decisoes antes de redesenhar

1. A home vai focar somente +25/+40/+45 ou tambem PAU/EBAU geral?
   - Recomendacao: focar +25/+40/+45 agora.

2. PIPO e elemento principal ou apoio?
   - Recomendacao: apoio/habito, nao promessa principal.

3. Trial e "sin tarjeta" ou precisa cartao?
   - Recomendacao: so prometer "sin tarjeta" se Stripe estiver configurado assim.

4. Perguntas sao "oficiales", "tipo examen" ou "basadas en exámenes oficiales"?
   - Recomendacao: separar claramente por fonte quando o banco permitir.

5. Paleta canonica:
   - Brand guide antigo: `#0038BC` / `#EF8F00`.
   - App tokens v3: `#355CF5` / `#FF6624`.
   - Recomendacao: manter tokens v3 no produto, mas atualizar brand doc depois para nao haver duas fontes da verdade.

---

## Proxima etapa recomendada

Antes de mexer no React, fazer um desses dois entregaveis:

1. **Benchmark curto em tabela**, com screenshots e notas de 6-8 concorrentes.
2. **Wireframe consolidado da home**, ja com copy real em espanhol iberico.

Depois disso, implementar a home revisada em cima da landing atual, removendo claims arriscados e consolidando os componentes duplicados/antigos.
