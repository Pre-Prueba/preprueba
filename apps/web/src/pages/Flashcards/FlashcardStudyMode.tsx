import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, RotateCcw, SkipForward, Keyboard } from 'lucide-react';
import { flashcards as flashcardsApi } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FlashcardItem } from '../../services/api';
import s from './Flashcards.module.css';

const STORAGE_KEY = 'preprueba_flashcard_progress';

interface SavedProgress {
  deckId: string;
  currentIndex: number;
  evaluations: Record<string, number>;
  timestamp: number;
}

function getSavedProgress(deckId: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: SavedProgress = JSON.parse(raw);
    if (data.deckId !== deckId) return null;
    // Expira após 7 dias
    if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveProgress(deckId: string, currentIndex: number, evaluations: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ deckId, currentIndex, evaluations, timestamp: Date.now() }));
  } catch {
    // ignore
  }
}

interface FlashcardStudyModeProps {
  cards: FlashcardItem[];
  onClose: () => void;
}

export function FlashcardStudyMode({ cards, onClose }: FlashcardStudyModeProps) {
  const queryClient = useQueryClient();
  const deckId = cards.map((c) => c.id).join(',');
  const saved = getSavedProgress(deckId);

  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex ?? 0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, number>>(saved?.evaluations ?? {});
  
  const currentCard = cards[currentIndex];

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado, rating }: { id: string; estado: 'facil' | 'dificil' | 'pendiente'; rating?: 1 | 2 | 3 }) =>
      flashcardsApi.updateEstado(id, estado, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    }
  });

  const handleNext = useCallback((estado?: 'facil' | 'dificil' | 'pendiente', rating?: 1 | 2 | 3) => {
    if (estado && currentCard) {
      updateEstadoMutation.mutate({ id: currentCard.id, estado, rating });
      if (rating) {
        setEvaluations((prev) => {
          const next = { ...prev, [currentCard.id]: rating };
          saveProgress(deckId, currentIndex + 1, next);
          return next;
        });
      }
    }

    const nextIndex = currentIndex + 1;
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(nextIndex);
        saveProgress(deckId, nextIndex, evaluations);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        onClose(); // Finished studying
      }
    }, 200);
  }, [currentIndex, cards.length, currentCard, updateEstadoMutation, onClose, deckId, evaluations]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
      }, 200);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Persist progress on tab close
  useEffect(() => {
    function handleBeforeUnload() {
      saveProgress(deckId, currentIndex, evaluations);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [deckId, currentIndex, evaluations]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        if (isFlipped) handleNext();
        else handleFlip();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleNext('dificil', 1);
        if (e.key === '2') handleNext('pendiente', 2);
        if (e.key === '3') handleNext('facil', 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, isFlipped]);

  if (!currentCard) return null;

  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <div className={s.studyingOverlay}>
      <div className={s.studyHeader}>
        <div className={s.studyHeaderLeft}>
          <h2 className={s.studyTitle}>Estudiando Flashcards</h2>
          <div className={s.studyMeta}>
            <span className={s.progressText}>Tarjeta {currentIndex + 1} de {cards.length}</span>
            <div className={s.progressBarMini}>
              <motion.div 
                className={s.progressFillMini}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className={s.studyHeaderActions}>
          <div className={s.kbdHint}>
            <Keyboard size={14} />
            <span>Usa flechas y espacio</span>
          </div>
          <button className={s.closeStudyBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className={s.studyContainer}>
        {/* Navigation Buttons (Floating) */}
        <button 
          className={`${s.navBtn} ${s.navBtnLeft}`} 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          className={`${s.navBtn} ${s.navBtnRight}`} 
          onClick={() => isFlipped ? handleNext() : handleFlip()}
        >
          {isFlipped ? <ChevronRight size={24} /> : <RotateCcw size={20} />}
        </button>

        <div className={s.flipCardContainer} onClick={handleFlip}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`${s.flipCard} ${isFlipped ? s.isFlipped : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div className={s.cardFace}>
                <div className={s.cardHeaderInner}>
                  <span className={s.cardCategory}>{currentCard.materia?.nombre || 'General'}</span>
                  {currentCard.estado !== 'pendiente' && (
                    <span className={`${s.cardStatusBadge} ${s[`status-${currentCard.estado}`]}`}>
                      {currentCard.estado === 'facil' ? 'Dominado' : 'Revisar'}
                    </span>
                  )}
                </div>
                <div className={s.cardContentWrapper}>
                  <p className={s.cardContent}>{currentCard.frente}</p>
                </div>
                {!isFlipped && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className={s.flipHint}
                  >
                    <RotateCcw size={14} />
                    <span>Haz clic o pulsa Espacio para virar</span>
                  </motion.div>
                )}
              </div>

              {/* Back */}
              <div className={`${s.cardFace} ${s.cardFaceBack}`}>
                <div className={s.cardHeaderInner}>
                  <span className={s.cardCategory}>Resposta</span>
                </div>
                <div className={s.cardContentWrapper}>
                  <p className={s.cardContentDorso}>{currentCard.dorso}</p>
                </div>
                <div className={s.backHint}>
                  <Keyboard size={12} />
                  <span>Usa 1, 2 ou 3 para avaliar</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={`${s.studyActions} ${isFlipped ? s.visible : ''}`}>
          <div className={s.actionGroup}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${s.actionBtnStudy} ${s.btnDificil}`}
              onClick={() => handleNext('dificil', 1)}
            >
              <span className={s.btnKbd}>1</span>
              Aún es difícil
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${s.actionBtnStudy} ${s.btnPendiente}`}
              onClick={() => handleNext('pendiente', 2)}
            >
              <span className={s.btnKbd}>2</span>
              Dudoso / Revisar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${s.actionBtnStudy} ${s.btnFacil}`}
              onClick={() => handleNext('facil', 3)}
            >
              <span className={s.btnKbd}>3</span>
              ¡Entendido!
            </motion.button>
          </div>
          
          <button className={s.skipBtn} onClick={() => handleNext()}>
            Saltar
            <SkipForward size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
