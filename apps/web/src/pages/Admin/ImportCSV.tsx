import { useState, useRef } from 'react';
import { admin as adminApi } from '../../services/api';
import styles from './Admin.module.css';

interface ImportResult {
  insertadas: number;
  errores: number;
  total: number;
  detalle: { fila: number; status: 'ok' | 'error'; error?: string; enunciado?: string }[];
}

interface Props {
  onClose: () => void;
  onDone: () => void;
}

function parseCSVPreview(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  return lines.slice(0, 6).map((line) => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields;
  });
}

export function ImportCSV({ onClose, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setPreview(parseCSVPreview(content));
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const data = await adminApi.importCSV(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles['admin-modal-overlay']} onClick={onClose}>
      <div className={styles['admin-modal']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['admin-modal-header']}>
          <h2>Importar preguntas desde CSV</h2>
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

          {!result ? (
            <>
              <div className={styles['admin-import-zone']}>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <div className={styles['admin-import-zone-icon']}>📄</div>
                <p>Haz clic o arrastra un archivo CSV</p>
                <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--color-text-muted)' }}>
                  Formato: materia, enunciado, tipo, dificultad, opcionA, opcionB, opcionC, opcionD, correcta, respuestaEsperada
                </p>
                {file && (
                  <div className={styles['admin-import-filename']}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {preview && preview.length > 1 && (
                <div className={styles['admin-import-preview']}>
                  <h3>Vista previa (primeras {Math.min(preview.length - 1, 5)} filas)</h3>
                  <div className={styles['admin-table-wrap']} style={{ marginTop: '12px' }}>
                    <table className={styles['admin-table']}>
                      <thead>
                        <tr>
                          {preview[0].map((h, i) => (
                            <th key={i}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(1).map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles['admin-import-results']}>
              <div className={styles['admin-import-summary']}>
                <div className={styles['admin-import-stat']}>
                  <div className={`${styles['admin-import-stat-value']} ${styles['admin-import-stat-value--ok']}`}>
                    {result.insertadas}
                  </div>
                  <div className={styles['admin-import-stat-label']}>Insertadas</div>
                </div>
                <div className={styles['admin-import-stat']}>
                  <div className={`${styles['admin-import-stat-value']} ${styles['admin-import-stat-value--err']}`}>
                    {result.errores}
                  </div>
                  <div className={styles['admin-import-stat-label']}>Errores</div>
                </div>
                <div className={styles['admin-import-stat']}>
                  <div className={styles['admin-import-stat-value']}>
                    {result.total}
                  </div>
                  <div className={styles['admin-import-stat-label']}>Total filas</div>
                </div>
              </div>

              {result.errores > 0 && (
                <div className={styles['admin-table-wrap']} style={{ marginTop: '16px' }}>
                  <table className={styles['admin-table']}>
                    <thead>
                      <tr>
                        <th>Fila</th>
                        <th>Estado</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.detalle.filter((d) => d.status === 'error').map((d, i) => (
                        <tr key={i}>
                          <td>{d.fila}</td>
                          <td>
                            <span className={`${styles['admin-tag']} ${styles['admin-tag--inactive']}`}>Error</span>
                          </td>
                          <td style={{ fontSize: '12px' }}>{d.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles['admin-modal-footer']}>
          {result ? (
            <button
              className={`${styles['admin-btn']} ${styles['admin-btn--primary']}`}
              onClick={onDone}
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                className={`${styles['admin-btn']} ${styles['admin-btn--secondary']}`}
                onClick={onClose}
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                className={`${styles['admin-btn']} ${styles['admin-btn--primary']}`}
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? 'Importando...' : 'Confirmar importación'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
