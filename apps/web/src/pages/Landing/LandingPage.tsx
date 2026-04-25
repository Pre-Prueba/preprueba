import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  GraduationCap,
  LineChart,
  MessageCircle,
  NotebookTabs,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import styles from './Landing.module.css';

type ValueItem = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

type FeatureKind = 'practice' | 'flashcards' | 'exam' | 'planner' | 'progress' | 'pipo';

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  kind: FeatureKind;
};

const navLinks = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#materias', label: 'Materias' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
];

const valueItems: ValueItem[] = [
  {
    icon: GraduationCap,
    title: 'Para acceso +25, +40 y +45',
    subtitle: 'Oficial y adaptado a cada vía.',
  },
  {
    icon: BookOpen,
    title: '18+ materias',
    subtitle: 'Todas las asignaturas clave.',
  },
  {
    icon: Clock3,
    title: 'Sesiones de 10–15 min',
    subtitle: 'Estudia en bloques breves.',
  },
  {
    icon: Sparkles,
    title: 'Prueba gratis 7 días',
    subtitle: 'Sin tarjeta. Cancela cuando quieras.',
  },
];

const steps = [
  {
    title: 'Elige tu materia',
    text: 'Selecciona la asignatura que quieres mejorar.',
  },
  {
    title: 'Practica por bloques breves',
    text: 'Sesiones de 10–15 minutos con preguntas clave.',
  },
  {
    title: 'Revisa tus errores',
    text: 'Entiende, corrige y evita repetirlos.',
    accent: 'orange',
  },
  {
    title: 'Sigue el plan con PIPO',
    text: 'Tu mentor te guía cada día para mantenerte en foco.',
    accent: 'pipo',
  },
];

const featureCards: FeatureCard[] = [
  {
    icon: Target,
    title: 'Práctica por materias',
    description: 'Miles de preguntas clasificadas por tema y dificultad.',
    kind: 'practice',
  },
  {
    icon: NotebookTabs,
    title: 'Flashcards',
    description: 'Repasos rápidos para recordar lo importante.',
    kind: 'flashcards',
  },
  {
    icon: Timer,
    title: 'Simulacros',
    description: 'Exámenes completos con tiempo real y corrección automática.',
    kind: 'exam',
  },
  {
    icon: CalendarDays,
    title: 'Planificador',
    description: 'Organiza tus sesiones y cumple tus objetivos.',
    kind: 'planner',
  },
  {
    icon: LineChart,
    title: 'Progreso visible',
    description: 'Mide tu avance y mejora cada semana.',
    kind: 'progress',
  },
  {
    icon: MessageCircle,
    title: 'Mentor PIPO',
    description: 'Acompañamiento diario para que sigas adelante.',
    kind: 'pipo',
  },
];

const sidebarItems = [
  'Inicio',
  'Practicar',
  'Flashcards',
  'Simulacros',
  'Planificador',
  'Desempeño',
  'Exámenes',
  'Mis errores',
];

const platformCalloutsLeft = [
  ['Inicio', 'Tu panel diario y objetivos'],
  ['Desempeño', 'Métricas de progreso y acierto'],
  ['Flashcards', 'Repasa lo esencial'],
];

const platformCalloutsRight = [
  ['Planificador', 'Organiza tus sesiones'],
  ['Simulacros', 'Exámenes con condiciones reales'],
  ['Mentor PIPO', 'Tu guía te acompaña cada día'],
];

const benefits = [
  {
    title: 'Estudia a tu ritmo',
    text: 'Sesiones cortas para encajar en tu día a día.',
  },
  {
    title: 'Menos caos, más claridad',
    text: 'Todo organizado para que sepas qué hacer hoy.',
  },
  {
    title: 'Progreso visible',
    text: 'Métricas simples que te motivan a seguir mejorando.',
  },
  {
    title: 'Acompañamiento diario',
    text: 'PIPO te anima y te ayuda a no perder el rumbo.',
  },
];

const subjects = [
  'Matemáticas',
  'Química',
  'Biología',
  'Lengua',
  'Historia',
  'Inglés',
  'Geografía',
  'Filosofía',
  'y más',
];

