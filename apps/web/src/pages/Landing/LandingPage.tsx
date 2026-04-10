import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap, TrendingUp, Clock, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { heroContainer, heroHeadline, fadeUp, staggerContainer, listItem } from '../../lib/animations';

/* ── Logo SVG inline */
function PrepruebaMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 44 32" fill="none">
      <rect x="0" y="5" width="20" height="20" rx="5" fill="currentColor" opacity="0.12" />
      <path d="M4 9Q10 7 10 17Q10 7 16 9L16 25Q10 23 10 17Q10 23 4 25Z" fill="currentColor" />
      <circle cx="18" cy="5" r="5" fill="var(--orange)" />
      <path d="M16 5L18 2L20 5" fill="white" />
    </svg>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(247,249,252,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s var(--ease-out)',
      padding: '0 40px',
      height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--blue)', textDecoration: 'none' }}>
        <PrepruebaMark size={28} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', color: 'var(--text)' }}>
          prep<span style={{ color: 'var(--blue)' }}>prueba</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/login" style={{
          padding: '8px 18px', fontSize: '14px', fontWeight: 500,
          color: 'var(--text-2)', borderRadius: 'var(--radius-md)',
          transition: 'color 0.15s, background 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue)'; (e.currentTarget as HTMLElement).style.background = 'var(--blue-soft)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          Entrar
        </Link>
        <Link to="/register" style={{
          padding: '9px 20px', fontSize: '14px', fontWeight: 500,
          background: 'var(--blue)', color: 'white',
          borderRadius: 'var(--radius-md)',
          transition: 'background 0.18s, transform 0.18s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--blue-mid)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--blue)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          Empieza gratis
        </Link>
      </div>
    </nav>
  );
}

