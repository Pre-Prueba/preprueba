import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Descripción del servicio',
    paragraphs: [
      'Preprueba es una plataforma online de preparación para las pruebas de acceso a la universidad para mayores de 25, 40 y 45 años en España.',
      'El servicio ofrece preguntas de práctica, seguimiento del progreso y corrección asistida por inteligencia artificial para ayudarte a estudiar con constancia.',
    ],
  },
  {
    title: 'Precio y suscripción',
    paragraphs: [
      'El acceso completo se ofrece mediante suscripción mensual de 9,99 € e incluye las funciones activas del producto durante el periodo contratado.',
      'La prueba gratuita, cuando esté disponible, se aplicará según las condiciones mostradas en el momento del alta.',
    ],
  },
  {
    title: 'Cancelación',
    paragraphs: [
      'Puedes cancelar tu suscripción desde la zona de ajustes o a través del portal de pago asociado a tu cuenta.',
      'La cancelación evita la renovación del siguiente ciclo, pero mantendrás el acceso hasta que finalice el periodo ya abonado.',
    ],
  },
  {
    title: 'Uso aceptable y limitación de responsabilidad',
    paragraphs: [
      'Debes utilizar la plataforma de forma lícita y personal. No está permitido compartir credenciales, intentar vulnerar la seguridad del servicio ni reutilizar el contenido con fines no autorizados.',
      'Preprueba se ofrece como herramienta de apoyo al estudio y no garantiza resultados académicos concretos ni sustituye la información oficial publicada por universidades u organismos competentes.',
    ],
  },
  {
    title: 'Ley aplicable',
    paragraphs: [
      'Estos términos se rigen por la legislación española. Cualquier controversia se resolverá conforme a las normas aplicables en España.',
    ],
  },
];

export function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-10) var(--space-6) var(--space-16)' }}>
        <Link to="/" style={{ display: 'inline-flex', marginBottom: 'var(--space-6)', color: 'var(--color-persian-blue)', fontWeight: 600, textDecoration: 'none' }}>
          ← Volver a la portada
        </Link>

        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Última actualización: 10 de abril de 2026</p>
          <h1 style={{ fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl))', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-4)' }}>
            Términos de uso
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 'var(--space-8)' }}>
            Estas condiciones regulan el acceso y uso de Preprueba como servicio de apoyo para preparar las pruebas de acceso para mayores.
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
