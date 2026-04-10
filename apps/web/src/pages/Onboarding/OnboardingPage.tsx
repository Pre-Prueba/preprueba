import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { auth as authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { staggerContainer, fadeUp, slideInRight, slideInLeft } from '../../lib/animations';

const PRUEBA_OPTIONS = [
  {
    value: 'MAYORES_25',
    label: 'Mayores de 25',
    sub: 'Acceso general con todas las materias',
    testId: 'prueba-mayores-25',
  },
  {
    value: 'MAYORES_40',
    label: 'Mayores de 40',
    sub: 'Sin materias específicas, enfocado en competencias',
    testId: 'prueba-mayores-40',
  },
  {
    value: 'MAYORES_45',
    label: 'Mayores de 45',
    sub: 'Solo entrevista personal y prueba escrita',
    testId: 'prueba-mayores-45',
  },
];

const CCAA = [
  'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
  'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Extremadura', 'Galicia',
  'La Rioja', 'Madrid', 'Murcia', 'Navarra', 'País Vasco', 'Valencia', 'Ceuta', 'Melilla',
];

/* Step dots */
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '40px', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === step ? '24px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: i + 1 <= step ? 'var(--blue)' : 'var(--surface)',
            border: i + 1 <= step ? 'none' : '1px solid var(--border)',
            transition: 'all 0.3s var(--ease-out)',
          }}
        />
      ))}
    </div>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [pruebaType, setPruebaType] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function goForward(nextStep: number) {
    setDirection('forward');
    setStep(nextStep);
  }

  function goBack(prevStep: number) {
    setDirection('back');
    setStep(prevStep);
  }

  async function handleFinish() {
    if (!pruebaType || !comunidad) return;
    setLoading(true);
    try {
      await authApi.onboarding(pruebaType, comunidad);
      await fetchMe();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar tus preferencias.');
    } finally {
      setLoading(false);
    }
  }

  const slideVariants = direction === 'forward' ? slideInRight : slideInLeft;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, var(--blue-soft) 0%, var(--bg) 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '20px', color: 'var(--text)' }}>
            prep<span style={{ color: 'var(--blue)' }}>prueba</span>
          </span>
        </div>

        <StepDots step={step} total={3} />

        <AnimatePresence mode="wait" initial={false}>

          {/* ── STEP 1: Tipo de prueba */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.div variants={staggerContainer} initial="hidden" animate="show">
                <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>
                  ¿Para qué prueba te preparas?
                </motion.h1>
                <motion.p variants={fadeUp} style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '32px', textAlign: 'center', lineHeight: 1.6 }}>
                  Aquí no vienes a memorizar PDFs. Vienes a <strong>practicar, entender y avanzar.</strong>
                </motion.p>

                <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {PRUEBA_OPTIONS.map((opt) => {
                    const selected = pruebaType === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        variants={fadeUp}
                        data-testid={opt.testId}
                        onClick={() => setPruebaType(opt.value)}
                        style={{
                          padding: '18px 20px',
                          borderRadius: 'var(--radius-lg)',
                          border: `1.5px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
                          background: selected ? 'var(--blue-soft)' : 'var(--white)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.18s',
                          display: 'flex', alignItems: 'center', gap: '16px',
                          boxShadow: selected ? 'var(--shadow-sm)' : 'none',
                        }}
                      >
                        <div style={{
                          width: '40px', height: '40px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                          background: selected ? 'var(--blue)' : 'var(--surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: selected ? 'white' : 'var(--text-3)',
                          transition: 'all 0.18s',
                        }}>
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: selected ? 'var(--blue)' : 'var(--text)' }}>{opt.label}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>{opt.sub}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <Button variant="orange" fullWidth disabled={!pruebaType} onClick={() => goForward(2)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Continuar <ArrowRight size={16} />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2: Comunidad */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.div variants={staggerContainer} initial="hidden" animate="show">
                <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>
                  ¿En qué comunidad autónoma?
                </motion.h1>
                <motion.p variants={fadeUp} style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '32px', textAlign: 'center', lineHeight: 1.6 }}>
                  Filtramos las preguntas según los exámenes de tu comunidad.
                </motion.p>

                <motion.div variants={fadeUp}>
                  <select
                    aria-label="Comunidad autónoma"
                    name="comunidad"
                    value={comunidad}
                    onChange={(e) => setComunidad(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${comunidad ? 'var(--blue)' : 'var(--border)'}`,
                      fontSize: '15px',
                      fontFamily: 'var(--font-ui)',
                      color: comunidad ? 'var(--text)' : 'var(--text-3)',
                      background: 'var(--white)',
                      marginBottom: '28px',
                      outline: 'none',
                      transition: 'border-color 0.18s',
                    }}
                  >
                    <option value="">Selecciona tu comunidad</option>
                    {CCAA.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </motion.div>

                <motion.div variants={fadeUp} style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="ghost" onClick={() => goBack(1)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={15} /> Atrás
                  </Button>
                  <Button variant="orange" fullWidth disabled={!comunidad} onClick={() => goForward(3)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Continuar <ArrowRight size={16} />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 3: Bienvenida */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ textAlign: 'center' }}>
                <motion.div variants={fadeUp} style={{ marginBottom: '20px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'var(--blue-soft)', border: '1px solid var(--blue-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                  }}>
                    <BookOpen size={32} color="var(--blue)" />
                  </div>
                </motion.div>

                <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.2 }}>
                  Todo listo{user?.nombre ? `, ${user.nombre}` : ''}.
                </motion.h1>

                <motion.p variants={fadeUp} style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '8px' }}>
                  Tienes <strong>7 días gratis</strong> para practicar sin compromisos.
                </motion.p>
                <motion.p variants={fadeUp} style={{ fontSize: '14px', color: 'var(--text-3)', marginBottom: '36px' }}>
                  Puedes cancelar cuando quieras.
                </motion.p>

                {error && (
                  <motion.div variants={fadeUp} style={{ background: 'var(--error-bg)', border: '1px solid rgba(214,69,69,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--error)', marginBottom: '16px' }}>
                    {error}
                  </motion.div>
                )}

                <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button variant="orange" size="lg" fullWidth onClick={handleFinish} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loading ? 'Un momento...' : 'Ir a practicar'}
                    {!loading && <ArrowRight size={17} />}
                  </Button>
                  <Button variant="ghost" onClick={() => goBack(2)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ArrowLeft size={14} /> Volver
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
