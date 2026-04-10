import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { admin as adminApi, materias as materiasApi } from '../../services/api';
import { PreguntaForm } from './PreguntaForm';
import { ImportCSV } from './ImportCSV';
import { Spinner } from '../../components/ui/Spinner';
import styles from './Admin.module.css';

interface AdminPregunta {
  id: string;
  enunciado: string;
  tipo: 'TEST' | 'ABIERTA';
  dificultad: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
  fuente: 'OFICIAL' | 'GENERADA';
  activa: boolean;
  materiaNombre: string;
  materiaId: string;
  opciones: { id: string; texto: string; esCorrecta: boolean; orden: number }[];
  createdAt: string;
}

interface MateriaOption {
  id: string;
  nombre: string;
}

interface AdminStats {
  materiaId: string;
  nombre: string;
  activas: number;
  inactivas: number;
  total: number;
}

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [preguntas, setPreguntas] = useState<AdminPregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [materiasList, setMateriasList] = useState<MateriaOption[]>([]);
  const [stats, setStats] = useState<AdminStats[]>([]);

  // Filters
  const [filterMateria, setFilterMateria] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterActiva, setFilterActiva] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingPregunta, setEditingPregunta] = useState<AdminPregunta | null>(null);
  const [showImport, setShowImport] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const fetchPreguntas = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '25' };
      if (filterMateria) params.materiaId = filterMateria;
      if (filterTipo) params.tipo = filterTipo;
      if (filterActiva) params.activa = filterActiva;

      const data = await adminApi.listPreguntas(params);
      setPreguntas(data.preguntas);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading preguntas:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterMateria, filterTipo, filterActiva]);

  useEffect(() => {
    fetchPreguntas();
  }, [fetchPreguntas]);

  useEffect(() => {
    materiasApi.list().then((res) => {
      setMateriasList(res.map((m) => ({ id: m.id, nombre: m.nombre })));
    });
    adminApi.stats().then(setStats);
  }, []);

  const handleToggle = async (id: string) => {
    await adminApi.togglePregunta(id);
    fetchPreguntas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar esta pregunta?')) return;
    await adminApi.deletePregunta(id);
    fetchPreguntas();
  };

  const handleEdit = (p: AdminPregunta) => {
    setEditingPregunta(p);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPregunta(null);
  };

  const handleFormSaved = () => {
    handleFormClose();
    fetchPreguntas();
    adminApi.stats().then(setStats);
  };

  const handleImportClose = () => setShowImport(false);

  const handleImportDone = () => {
    setShowImport(false);
    fetchPreguntas();
    adminApi.stats().then(setStats);
  };

  const totalActivas = stats.reduce((s, m) => s + m.activas, 0);
  const totalAll = stats.reduce((s, m) => s + m.total, 0);

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className={styles['admin-page']}>
      <button className={styles['admin-back']} onClick={() => navigate('/dashboard')}>
        ← Volver al dashboard
      </button>

      <div className={styles['admin-header']}>
        <h1>Panel de Administración</h1>
        <div className={styles['admin-header-actions']}>
          <button
            className={`${styles['admin-btn']} ${styles['admin-btn--secondary']}`}
            onClick={() => setShowImport(true)}
          >
            📥 Importar CSV
          </button>
          <button
            className={`${styles['admin-btn']} ${styles['admin-btn--primary']}`}
            onClick={() => { setEditingPregunta(null); setShowForm(true); }}
          >
            ＋ Nueva pregunta
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles['admin-stats-bar']}>
        <div className={styles['admin-stat-card']}>
          <div className={styles['admin-stat-card-name']}>Total preguntas</div>
          <div className={styles['admin-stat-card-value']}>{totalAll}</div>
          <div className={styles['admin-stat-card-sub']}>{totalActivas} activas</div>
        </div>
        {stats.slice(0, 5).map((s) => (
          <div key={s.materiaId} className={styles['admin-stat-card']}>
            <div className={styles['admin-stat-card-name']}>{s.nombre}</div>
            <div className={styles['admin-stat-card-value']}>{s.activas}</div>
            <div className={styles['admin-stat-card-sub']}>{s.inactivas} inactivas</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles['admin-filters']}>
        <select
          className={styles['admin-select']}
          value={filterMateria}
          onChange={(e) => { setFilterMateria(e.target.value); setPage(1); }}
        >
          <option value="">Todas las materias</option>
          {materiasList.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        <select
          className={styles['admin-select']}
          value={filterTipo}
          onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
        >
          <option value="">Todos los tipos</option>
          <option value="TEST">Test</option>
          <option value="ABIERTA">Abierta</option>
        </select>
        <select
          className={styles['admin-select']}
          value={filterActiva}
          onChange={(e) => { setFilterActiva(e.target.value); setPage(1); }}
        >
          <option value="">Activas e inactivas</option>
          <option value="true">Solo activas</option>
          <option value="false">Solo inactivas</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles['admin-loading']}><Spinner size={32} /></div>
      ) : preguntas.length === 0 ? (
        <div className={styles['admin-empty']}>
          <div className={styles['admin-empty-icon']}>📋</div>
          <p>No se han encontrado preguntas con estos filtros.</p>
        </div>
      ) : (
        <div className={styles['admin-table-wrap']}>
          <table className={styles['admin-table']}>
            <thead>
              <tr>
                <th>Materia</th>
                <th>Enunciado</th>
                <th>Tipo</th>
                <th>Dificultad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map((p) => (
                <tr key={p.id}>
                  <td>{p.materiaNombre}</td>
                  <td className={styles['admin-enunciado']} title={p.enunciado}>
                    {p.enunciado}
                  </td>
                  <td>
                    <span className={`${styles['admin-tag']} ${styles[`admin-tag--${p.tipo.toLowerCase()}`]}`}>
                      {p.tipo}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles['admin-tag']} ${styles[`admin-tag--${p.dificultad.toLowerCase()}`]}`}>
                      {p.dificultad}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles['admin-tag']} ${styles[p.activa ? 'admin-tag--active' : 'admin-tag--inactive']}`}>
                      {p.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className={styles['admin-actions-cell']}>
                      <button
                        className={`${styles['admin-btn']} ${styles['admin-btn--ghost']} ${styles['admin-btn--sm']}`}
                        onClick={() => handleEdit(p)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles['admin-btn']} ${styles['admin-btn--ghost']} ${styles['admin-btn--sm']}`}
                        onClick={() => handleToggle(p.id)}
                        title={p.activa ? 'Desactivar' : 'Activar'}
                      >
                        {p.activa ? '🔴' : '🟢'}
                      </button>
                      <button
                        className={`${styles['admin-btn']} ${styles['admin-btn--ghost']} ${styles['admin-btn--sm']}`}
                        onClick={() => handleDelete(p.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles['admin-pagination']}>
            <span className={styles['admin-pagination-info']}>
              Mostrando {((page - 1) * 25) + 1}–{Math.min(page * 25, total)} de {total}
            </span>
            <div className={styles['admin-pagination-btns']}>
              <button
                className={`${styles['admin-btn']} ${styles['admin-btn--secondary']} ${styles['admin-btn--sm']}`}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Anterior
              </button>
              <button
                className={`${styles['admin-btn']} ${styles['admin-btn--secondary']} ${styles['admin-btn--sm']}`}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <PreguntaForm
          pregunta={editingPregunta}
          materias={materiasList}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportCSV
          onClose={handleImportClose}
          onDone={handleImportDone}
        />
      )}
    </div>
  );
}
