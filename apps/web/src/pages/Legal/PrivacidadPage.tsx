import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Responsable del tratamiento',
    paragraphs: [
      'Preprueba es el servicio responsable del tratamiento de los datos personales que facilitas al crear tu cuenta y utilizar la plataforma.',
      'Si necesitas ejercer tus derechos o resolver cualquier duda sobre privacidad, puedes escribir a soporte@preprueba.es.',
    ],
  },
  {
    title: 'Qué datos recopilamos',
    paragraphs: [
      'Recogemos los datos que introduces al registrarte, como tu correo electrónico, tu contraseña cifrada y, si lo indicas, tu nombre.',
      'También guardamos información de uso necesaria para prestar el servicio, como tu progreso, tus sesiones de práctica, tus respuestas y tu estado de suscripción.',
    ],
  },
  {
    title: 'Para qué usamos tus datos',
    paragraphs: [
      'Usamos tus datos para crear y gestionar tu cuenta, ofrecerte prácticas personalizadas, mostrar tu progreso y permitir el acceso a las funciones contratadas.',
      'También tratamos la información para mejorar el producto, prevenir usos indebidos y atender incidencias técnicas o consultas de soporte.',
    ],
  },
  {
    title: 'Con quién compartimos tus datos',
    paragraphs: [
      'Compartimos los datos estrictamente necesarios con proveedores que intervienen en la prestación del servicio, como Stripe para la gestión de pagos y Groq para la corrección asistida por inteligencia artificial.',
      'No vendemos tus datos personales ni los cedemos a terceros para fines publicitarios ajenos a Preprueba.',
    ],
  },
  {
    title: 'Tus derechos',
    paragraphs: [
      'Puedes solicitar el acceso, la rectificación, la supresión, la limitación del tratamiento o la portabilidad de tus datos personales.',
      'Para ejercer estos derechos, escríbenos a soporte@preprueba.es. Responderemos conforme a la legislación española y al RGPD.',
    ],
  },
];

export function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-10) var(--space-6) var(--space-16)' }}>
        <Link to="/" style={{ display: 'inline-flex', marginBottom: 'var(--space-6)', color: 'var(--color-persian-blue)', fontWeight: 600, textDecoration: 'none' }}>
          ← Volver a la portada
        </Link>

        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Última actualización: 10 de abril de 2026</p>
          <h1 style={{ fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl))', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-4)' }}>
            Política de privacidad
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 'var(--space-8)' }}>
            Esta política explica de forma clara qué datos tratamos cuando usas Preprueba y con qué finalidad lo hacemos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            {sections.map((section) => (
              <section key={section.title}>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>{section.title}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
