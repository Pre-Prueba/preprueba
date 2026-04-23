# Product: Preprueba

SaaS platform for practicing university entrance exams in Spain for adults over 25, 40, and 45 years old (pruebas de acceso para mayores).

## Core Features

- Practice exams with AI-generated and official questions
- Study session tracking and progress stats
- AI-powered feedback on open-ended answers (via Groq)
- Study planner with scheduled tasks
- Flashcard system for memorization
- Community forum with posts, comments, and moderation
- Official exam document ingestion and browsing
- Subscription-based access (Stripe), with free and premium tiers
- Admin panel for content and user management

## Domain Language

Domain concepts use Spanish naming throughout the codebase:
- `materias` — subjects
- `sesiones` — study sessions
- `preguntas` — questions
- `respuestas` — answers
- `errores` — tracked mistakes
- `favoritos` — saved questions
- `simulacros` — full mock exams
- `planner` — study planner
- `examenes` — exams

## User Roles

- `USER` — standard registered user
- `ADMIN` — platform administrator

## Exam Types

- `MAYORES_25`, `MAYORES_40`, `MAYORES_45` — the three university access exam tracks
