import { useState, useEffect } from 'react';
import { admin as adminApi } from '../../services/api';
import styles from './Admin.module.css';

interface Opcion {
  id?: string;
  texto: string;
  esCorrecta: boolean;
  orden: number;
}

interface PreguntaData {
  id?: string;
  enunciado: string;
  tipo: 'TEST' | 'ABIERTA';
  dificultad: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
  materiaId: string;
  opciones: Opcion[];
}

interface Props {
  pregunta: PreguntaData | null;
  materias: { id: string; nombre: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export function PreguntaForm({ pregunta, materias, onClose, onSaved }: Props) {
  const isEdit = !!pregunta?.id;

  const [materiaId, setMateriaId] = useState(pregunta?.materiaId ?? (materias[0]?.id ?? ''));
  const [enunciado, setEnunciado] = useState(pregunta?.enunciado ?? '');
  const [tipo, setTipo] = useState<'TEST' | 'ABIERTA'>(pregunta?.tipo ?? 'TEST');
  const [dificultad, setDificultad] = useState<'BASICO' | 'INTERMEDIO' | 'AVANZADO'>(pregunta?.dificultad ?? 'INTERMEDIO');
  const [opciones, setOpciones] = useState<Opcion[]>(
    pregunta?.opciones?.length
      ? pregunta.opciones
      : [
          { texto: '', esCorrecta: true, orden: 0 },
          { texto: '', esCorrecta: false, orden: 1 },
          { texto: '', esCorrecta: false, orden: 2 },
          { texto: '', esCorrecta: false, orden: 3 },
        ]
  );
  const [respuestaEsperada, setRespuestaEsperada] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pregunta) {
      setMateriaId(pregunta.materiaId);
      setEnunciado(pregunta.enunciado);
      setTipo(pregunta.tipo);
      setDificultad(pregunta.dificultad);
      if (pregunta.opciones?.length) {
        setOpciones(pregunta.opciones);
      }
    }
  }, [pregunta]);

  const handleOpcionTexto = (idx: number, texto: string) => {
    setOpciones((prev) => prev.map((o, i) => i === idx ? { ...o, texto } : o));
  };

  const handleOpcionCorrecta = (idx: number) => {
    setOpciones((prev) => prev.map((o, i) => ({ ...o, esCorrecta: i === idx })));
  };

  const handleSubmit = async () => {
    setError('');
    if (!enunciado.trim()) {
      setError('El enunciado es obligatorio');
      return;
    }
    if (!materiaId) {
      setError('Selecciona una materia');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        materiaId,
        enunciado,
        tipo,
        dificultad,
      };

      if (tipo === 'TEST') {
        const validOpciones = opciones.filter((o) => o.texto.trim());
        if (validOpciones.length < 2) {
          setError('Al menos 2 opciones son necesarias');
          setSaving(false);
          return;
        }
        body.opciones = validOpciones;
      } else {
        if (respuestaEsperada.trim()) {
          body.respuestaEsperada = respuestaEsperada;
        }
      }

      if (isEdit && pregunta?.id) {
        await adminApi.updatePregunta(pregunta.id, body);
      } else {
        await adminApi.createPregunta(body);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles['admin-modal-overlay']} onClick={onClose}>
      <div className={styles['admin-modal']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['admin-modal-header']}>
          <h2>{isEdit ? 'Editar pregunta' : 'Nueva pregunta'}</h2>
          <button
            className={`${styles['admin-btn']} ${styles['admin-btn--ghost']}`}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles['admin-modal-body']}>
          {error && (
            <div style={{
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--text-sm)',
            }}>
              {error}
            </div>
          )}

          <div className={styles['admin-form-row']}>
            <div className={styles['admin-form-group']}>
              <label>Materia</label>
              <select
                className={styles['admin-form-select']}
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
              >
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles['admin-form-group']}>
              <label>Tipo</label>
              <select
                className={styles['admin-form-select']}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'TEST' | 'ABIERTA')}
              >
                <option value="TEST">Test</option>
                <option value="ABIERTA">Abierta</option>
              </select>
            </div>
          </div>

          <div className={styles['admin-form-group']}>
            <label>Dificultad</label>
            <select
              className={styles['admin-form-select']}
              value={dificultad}
              onChange={(e) => setDificultad(e.target.value as 'BASICO' | 'INTERMEDIO' | 'AVANZADO')}
            >
              <option value="BASICO">Básico</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
            </select>
          </div>

          <div className={styles['admin-form-group']}>
            <label>Enunciado</label>
            <textarea
              className={styles['admin-textarea']}
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              placeholder="Escribe el enunciado de la pregunta..."
              rows={4}
            />
          </div>

          {tipo === 'TEST' ? (
            <div className={styles['admin-form-group']}>
              <label>Opciones (marca la correcta)</label>
              <div className={styles['admin-options-list']}>
                {opciones.map((op, idx) => (
                  <div key={idx} className={styles['admin-option-row']}>
                    <span className={styles['admin-option-label']}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="radio"
                      name="correcta"
                      checked={op.esCorrecta}
                      onChange={() => handleOpcionCorrecta(idx)}
                    />
                    <input
                      type="text"
                      value={op.texto}
                      onChange={(e) => handleOpcionTexto(idx, e.target.value)}
                      placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles['admin-form-group']}>
              <label>Respuesta esperada (referencia)</label>
              <textarea
                className={styles['admin-textarea']}
                value={respuestaEsperada}
                onChange={(e) => setRespuestaEsperada(e.target.value)}
                placeholder="Respuesta de referencia para la corrección por IA..."
                rows={3}
              />
            </div>
          )}
        </div>

        <div className={styles['admin-modal-footer']}>
          <button
            className={`${styles['admin-btn']} ${styles['admin-btn--secondary']}`}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className={`${styles['admin-btn']} ${styles['admin-btn--primary']}`}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear pregunta'}
          </button>
        </div>
      </div>
    </div>
  );
}
