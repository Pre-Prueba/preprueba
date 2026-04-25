import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Layers, AlertCircle, FileText } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import s from './SearchModal.module.css';

const ICONS: Record<string, React.ReactNode> = {
  question: <BookOpen size={16} />,
  topic: <FileText size={16} />,
  error: <AlertCircle size={16} />,
  flashcard: <Layers size={16} />,
};

const LABELS: Record<string, string> = {
  questions: 'Preguntas',
  topics: 'Materias',
  errors: 'Errores',
  flashcards: 'Flashcards',
};

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: results, isLoading } = useSearch(query, activeType as any);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const allResults = useMemo(() => {
    if (!results) return [];
    return Object.entries(results).flatMap(([category, items]) =>
      (items as any[]).map((item) => ({ ...item, category }))
    );
  }, [results]);

  function handleSelect(item: any) {
    setOpen(false);
    setQuery('');
    if (item.link) navigate(item.link);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        className={s.searchTrigger}
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        title="Buscar (Ctrl+K)"
      >
        <Search size={16} />
        <span>Buscar...</span>
        <kbd className={s.searchKbd}>⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={s.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className={s.modal}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.inputWrap}>
                <Search size={18} className={s.inputIcon} />
                <input
                  ref={inputRef}
                  className={s.input}
                  placeholder="Buscar preguntas, materias, errores..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button className={s.clearBtn} onClick={() => setQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className={s.tabs}>
                {['all', 'questions', 'topics', 'errors', 'flashcards'].map((t) => (
                  <button
                    key={t}
                    className={`${s.tab} ${activeType === t ? s.tabActive : ''}`}
                    onClick={() => setActiveType(t)}
                  >
                    {t === 'all' ? 'Todo' : LABELS[t]}
                  </button>
                ))}
              </div>

              <div className={s.results}>
                {isLoading && query.trim().length >= 2 && (
                  <div className={s.empty}>Buscando...</div>
                )}

                {!isLoading && query.trim().length >= 2 && allResults.length === 0 && (
                  <div className={s.empty}>Sin resultados</div>
                )}

                {query.trim().length < 2 && (
                  <div className={s.empty}>Escribe al menos 2 caracteres</div>
                )}

                {!isLoading && allResults.map((item, idx) => (
                  <button
                    key={`${item.category}-${item.id}-${idx}`}
                    className={s.resultItem}
                    onClick={() => handleSelect(item)}
                  >
                    <span className={s.resultIcon}>{ICONS[item.type] || <Search size={16} />}</span>
                    <div className={s.resultText}>
                      <div className={s.resultTitle}>{item.title}</div>
                      <div className={s.resultMeta}>{item.subtitle} · {LABELS[item.category]}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className={s.footer}>
                <span><kbd>↑</kbd> <kbd>↓</kbd> navegar</span>
                <span><kbd>↵</kbd> seleccionar</span>
                <span><kbd>esc</kbd> cerrar</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
