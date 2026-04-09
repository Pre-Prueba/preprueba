import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const FAQS = [
  { q: '¿Qué pruebas cubre Preprueba?', a: 'Las pruebas de acceso a la universidad para mayores de 25, 40 y 45 años de todas las comunidades autónomas de España.' },
  { q: '¿Las preguntas son reales?', a: 'Sí. El banco incluye preguntas de exámenes oficiales publicados por las universidades. Las generadas por IA están claramente marcadas.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencia. Cancelas en cualquier momento desde tu perfil y no se te cobra más.' },
  { q: '¿Cómo funciona la corrección con IA?', a: 'Cada respuesta es analizada por Claude (Anthropic). Recibes una explicación del concepto en lenguaje sencillo, nivel bachillerato.' },
  { q: '¿Hay período de prueba?', a: 'Sí. 7 días gratuitos al registrarte, sin necesidad de tarjeta de crédito.' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-white)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, background: 'var(--color-white)', zIndex: 10,
      }}>
        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-persian-blue)' }}>
          Preprueba
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Iniciar sesión</Button>
          <Button size="sm" onClick={() => navigate('/register')}>Empezar</Button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 680, margin: '0 auto', padding: 'var(--space-16) var(--space-6)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(var(--text-2xl), 5vw, var(--text-4xl))', fontWeight: 800, lineHeight: 1.2, color: 'var(--color-text)', marginBottom: 'var(--space-5)' }}>
          Practica para la prueba de acceso a la universidad
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>
          El banco de preguntas que los estudiantes adultos en España necesitaban. Corrección inmediata con IA. Sin academia. Sin compromisos.
        </p>
        <Button size="lg" onClick={() => navigate('/register')}>
          Empezar a practicar →
        </Button>
        <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          7 días gratis · Sin tarjeta de crédito
        </p>
      </section>

      {/* Cómo funciona */}
      <section style={{ background: 'var(--color-bg)', padding: 'var(--space-16) var(--space-6)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-10)' }}>
            Cómo funciona
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
            {[
              { n: '1', title: 'Elige tu materia', desc: 'Selecciona entre Lengua, Historia, Inglés y más materias de fase general y específica.' },
              { n: '2', title: 'Responde preguntas reales', desc: 'Preguntas de exámenes oficiales anteriores. Elige la opción o escribe tu respuesta.' },
              { n: '3', title: 'Recibe feedback al instante', desc: 'La IA explica cada respuesta de forma clara. Aprende de tus errores en el momento.' },
            ].map((step) => (
              <div key={step.n} style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', background: 'var(--color-persian-blue)', color: 'var(--color-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                  {step.n}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precio */}
      <section style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-8)' }}>Un plan, sin sorpresas</h2>
          <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--color-persian-blue)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Plan Preprueba</p>
            <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-carrot)', marginBottom: 'var(--space-6)' }}>
              €9,99<span style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: 'var(--color-text-muted)' }}>/mes</span>
            </div>
            <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {['Acceso a todas las materias', 'Corrección automática con IA', 'Historial de progreso', 'Sin permanencia, cancela cuando quieras'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Button fullWidth onClick={() => navigate('/register')}>Empezar ahora</Button>
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Sin tarjeta de crédito para el período de prueba
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--color-bg)', padding: 'var(--space-16) var(--space-6)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-8)' }}>Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {FAQS.map((faq) => (
              <div key={faq.q} style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
                <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{faq.q}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-6)', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        <span style={{ fontWeight: 700, color: 'var(--color-persian-blue)', marginRight: 'var(--space-4)' }}>Preprueba</span>
        © 2026 · Todos los derechos reservados
      </footer>
    </div>
  );
}
