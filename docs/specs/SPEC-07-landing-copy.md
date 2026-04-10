# SPEC-07 — Landing Page + Copy Español
> Prioridad: 🟡 Media · Estimación: 3-5h
> **No depende de otras SPECs. Se puede hacer en paralelo.**

---

## Contexto

La landing page existe y tiene estructura correcta (hero, cómo funciona, precios, FAQ, footer). El copy puede contener:
- Términos latinoamericanos en lugar de ibéricos
- Mensajes genéricos que no conectan con el usuario real (adulto 35-55 años, España)
- SEO inexistente (sin meta tags, sin OG)
- Falta política de privacidad y términos de uso (mínimo legal para MVP)

---

## Archivos a Tocar

| Archivo | Acción |
|---------|--------|
| `apps/web/src/pages/Landing/LandingPage.tsx` | Revisar y actualizar copy |
| `apps/web/index.html` | Añadir meta tags SEO y OG |
| `apps/web/src/pages/Legal/PrivacidadPage.tsx` | CREAR — política de privacidad básica |
| `apps/web/src/pages/Legal/TerminosPage.tsx` | CREAR — términos de uso básicos |
| `apps/web/src/App.tsx` | Añadir rutas `/privacidad` y `/terminos` |

---

## Lo que NO tocar

- Estructura HTML/JSX de la landing — no reordenar secciones
- Design system — mismos tokens de color y tipografía
- Componentes UI base

---

## Copy a Revisar (Español Ibérico)

### Términos a corregir si aparecen

| ❌ Evitar | ✅ Usar en España |
|-----------|-----------------|
| "computadora" | "ordenador" |
| "celular" / "móvil" (cuando sea ambiguo) | "móvil" |
| "manejar" (gestionar algo) | "gestionar" |
| "rentar" | "alquilar" |
| "ahorita" | "ahora" / "en este momento" |
| "vosotros" en contexto formal | usar cuando sea natural |
| "usted" excesivo en UI | tuteo natural para adultos jóvenes/medios |

### Tono recomendado
- **Para Carmen (38 años):** cercano, empático, sin condescendencia
- Mensajes directos sobre el problema: "Preparar la prueba sola es difícil"
- Énfasis en: sin desplazamiento, a tu ritmo, precio justo
- Evitar: jerga juvenil, tecnicismos, anglicismos innecesarios

---

## SEO — `index.html`

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO básico -->
  <title>Preprueba — Practica las pruebas de acceso a la universidad para mayores</title>
  <meta name="description" content="Banco de preguntas interactivo para las pruebas de acceso a la universidad para mayores de 25, 40 y 45 años. Corrección automática por IA. 9,99€/mes." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://preprueba.es" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Preprueba — Pruebas de acceso para mayores" />
  <meta property="og:description" content="Practica con preguntas reales de exámenes anteriores. Corrección inmediata con IA. Empieza gratis." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://preprueba.es" />
  <meta property="og:image" content="https://preprueba.es/og-image.png" />
  <meta property="og:locale" content="es_ES" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Preprueba" />
  <meta name="twitter:description" content="Practica las pruebas de acceso a la universidad. Corrección por IA." />
</head>
```

---

## Secciones de la Landing a Revisar

### Hero
- Headline: clara, orientada al beneficio, no a la feature
- Ejemplo actual (genérico): "Prepárate para tu prueba de acceso"
- Mejor: "Practica las pruebas de acceso para mayores desde casa. Con corrección inmediata."
- Subheadline: mencionar el precio y el trial
- CTA: "Empieza gratis 7 días" (no "Empezar" genérico)

### Cómo funciona (3 pasos)
- Paso 1: Elige tu tipo de prueba (25, 40 o 45 años) y comunidad autónoma
- Paso 2: Practica con preguntas reales de exámenes anteriores
- Paso 3: Recibe corrección inmediata y explicaciones detalladas

### Precios
- Único plan: 9,99€/mes
- Mencionar: "Cancela cuando quieras" y "7 días de prueba gratuita"
- Comparar con academia presencial: "Las academias cobran 300€ o más"

### FAQ — Preguntas sugeridas
1. ¿Para quién es Preprueba?
2. ¿Las preguntas son de exámenes reales?
3. ¿Qué pasa si cancelo?
4. ¿Funciona para todas las comunidades autónomas?
5. ¿Necesito instalar algo?
6. ¿Cómo funciona la corrección por inteligencia artificial?

### Footer
- Añadir: enlace a `/privacidad` y `/terminos`
- Año actual: 2026
- "Preprueba no está afiliada a ningún organismo oficial"

---

## Páginas Legales (Mínimo MVP)

### `/privacidad` — Política de Privacidad
Debe incluir:
- Quién es el responsable del tratamiento
- Qué datos se recogen (email, contraseña hash, progreso)
- Para qué se usan los datos
- Con quién se comparten (Stripe para pagos, Groq para corrección)
- Derechos del usuario (acceso, rectificación, supresión)
- Contacto para ejercer derechos

### `/terminos` — Términos de Uso
Debe incluir:
- Descripción del servicio
- Precio y condiciones de suscripción
- Cancelación
- Limitación de responsabilidad
- Ley aplicable: legislación española

---

## Criterio de Aceptación

- [ ] Hero tiene headline claro orientado al beneficio, CTA "Empieza gratis"
- [ ] No hay términos latinoamericanos en el copy
- [ ] `index.html` tiene title, description, og:title, og:description correctos
- [ ] FAQ tiene al menos 5 preguntas relevantes
- [ ] Footer tiene enlaces a `/privacidad` y `/terminos`
- [ ] Páginas `/privacidad` y `/terminos` existen y tienen contenido básico
- [ ] Checkbox de aceptación de términos en el formulario de registro

---

## Nota sobre Imágenes

Si la landing tiene placeholders de imagen (og:image, ilustraciones), crear una imagen de OG básica (1200×630px) con el logo y el tagline. Puede ser un fondo azul (`#0038BC`) con texto en blanco.