const testimonials = [
  {
    quote: 'PIPO me mantiene enfocada cada día. Las sesiones cortas encajan perfecto con mi trabajo.',
    name: 'Laura M.',
    subtitle: 'Acceso +25',
    avatar: 'LM',
  },
  {
    quote: 'Los simulacros son muy realistas y las explicaciones me ayudan a entender de verdad.',
    name: 'Carlos R.',
    subtitle: 'Acceso +40',
    avatar: 'CR',
  },
  {
    quote: 'Desde que sigo el plan, voy mucho más tranquila y con confianza.',
    name: 'Marta G.',
    subtitle: 'Acceso +45',
    avatar: 'MG',
  },
];

const faqItems = [
  {
    question: '¿Para qué tipo de prueba sirve PREPRUEBA?',
    answer:
      'Sirve para preparar la PAU y las vías de acceso +25, +40 y +45 con práctica por materias, simulacros y seguimiento de progreso.',
  },
  {
    question: '¿Puedo estudiar si trabajo?',
    answer:
      'Sí. La plataforma está pensada para sesiones breves de 10–15 minutos, para que puedas avanzar incluso con poco tiempo diario.',
  },
  {
    question: '¿Qué incluye la prueba gratis?',
    answer:
      'Incluye acceso a la práctica, flashcards, simulacros, planificador, métricas de progreso y acompañamiento de PIPO durante 7 días.',
  },
  {
    question: '¿Puedo cancelar cuando quiera?',
    answer:
      'Sí. No hay permanencia. Puedes cancelar cuando quieras desde tu cuenta y mantener el acceso hasta el final del periodo activo.',
  },
];

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      P
    </span>
  );
}

function BrandLogo() {
  return (
    <a className={styles.brandLogo} href="/" aria-label="PREPRUEBA">
      <BrandMark />
      <span className={styles.brandWord}>PREPRUEBA</span>
    </a>
  );
}

function Pipo({ size = 'large' }: { size?: 'large' | 'small' | 'mini' }) {
  const sizeClass =
    size === 'mini' ? styles.pipoMini : size === 'small' ? styles.pipoSmall : styles.pipoLarge;
  const src =
    size === 'mini'
      ? '/assets/pipo-book.png'
      : size === 'small'
        ? '/assets/pipo-celebrate.png'
        : '/assets/pipo-hero.png';

  return (
    <div className={`${styles.pipo} ${sizeClass}`} aria-hidden="true">
      <img src={src} alt="" loading={size === 'large' ? 'eager' : 'lazy'} decoding="async" />
    </div>
  );
}

function LandingHeader({ onCta }: { onCta: () => void }) {
  return (
    <header className={styles.publicHeader}>
      <nav className={styles.publicNav} aria-label="Navegación principal">
        <BrandLogo />
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <button className={styles.headerCta} type="button" onClick={onCta}>
          Empieza gratis
        </button>
      </nav>
    </header>
  );
}

function HeroSection({ onCta }: { onCta: () => void }) {
  return (
    <section className={styles.heroSection} aria-labelledby="hero-title">
      <div className={styles.heroDecorGrid} aria-hidden="true" />
      <span className={`${styles.spark} ${styles.sparkOrange}`} aria-hidden="true" />
      <span className={`${styles.spark} ${styles.sparkBlue}`} aria-hidden="true" />
      <span className={styles.heroSwirl} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>PREPRUEBA PARA PAU</p>
          <h1 id="hero-title">
            Practica hoy.
            <br />
            Aprueba este año.
          </h1>
          <p className={styles.heroLead}>
            Prepárate para la PAU con sesiones breves,
            <br />
            seguimiento claro y el acompañamiento
            <br />
            de tu mentor PIPO.
          </p>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroPipoHalo} />
          <Pipo />
          <div className={styles.heroBubble}>
            <span>Plan claro</span>
            <strong>12 min hoy</strong>
          </div>
        </div>

        <div className={styles.heroActionsBlock}>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} type="button" onClick={onCta}>
              Prueba gratis 7 días
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a className={styles.secondaryButton} href="#demo">
              <PlayCircle size={18} aria-hidden="true" />
              Ver demo
            </a>
          </div>
          <p className={styles.microcopy}>
            <Check size={16} aria-hidden="true" />
            Sin tarjeta. Cancela cuando quieras.
          </p>
        </div>
      </div>
    </section>
  );
}

function ProductMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.productMockup} ${compact ? styles.productMockupCompact : ''}`}>
      <div className={styles.browserBar}>
        <span className={styles.browserDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.browserUrl}>preprueba.app/inicio</span>
      </div>

      <div className={styles.mockDashboard}>
        <aside className={styles.mockSidebar}>
          <div className={styles.mockBrand}>
            <BrandMark />
            <span>PREPRUEBA</span>
          </div>
          <div className={styles.mockMenu}>
            {sidebarItems.map((item, index) => (
              <span key={item} className={index === 0 ? styles.mockMenuActive : ''}>
                {item}
              </span>
            ))}
          </div>
        </aside>

        <div className={styles.mockMain}>
          <div className={styles.mockGreeting}>
            <div>
              <span className={styles.mockOverline}>Tu sesión de hoy</span>
              <h3>Hola, Laura</h3>
              <p>Empieza por Química y cierra el bloque con 8 preguntas clave.</p>
            </div>
            <button type="button">Practicar</button>
          </div>

          <div className={styles.mockContentGrid}>
            <div className={`${styles.mockCard} ${styles.mockRecommended}`}>
              <span>Materia recomendada</span>
              <strong>Química</strong>
              <p>Enlaces químicos y formulación</p>
              <div className={styles.mockProgressTrack}>
                <i style={{ width: '68%' }} />
              </div>
            </div>

            <div className={`${styles.mockCard} ${styles.mockPipoCard}`}>
              <Pipo size="mini" />
              <div>
                <span>PIPO mentor</span>
                <strong>Hoy basta con avanzar un bloque.</strong>
              </div>
            </div>

            <div className={`${styles.mockCard} ${styles.mockCircleCard}`}>
              <div className={styles.mockCircle}>74%</div>
              <span>Progreso semanal</span>
            </div>

            <div className={`${styles.mockCard} ${styles.mockStatsCard}`}>
              <span>Racha</span>
              <strong>5 días</strong>
              <p>42 preguntas esta semana</p>
            </div>
          </div>

          <div className={styles.mockBottomGrid}>
            <div className={styles.mockChart}>
              <div>
                <span>Acierto medio</span>
                <strong>62%</strong>
              </div>
              <span style={{ height: '34%' }} />
              <span style={{ height: '48%' }} />
              <span style={{ height: '55%' }} />
              <span style={{ height: '68%' }} />
              <span style={{ height: '76%' }} />
            </div>
            <div className={styles.mockNext}>
              <span>Próximo simulacro</span>
              <strong>Viernes, 18:30</strong>
              <p>Lengua · 1h 30m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductMockupSection() {
  return (
    <section id="demo" className={styles.mockupSection} aria-label="Vista previa de PREPRUEBA">
      <div className={styles.mockupShell}>
        <ProductMockup />
      </div>
    </section>
  );
}

function ValueStrip() {
  return (
    <section className={styles.valueStrip} aria-label="Resumen de valor">
      <div className={styles.valueGrid}>
        {valueItems.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={styles.valueCard}>
              <span className={styles.valueIcon}>
                <Icon size={21} aria-hidden="true" />
              </span>
              <div>
                <h2>{item.title}</h2>
                <p>{item.subtitle}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function renderFeatureMini(kind: FeatureKind) {
  if (kind === 'practice') {
    return (
      <div className={styles.miniPractice}>
        <span>Química</span>
        <strong>Acierto 68%</strong>
        <i>
          <b />
        </i>
      </div>
    );
  }

  if (kind === 'flashcards') {
    return (
      <div className={styles.miniFlashcard}>
        <span>Flashcard</span>
        <strong>
          ¿Qué es un enlace
          <br />
          covalente?
        </strong>
      </div>
    );
  }

  if (kind === 'exam') {
    return (
      <div className={styles.miniExam}>
        <div>
          <span>Simulacro PAU</span>
          <strong>1h 30m</strong>
        </div>
        <i>72%</i>
      </div>
    );
  }

  if (kind === 'planner') {
    return (
      <div className={styles.miniPlanner}>
        {['L', 'M', 'X', 'J', 'V'].map((day, index) => (
          <span key={day} className={index === 1 || index === 3 ? styles.dayDone : ''}>
            {day}
          </span>
        ))}
      </div>
    );
  }

  if (kind === 'progress') {
    return (
      <div className={styles.miniProgress}>
        <div>
          <span>Acierto medio</span>
          <strong>55%</strong>
        </div>
        <svg viewBox="0 0 150 54" aria-hidden="true">
          <polyline points="4,44 34,34 62,38 90,22 120,26 146,10" />
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.miniPipoMessage}>
      <Pipo size="mini" />
      <span>
        ¡Tú puedes!
        <br />
        Sigue así 💪
      </span>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="como-funciona" className={styles.howSection}>
      <div className={styles.sectionGrid}>
        <div className={styles.processColumn}>
          <p className={styles.eyebrow}>CÓMO FUNCIONA</p>
          <h2>
            Una forma más clara
            <br />
            de preparar la PAU.
          </h2>
          <p>Un método simple para que avances con enfoque y sin perder tiempo.</p>

          <div className={styles.stepList}>
            {steps.map((step, index) => (
              <article
                key={step.title}
                className={`${styles.stepItem} ${
                  step.accent === 'orange'
                    ? styles.stepOrange
                    : step.accent === 'pipo'
                      ? styles.stepPipo
                      : ''
                }`}
              >
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.featuresColumn}>
          <p className={styles.gridEyebrow}>TODO LO QUE NECESITAS PARA AVANZAR CON CONFIANZA</p>
          <div className={styles.featureGrid}>
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className={styles.featureCard}>
                  <div className={styles.featureTop}>
                    <span className={styles.featureIcon}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <h3>{card.title}</h3>
                  </div>
                  <p>{card.description}</p>
                  {renderFeatureMini(card.kind)}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function InsidePlatformSection() {
  return (
    <section className={styles.insideSection} aria-labelledby="inside-title">
      <div className={styles.insideIntro}>
        <p className={styles.eyebrow}>ASÍ SE VE POR DENTRO</p>
        <h2 id="inside-title">
          Todo lo que necesitas,
          <br />
          en un solo lugar.
        </h2>
      </div>

      <div className={styles.insideShowcase}>
        <div className={`${styles.calloutColumn} ${styles.calloutLeft}`}>
          {platformCalloutsLeft.map(([title, text]) => (
            <article key={title} className={styles.calloutCard}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className={styles.insideMockupWrap}>
          <ProductMockup compact />
        </div>

        <div className={`${styles.calloutColumn} ${styles.calloutRight}`}>
          {platformCalloutsRight.map(([title, text]) => (
            <article key={title} className={styles.calloutCard}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsStrip() {
  return (
    <section className={styles.benefitsSection}>
      <div className={styles.benefitsHeader}>
        <p className={styles.eyebrow}>PENSADO PARA QUIENES ESTUDIAN CON POCO TIEMPO</p>
      </div>
      <div className={styles.benefitsGrid}>
        {benefits.map((benefit) => (
          <article key={benefit.title} className={styles.benefitCard}>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </article>
        ))}
        <div className={styles.benefitPipo}>
          <Pipo size="small" />
        </div>
      </div>
    </section>
  );
}

function SubjectsSection() {
  return (
    <section id="materias" className={styles.subjectsSection}>
      <p className={styles.eyebrow}>TODAS TUS MATERIAS EN UN SOLO LUGAR</p>
      <div className={styles.subjectChips}>
        {subjects.map((subject) => (
          <span key={subject} className={styles.subjectChip}>
            <BookOpen size={16} aria-hidden="true" />
            {subject}
          </span>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="opiniones" className={styles.testimonialsPublic}>
      <div className={styles.sectionIntro}>
        <p className={styles.eyebrow}>LO QUE DICEN LOS ESTUDIANTES</p>
      </div>
      <div className={styles.testimonialGridPublic}>
        {testimonials.map((testimonial, index) => (
          <article key={testimonial.name} className={styles.testimonialPublicCard}>
            <div className={styles.stars} aria-label="5 de 5 estrellas">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} size={17} fill="currentColor" aria-hidden="true" />
              ))}
            </div>
            <blockquote>{testimonial.quote}</blockquote>
            <div className={styles.testimonialAuthor}>
              <span className={`${styles.avatar} ${styles[`avatar${index + 1}`]}`}>
                {testimonial.avatar}
              </span>
              <div>
                <strong>{testimonial.name}</strong>
                <p>{testimonial.subtitle}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingFaqSection({ onCta }: { onCta: () => void }) {
  return (
    <section id="precios" className={styles.pricingFaqSection}>
      <div className={styles.pricingFaqGrid}>
        <div className={styles.pricingColumn}>
          <p className={styles.eyebrow}>UN PRECIO SIMPLE PARA EMPEZAR</p>
          <article className={styles.pricingPublicCard}>
            <span className={styles.pricingBadgePublic}>7 días gratis</span>
            <div className={styles.priceLine}>€9.99 / mes</div>
            <ul className={styles.checkList}>
              <li>
                <Check size={18} aria-hidden="true" />
                Sin permanencia
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Cancela cuando quieras
              </li>
            </ul>
            <button className={styles.primaryButton} type="button" onClick={onCta}>
              Empezar gratis
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <p>Sin tarjeta. Cancela cuando quieras.</p>
          </article>
        </div>

        <div id="faq" className={styles.faqColumn}>
          <p className={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
          <div className={styles.faqListPublic}>
            {faqItems.map((item, index) => (
              <details key={item.question} className={styles.faqPublicItem} open={index === 0}>
                <summary>
                  <span>{item.question}</span>
                  <span className={styles.faqPlus}>+</span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({ onCta }: { onCta: () => void }) {
  return (
    <section className={styles.finalCtaSection}>
      <div className={styles.finalCtaBand}>
        <span className={styles.finalSwirl} aria-hidden="true" />
        <div>
          <p className={styles.eyebrow}>PREPRUEBA</p>
          <h2>Empieza hoy con un plan claro.</h2>
          <div className={styles.finalButtons}>
            <button className={styles.primaryButton} type="button" onClick={onCta}>
              Prueba gratis
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a className={styles.secondaryButton} href="#demo">
              Ver demo
            </a>
          </div>
        </div>
        <Pipo size="small" />
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className={styles.landingFooter}>
      <div className={styles.footerGridPublic}>
        <div className={styles.footerBrandPublic}>
          <BrandLogo />
          <p>
            Prepárate para la PAU con claridad,
            <br />
            enfoque y acompañamiento diario.
          </p>
        </div>

        <div className={styles.footerColumnPublic}>
          <h2>Producto</h2>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#materias">Materias</a>
          <a href="#precios">Precios</a>
        </div>

        <div className={styles.footerColumnPublic}>
          <h2>Recursos</h2>
          <a href="/">Blog</a>
          <a href="/">Guías</a>
          <a href="#faq">Preguntas frecuentes</a>
        </div>

        <div className={styles.footerColumnPublic}>
          <h2>Empresa</h2>
          <a href="/">Sobre nosotros</a>
          <a href="mailto:hola@preprueba.es">Contacto</a>
          <a href="/terminos">Términos y privacidad</a>
        </div>

        <div className={styles.footerSocial}>
          <h2>Síguenos</h2>
          <div>
            <a href="/" aria-label="Instagram">
              <Camera size={19} aria-hidden="true" />
            </a>
            <a href="/" aria-label="YouTube">
              <PlayCircle size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <p className={styles.footerBottom}>© 2025 PREPRUEBA. Todos los derechos reservados.</p>
    </footer>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const goRegister = () => navigate('/register');

  return (
    <div className={styles.publicLanding}>
      <LandingHeader onCta={goRegister} />
      <main>
        <HeroSection onCta={goRegister} />
        <ProductMockupSection />
        <ValueStrip />
        <HowItWorksSection />
        <InsidePlatformSection />
        <BenefitsStrip />
        <SubjectsSection />
        <TestimonialsSection />
        <PricingFaqSection onCta={goRegister} />
        <FinalCtaSection onCta={goRegister} />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
