import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, RotateCcw, SkipForward, Keyboard } from 'lucide-react';
import { flashcards as flashcardsApi } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FlashcardItem } from '../../services/api';
import s from './Flashcards.module.css';

interface FlashcardStudyModeProps {
  cards: FlashcardItem[];
  onClose: () => void;
}

export function FlashcardStudyMode({ cards, onClose }: FlashcardStudyModeProps) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentCard = cards[currentIndex];

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'facil' | 'dificil' | 'pendiente' }) => 
      flashcardsApi.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    }
  });

  const handleNext = useCallback((estado?: 'facil' | 'dificil' | 'pendiente') => {
    if (estado && currentCard) {
      updateEstadoMutation.mutate({ id: currentCard.id, estado });
    }
    
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose(); // Finished studying
      }
    }, 200);
  }, [currentIndex, cards.length, currentCard, updateEstadoMutation, onClose]);

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
        if (e.key === '1') handleNext('dificil');
        if (e.key === '2') handleNext('pendiente');
        if (e.key === '3') handleNext('facil');
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
              onClick={() => handleNext('dificil')}
            >
              <span className={s.btnKbd}>1</span>
              Aún es difícil
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${s.actionBtnStudy} ${s.btnPendiente}`} 
              onClick={() => handleNext('pendiente')}
            >
              <span className={s.btnKbd}>2</span>
              Dudoso / Revisar
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${s.actionBtnStudy} ${s.btnFacil}`} 
              onClick={() => handleNext('facil')}
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
