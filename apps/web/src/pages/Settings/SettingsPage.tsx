import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, CreditCard, LogOut, Camera, 
  MapPin, Phone, Mail, FileText, Calendar 
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { stripe as stripeApi, auth as authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { staggerContainer } from '../../lib/animations';
import s from './Settings.module.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, subscription, logout, fetchMe } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nombre: user?.nombre ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
    provincia: user?.provincia ?? '',
    comunidad: user?.comunidad ?? '',
    pais: user?.pais ?? 'España',
    fechaExamen: user?.fechaExamen ? user.fechaExamen.split('T')[0] : '',
  });

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  async function handleSaveSettings() {
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.update(formData);
      setSuccess('Perfil actualizado correctamente.');
      await fetchMe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los ajustes.');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError('');
    try {
      await authApi.uploadAvatar(file);
      setSuccess('Foto de perfil actualizada.');
      await fetchMe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setUploadLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const { portalUrl } = await stripeApi.portal();
      window.location.href = portalUrl ?? '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al acceder al portal.');
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const { checkoutUrl } = await stripeApi.checkout();
      window.location.href = checkoutUrl ?? '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar el pago.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  return (
    <div className={s.settingsPage}>
      {/* ── Custom Nav */}
      <nav className={s.nav}>
        <div className={s.navContent}>
          <button onClick={() => navigate('/dashboard')} className={s.backBtn}>
            <ArrowLeft size={14} /> Volver
          </button>
          <span className={s.navTitle}>Configuración de Perfil</span>
        </div>
      </nav>

      <main className={s.content}>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className={s.content}>
          
          {/* ── Alertas */}
          {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}
          {success && <div className={`${s.alert} ${s.alertSuccess}`}>{success}</div>}

          {/* ── Identidad */}
          <section className={s.section}>
            <header className={s.sectionHeader}>
              <div className={s.sectionIcon}><User size={16} /></div>
              <h2 className={s.sectionTitle}>Identidad</h2>
            </header>
            <div className={s.sectionBody}>
              <div className={s.avatarContainer}>
                <div className={s.avatarWrapper} onClick={handleAvatarClick}>
                  {user?.avatarUrl ? (
                    <img 
                      src={`${API_URL}${user.avatarUrl}`} 
                      alt={user.nombre ?? ''} 
                      className={s.avatarImg} 
                    />
                  ) : (
                    <div className={s.avatarFallback}>{initials}</div>
                  )}
                  <div className={s.avatarOverlay}>
                    <Camera color="white" size={20} />
                  </div>
                  {uploadLoading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner-small" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <button onClick={handleAvatarClick} className={s.changeAvatarBtn}>
                  Cambiar foto de perfil
                </button>
              </div>

              <div className={s.formGrid}>
                <div className={s.inputGroup}>
                  <label className={s.label}><User size={12} /> Nombre completo</label>
                  <input 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Tu nombre completo"
                    className={s.input}
                  />
                </div>
                <div className={s.inputGroup}>
                  <label className={s.label}><Mail size={12} /> Email (Protegido)</label>
                  <input 
                    value={user?.email ?? ''}
                    disabled
                    className={s.input}
                  />
                </div>
              </div>

              <div className={s.inputGroup}>
                <label className={s.label}><Phone size={12} /> Teléfono (Opcional)</label>
                <input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+34 600 000 000"
                  className={s.input}
                />
              </div>

              <div className={s.inputGroup}>
                <label className={s.label}><FileText size={12} /> Sobre mí</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Cuéntanos un poco sobre tus objetivos de estudio..."
                  className={`${s.input} ${s.textarea}`}
                />
              </div>
            </div>
          </section>

          {/* ── Residencia */}
          <section className={s.section}>
            <header className={s.sectionHeader}>
              <div className={s.sectionIcon}><MapPin size={16} /></div>
              <h2 className={s.sectionTitle}>Ubicación</h2>
            </header>
            <div className={s.sectionBody}>
              <div className={s.formGrid}>
                <div className={s.inputGroup}>
                  <label className={s.label}>Comunidad Autónoma</label>
                  <input 
                    value={formData.comunidad}
                    onChange={(e) => setFormData({...formData, comunidad: e.target.value})}
                    placeholder="Ej: Comunidad de Madrid"
                    className={s.input}
                  />
                </div>
                <div className={s.inputGroup}>
                  <label className={s.label}>Provincia</label>
                  <input 
                    value={formData.provincia}
                    onChange={(e) => setFormData({...formData, provincia: e.target.value})}
                    placeholder="Ej: Madrid"
                    className={s.input}
                  />
                </div>
              </div>
              <div className={s.inputGroup}>
                <label className={s.label}>País</label>
                <input 
                  value={formData.pais}
                  onChange={(e) => setFormData({...formData, pais: e.target.value})}
                  className={s.input}
                />
              </div>
            </div>
          </section>

          {/* ── Objetivos */}
          <section className={s.section}>
            <header className={s.sectionHeader}>
              <div className={s.sectionIcon}><Calendar size={16} /></div>
              <h2 className={s.sectionTitle}>Objetivos Académicos</h2>
            </header>
            <div className={s.sectionBody}>
              <div className={s.inputGroup}>
                <label className={s.label}>Fecha del Examen</label>
                <input 
                  type="date"
                  value={formData.fechaExamen}
                  onChange={(e) => setFormData({...formData, fechaExamen: e.target.value})}
                  className={s.input}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-3)', fontStyle: 'italic', marginTop: '8px' }}>
                  * Usamos esta fecha para mostrarte la cuenta atrás en el inicio.
                </p>
              </div>
            </div>
          </section>

          <div className={s.actions}>
            <Button 
              onClick={handleSaveSettings} 
              disabled={saveLoading} 
              size="lg"
              style={{ paddingLeft: '40px', paddingRight: '40px' }}
            >
              {saveLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>

          {/* ── Suscripción */}
          <section className={s.section}>
            <header className={s.sectionHeader}>
              <div className={s.sectionIcon}><CreditCard size={16} /></div>
              <h2 className={s.sectionTitle}>Plan y Suscripción</h2>
            </header>
            <div className={s.sectionBody}>
              {isActive ? (
                <div>
                  <div className={s.subStatus}>
                    <span className={s.subBadge}>Activo</span>
                    {periodEnd && (
                      <span className={s.subMeta}>
                        €9,99/mes · Próxima renovación: {periodEnd}
                      </span>
                    )}
                  </div>
                  <Button variant="secondary" onClick={handlePortal} disabled={portalLoading} style={{ width: '100%', fontSize: '13px' }}>
                    {portalLoading ? 'Abriendo portal...' : 'Gestionar pagos y facturación'}
                  </Button>
                </div>
              ) : (
                <div className={s.premiumPitch}>
                  <p className={s.pitchText}>
                    No tienes un plan activo actualmente. Desbloquea acceso total a preguntas oficiales y corrección IA.
                  </p>
                  <Button variant="orange" onClick={handleCheckout} disabled={checkoutLoading} style={{ width: '100%', padding: '16px' }}>
                    {checkoutLoading ? 'Cargando...' : 'Activar Premium — €9,99/mes'}
                  </Button>
                  <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '16px' }}>
                    Garantía de satisfacción · Cancela cuando quieras
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Logout */}
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className={s.logoutBtn}
          >
            <LogOut size={16} /> Cerrar sesión
          </button>

        </motion.div>
      </main>

      <style>{`
        .spinner-small {
          width: 20px; height: 20px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