/* ── Dashboard mockup decorativo */
function DashboardMockup() {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-2xl)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-lg)',
      padding: '20px',
      width: '100%',
      maxWidth: '380px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Buenos días, Ana.</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>¿Qué practicamos hoy?</div>
        </div>
        <div style={{ background: 'var(--orange-soft)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '12px', fontWeight: 600, color: 'var(--orange-deep)' }}>
          🔥 4 días
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[{ v: '12', l: 'sesiones' }, { v: '84%', l: 'acierto' }, { v: '120', l: 'respuestas' }].map(s => (
          <div key={s.l} style={{ flex: 1, background: 'var(--blue-soft)', borderRadius: 'var(--radius-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--blue)' }}>{s.v}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {[
        { name: 'Comprensión Lectora', pct: 70, phase: 'General' },
        { name: 'Historia de España', pct: 45, phase: 'General' },
        { name: 'Matemáticas', pct: 85, phase: 'Específica' },
      ].map((m, i) => (
        <div key={m.name} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: i === 0 ? 'var(--blue-soft)' : 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          marginBottom: '6px',
          border: i === 0 ? '1px solid var(--blue-dim)' : '1px solid var(--border)',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: `conic-gradient(var(--blue) 0% ${m.pct}%, var(--surface) ${m.pct}% 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'var(--blue-soft)' : 'var(--surface)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '1px' }}>{m.pct}% · {m.phase}</div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: '12px', background: 'var(--blue-soft)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--blue-dim)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--blue)', marginBottom: '6px' }}>✓ Qué revisé en tu respuesta</div>
        <div style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.5 }}>La base la tienes. Ahora ajustemos lo importante.</div>
      </div>
    </div>
  );
}

/* ── FAQ */
const faqs = [
  { q: '¿Para quién es Preprueba?', a: 'Para adultos que quieren acceder a la universidad por las vías de +25, +40 o +45 años. Si llevas tiempo sin estudiar, estás en el lugar correcto.' },
  { q: '¿Cuánto tiempo necesito dedicar?', a: '10 minutos al día son suficientes para avanzar. Puedes practicar cuando quieras, sin horarios fijos.' },
  { q: '¿Las preguntas son del formato real?', a: 'Sí. Están inspiradas en exámenes oficiales de las distintas comunidades autónomas, adaptadas al nivel y tipo de prueba.' },
  { q: '¿Cómo funciona la corrección?', a: 'Cada respuesta se corrige al instante. Si te equivocas, recibes una explicación clara de qué faltó — no solo "incorrecto".' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencia, sin penalizaciones. Si cancelas, guardamos todo tu progreso.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', textAlign: 'left' }}
      >
        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.5 }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ flexShrink: 0, color: 'var(--text-3)', display: 'flex' }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.7, paddingBottom: '20px' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const steps = [
  { icon: BookOpen, title: 'Practica con exámenes reales', desc: 'Preguntas del formato oficial, adaptadas por comunidad autónoma y tipo de prueba (+25, +40, +45).' },
  { icon: Zap, title: 'Corrección inmediata y explicación', desc: 'Cada respuesta se corrige al instante. Si fallas, entiendes exactamente qué faltó — y por qué.' },
  { icon: TrendingUp, title: 'Tu progreso, siempre visible', desc: 'Ve cómo avanzas en cada materia. Sin presión, sin comparaciones. Solo tú y tu progreso.' },
];

export function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-ui)', background: 'var(--white)', color: 'var(--text)' }}>
      <NavBar />

      {/* ── HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        paddingTop: '80px',
        background: 'radial-gradient(ellipse 80% 60% at 60% -10%, var(--blue-soft) 0%, var(--white) 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 40px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '80px', alignItems: 'center' }}>

            <motion.div variants={heroContainer} initial="hidden" animate="show">
              <motion.div variants={heroHeadline}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--blue-soft)', border: '1px solid var(--blue-dim)',
                  borderRadius: 'var(--radius-full)', padding: '5px 14px',
                  fontSize: '12px', fontWeight: 500, color: 'var(--blue)', marginBottom: '24px',
                }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--blue)', borderRadius: '50%', display: 'inline-block' }} />
                  Pruebas +25 · +40 · +45
                </span>
              </motion.div>

              <motion.h1 variants={heroHeadline} style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.1,
                color: 'var(--text)', marginBottom: '24px',
              }}>
                Tu acceso a<br />
                la universidad,<br />
                <em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>claro y a tu ritmo.</em>
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: '18px', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '480px', marginBottom: '36px' }}>
                Prepárate con exámenes reales, corrección inmediata y explicaciones claras.{' '}
                <strong style={{ color: 'var(--text)', fontWeight: 500 }}>A tu ritmo. Sin academias caras.</strong>
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '48px' }}>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--orange)', color: 'white',
                  padding: '14px 28px', borderRadius: 'var(--radius-md)',
                  fontSize: '15px', fontWeight: 500, textDecoration: 'none',
                  transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
                  boxShadow: '0 4px 16px rgba(239,143,0,0.3)',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--orange-deep)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--orange)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  Empieza a practicar hoy
                  <ArrowRight size={16} />
                </Link>
                <span style={{ fontSize: '13px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  7 días gratis · Sin permanencia
                </span>
              </motion.div>

              <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'flex', gap: '32px' }}>
                {[{ n: '3', l: 'tipos de prueba' }, { n: '€9,99', l: 'al mes' }, { n: '7 días', l: 'gratis' }].map(s => (
                  <motion.div key={s.l} variants={listItem}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--blue)' }}>{s.n}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{s.l}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STRIP */}
      <div style={{ background: 'var(--blue)', padding: '20px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {['Comunidad de Madrid', 'Cataluña', 'Andalucía', 'Comunitat Valenciana', 'Galicia'].map(c => (
          <span key={c} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{c}</span>
        ))}
      </div>

      {/* ── CÓMO FUNCIONA */}
      <section style={{ padding: '100px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} style={{ textAlign: 'center', marginBottom: '64px' }}>
            <motion.div variants={fadeUp} style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '16px' }}>
              Cómo funciona
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, lineHeight: 1.2, color: 'var(--text)' }}>
              Practica. Entiende. Avanza.
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {steps.map((step, i) => (
              <motion.div key={step.title} variants={listItem}>
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid var(--border)', height: '100%' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--blue-soft)', border: '1px solid var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', marginBottom: '20px' }}>
                    <step.icon size={22} />
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginBottom: '10px' }}>0{i + 1}</div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px', lineHeight: 1.3 }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MANIFESTO */}
      <section style={{ background: 'var(--blue)', padding: '100px 0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 300, color: 'rgba(255,255,255,0.9)', lineHeight: 1.65 }}>
              <strong style={{ fontStyle: 'normal', fontWeight: 600, color: 'white' }}>Volver a estudiar no debería dar más miedo que ilusión.</strong>
              {' '}Preprueba nace para ayudarte a practicar, entender y avanzar. Sin presión. Sin vueltas.{' '}
              <em style={{ color: '#FFC55C' }}>Sin sentirte solo.</em>
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* ── PRICING */}
      <section style={{ padding: '100px 0', background: 'var(--white)' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '16px' }}>Precio</motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, color: 'var(--text)', marginBottom: '40px' }}>
              Un precio. Sin sorpresas.
            </motion.h2>
            <motion.div variants={fadeUp} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', padding: '40px 32px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>€9,99</div>
              <div style={{ fontSize: '14px', color: 'var(--text-3)', margin: '8px 0 32px' }}>al mes · sin permanencia</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', textAlign: 'left' }}>
                {['Preguntas de todas las materias', 'Corrección inmediata con explicación', 'Estadísticas de progreso detalladas', 'Acceso desde cualquier dispositivo', '7 días gratis para empezar'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-2)' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <Link to="/register" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'var(--orange)', color: 'white',
                padding: '14px 28px', borderRadius: 'var(--radius-md)',
                fontSize: '15px', fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.18s, transform 0.18s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--orange-deep)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--orange)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                Empieza gratis hoy <ArrowRight size={16} />
              </Link>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '16px' }}>Sin tarjeta hasta que termine la prueba gratis.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ */}
      <section style={{ padding: '100px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 40px' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeUp} style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '16px', textAlign: 'center' }}>
              Preguntas frecuentes
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 600, color: 'var(--text)', marginBottom: '48px', textAlign: 'center' }}>
              Todo lo que necesitas saber.
            </motion.h2>
            <motion.div variants={fadeUp} style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '0 32px' }}>
              {faqs.map(f => <FaqItem key={f.q} {...f} />)}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA */}
      <section style={{ background: 'var(--blue)', padding: '80px 0', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{ maxWidth: '540px', margin: '0 auto', padding: '0 40px' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, color: 'white', marginBottom: '8px', lineHeight: 1.3 }}>
            La universidad también puede empezar hoy,
          </h2>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(20px, 2.5vw, 28px)', color: '#FFC55C', marginBottom: '36px' }}>
            desde donde estás.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--orange)', color: 'white',
            padding: '14px 32px', borderRadius: 'var(--radius-md)',
            fontSize: '15px', fontWeight: 500, textDecoration: 'none',
            transition: 'background 0.18s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--orange-deep)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--orange)'}
          >
            Empieza a practicar hoy <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER */}
      <footer style={{ background: 'var(--text)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'white' }}>
          prep<span style={{ color: 'var(--orange)' }}>prueba</span>
        </span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[{ to: '/privacidad', label: 'Privacidad' }, { to: '/terminos', label: 'Términos' }].map(l => (
            <Link key={l.to} to={l.to} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
            >{l.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
