import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  ExternalLink,
  BookOpen,
  Play,
  Shield,
  Zap,
  MapPin,
  GraduationCap,
  BookMarked,
  ChevronRight,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { examDocs as examDocsApi } from '../../services/api';
import { staggerContainer, fadeUp } from '../../lib/animations';
import type { ExamDocItem, TipoDocumento } from '../../services/api';
import css from './Examenes.module.css';

// ─── Label maps ───────────────────────────────────────────────────────────────
const TIPO_LABEL: Record<TipoDocumento, string> = {
  EXAMEN_OFICIAL:        'Examen oficial',
  MODELO:                'Modelo',
  CONVOCATORIA_ANTERIOR: 'Conv. anterior',
  ORIENTACIONES:         'Orientaciones',
  CRITERIOS_CORRECCION:  'Criterios',
  SOLUCIONARIO:          'Solucionario',
};

const TIPO_COLOR: Record<TipoDocumento, string> = {
  EXAMEN_OFICIAL:        css.tipoOficial,
  MODELO:                css.tipoModelo,
  CONVOCATORIA_ANTERIOR: css.tipoConv,
  ORIENTACIONES:         css.tipoOrient,
  CRITERIOS_CORRECCION:  css.tipoCriterios,
  SOLUCIONARIO:          css.tipoSolucionario,
};

const POPULAR_COMMUNITIES = [
  'Comunidad de Madrid',
  'Andalucía',
  'Comunitat Valenciana',
  'Castilla y León',
  'Aragón',
];

const POPULAR_SUBJECTS = [
  'Lengua Castellana y Literatura',
  'Inglés',
  'Historia de España',
  'Comentario de Texto',
];

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const { data } = useQuery({
    queryKey: ['exam-docs-stats'],
    queryFn: () => examDocsApi.stats(),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { icon: MapPin,        label: 'Comunidades',  value: data?.numCommunities ?? '—' },
    { icon: GraduationCap, label: 'Universidades', value: data?.numUniversities ?? '—' },
    { icon: FileText,      label: 'Documentos',   value: data?.numDocuments ?? '—' },
    { icon: BookMarked,    label: 'Materias',     value: data?.numSubjects ?? '—' },
  ];

  return (
    <div className={css.statsBar}>
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className={css.statItem}>
          <Icon size={16} className={css.statIcon} />
          <span className={css.statValue}>{value}</span>
          <span className={css.statLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ExamCard({ doc }: { doc: ExamDocItem }) {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeUp} className={css.card}>
      <div className={css.cardTop}>
        <span className={`${css.tipoBadge} ${TIPO_COLOR[doc.documentType]}`}>
          {TIPO_LABEL[doc.documentType]}
        </span>
        <div className={css.cardBadges}>
          {doc.isOfficial && (
            <span className={css.officialBadge} title="Fuente oficial">
              <Shield size={10} />
              Oficial
            </span>
          )}
          {doc.isInteractive && (
            <span className={css.interactiveBadge} title="Versión interactiva disponible">
              <Zap size={10} />
              Interactivo
            </span>
          )}
          <span className={css.yearBadge}>{doc.year}</span>
        </div>
      </div>

      <div className={css.cardMain}>
        <h3 className={css.cardSubject}>{doc.subject}</h3>
        <p className={css.cardUniversity}>{doc.university}</p>
        <div className={css.cardMeta}>
          <span className={css.metaTag}>
            <MapPin size={11} />
            {doc.community}
          </span>
          {doc.call && (
            <span className={css.metaTag}>
              <Calendar size={11} />
              {doc.call.charAt(0).toUpperCase() + doc.call.slice(1)}
            </span>
          )}
        </div>
      </div>

      <div className={css.cardActions}>
        {doc.pdfUrl && (
          <a
            href={doc.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={css.btnPdf}
            aria-label={`Ver PDF de ${doc.subject}`}
          >
            <ExternalLink size={13} />
            Ver PDF
          </a>
        )}
        <button
          className={css.btnDetail}
          onClick={() => navigate(`/examenes/doc/${doc.id}`)}
          aria-label={`Ver detalles de ${doc.subject}`}
        >
          <BookOpen size={13} />
          Detalles
        </button>
        {doc.isInteractive && (
          <button
            className={css.btnResolve}
            onClick={() => navigate(`/examenes/doc/${doc.id}/resolver`)}
            aria-label={`Resolver ${doc.subject}`}
          >
            <Play size={13} />
            Resolver
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className={css.skeletonCard}>
      <div className={css.skeletonLine} style={{ width: '40%', height: 20 }} />
      <div className={css.skeletonLine} style={{ width: '70%', height: 22, marginTop: 12 }} />
      <div className={css.skeletonLine} style={{ width: '55%', height: 15, marginTop: 6 }} />
      <div className={css.skeletonLine} style={{ width: '80%', height: 14, marginTop: 6 }} />
      <div className={css.skeletonActions}>
        <div className={css.skeletonBtn} />
        <div className={css.skeletonBtn} />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ExamenesPage() {
  const [q, setQ]                     = useState('');
  const [subject, setSubject]         = useState('');
  const [community, setCommunity]     = useState('');
  const [university, setUniversity]   = useState('');
  const [year, setYear]               = useState('');
  const [docType, setDocType]         = useState('');
  const [oficiales, setOficiales]     = useState(false);
  const [interactivos, setInterac]    = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = !!(subject || community || university || year || docType || oficiales || interactivos || q);

  const { data, isLoading } = useQuery({
    queryKey: ['exam-docs', q, subject, community, university, year, docType, oficiales, interactivos],
    queryFn: () =>
      examDocsApi.list({
        q:               q || undefined,
        subject:         subject || undefined,
        community:       community || undefined,
        university:      university || undefined,
        year:            year ? parseInt(year) : undefined,
        documentType:    docType || undefined,
        soloOficiales:   oficiales || undefined,
        soloInteractivos: interactivos || undefined,
        limit: 60,
      }),
    staleTime: 60_000,
  });

  const { data: recentData } = useQuery({
    queryKey: ['exam-docs-recent'],
    queryFn: () => examDocsApi.recent(),
    staleTime: 5 * 60 * 1000,
  });

  const docs       = data?.docs ?? [];
  const facets     = data?.facets;
  const recentDocs = recentData?.docs ?? [];

  const clearAll = () => {
    setQ(''); setSubject(''); setCommunity(''); setUniversity('');
    setYear(''); setDocType(''); setOficiales(false); setInterac(false);
  };

  const showExplorer = !isLoading && !hasFilters;

  return (
    <div className={css.page}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className={css.header}>
        <div className={css.headerText}>
          <h1 className={css.title}>Exámenes Reales</h1>
          <p className={css.subtitle}>
            Biblioteca oficial de pruebas de acceso para mayores de 25 años —
            universidades y comunidades autónomas de España.
          </p>
        </div>
        <StatsBar />
      </header>

      {/* ── Search + filters toggle ─────────────────────────────────── */}
      <div className={css.toolBar}>
        <div className={css.searchRow}>
          <div className={css.searchWrapper}>
            <Search size={18} className={css.searchIcon} aria-hidden />
            <input
              type="search"
              placeholder="Busca por materia, comunidad, universidad…"
              className={css.searchInput}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar exámenes"
            />
            {q && (
              <button className={css.searchClear} onClick={() => setQ('')} aria-label="Limpiar búsqueda">
                <X size={15} />
              </button>
            )}
          </div>
          <button
            className={`${css.filtersToggle} ${filtersOpen ? css.filtersToggleActive : ''}`}
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={15} />
            Filtros
            {hasFilters && !q && <span className={css.filtersBubble} />}
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              className={css.filtersPanel}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className={css.filtersGrid}>
                {/* Materia */}
                <div className={css.filterField}>
                  <label className={css.filterLabel}>Materia</label>
                  <div className={css.selectWrapper}>
                    <select className={css.filterSelect} value={subject} onChange={(e) => setSubject(e.target.value)}>
                      <option value="">Todas</option>
                      {facets?.subjects.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className={css.selectChevron} />
                  </div>
                </div>

                {/* Comunidad */}
                <div className={css.filterField}>
                  <label className={css.filterLabel}>Comunidad</label>
                  <div className={css.selectWrapper}>
                    <select className={css.filterSelect} value={community} onChange={(e) => { setCommunity(e.target.value); setUniversity(''); }}>
                      <option value="">Todas</option>
                      {facets?.communities.map((com) => (
                        <option key={com} value={com}>{com}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className={css.selectChevron} />
                  </div>
                </div>

                {/* Universidad */}
                <div className={css.filterField}>
                  <label className={css.filterLabel}>Universidad</label>
                  <div className={css.selectWrapper}>
                    <select className={css.filterSelect} value={university} onChange={(e) => setUniversity(e.target.value)}>
                      <option value="">Todas</option>
                      {facets?.universities.map((uni) => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className={css.selectChevron} />
                  </div>
                </div>

                {/* Año */}
                <div className={css.filterField}>
                  <label className={css.filterLabel}>Año</label>
                  <div className={css.selectWrapper}>
                    <select className={css.filterSelect} value={year} onChange={(e) => setYear(e.target.value)}>
                      <option value="">Cualquier año</option>
                      {facets?.years.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className={css.selectChevron} />
                  </div>
                </div>

                {/* Tipo */}
                <div className={css.filterField}>
                  <label className={css.filterLabel}>Tipo de documento</label>
                  <div className={css.selectWrapper}>
                    <select className={css.filterSelect} value={docType} onChange={(e) => setDocType(e.target.value)}>
                      <option value="">Todos</option>
                      {(Object.keys(TIPO_LABEL) as TipoDocumento[]).map((t) => (
                        <option key={t} value={t}>{TIPO_LABEL[t]}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className={css.selectChevron} />
                  </div>
                </div>

                {/* Toggles */}
                <div className={css.filterToggles}>
                  <button
                    className={`${css.toggleChip} ${oficiales ? css.toggleChipOn : ''}`}
                    onClick={() => setOficiales((v) => !v)}
                    aria-pressed={oficiales}
                  >
                    <Shield size={13} />
                    Solo oficiales
                  </button>
                  <button
                    className={`${css.toggleChip} ${interactivos ? css.toggleChipOn : ''}`}
                    onClick={() => setInterac((v) => !v)}
                    aria-pressed={interactivos}
                  >
                    <Zap size={13} />
                    Solo interactivos
                  </button>
                </div>
              </div>

              {hasFilters && (
                <button className={css.clearBtn} onClick={clearAll}>
                  <X size={13} />
                  Limpiar todos los filtros
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick explore (no filters) ──────────────────────────────── */}
      <AnimatePresence>
        {showExplorer && (
          <motion.section
            className={css.explorer}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            aria-label="Exploración rápida"
          >
            <div className={css.explorerBlock}>
              <p className={css.explorerLabel}><MapPin size={13} /> Comunidades populares</p>
              <div className={css.chipRow}>
                {POPULAR_COMMUNITIES.map((com) => (
                  <button key={com} className={css.chip} onClick={() => { setCommunity(com); setFiltersOpen(true); }}>
                    {com}
                  </button>
                ))}
              </div>
            </div>

            <div className={css.explorerBlock}>
              <p className={css.explorerLabel}><BookMarked size={13} /> Materias frecuentes</p>
              <div className={css.chipRow}>
                {POPULAR_SUBJECTS.map((sub) => (
                  <button key={sub} className={css.chip} onClick={() => { setSubject(sub); setFiltersOpen(true); }}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {recentDocs.length > 0 && (
              <div className={css.explorerBlock}>
                <p className={css.explorerLabel}><Zap size={13} /> Últimos añadidos</p>
                <div className={css.recentRow}>
                  {recentDocs.slice(0, 4).map((doc) => (
                    <button key={doc.id} className={css.recentItem} onClick={() => setQ(doc.subject)}>
                      <span className={css.recentSubject}>{doc.subject}</span>
                      <span className={css.recentMeta}>{doc.university} · {doc.year}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Results count ───────────────────────────────────────────── */}
      {!isLoading && hasFilters && (
        <p className={css.resultsCount} role="status">
          {docs.length === 0
            ? 'No se encontraron documentos'
            : `${docs.length} ${docs.length === 1 ? 'documento' : 'documentos'} encontrados`}
        </p>
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className={css.grid} aria-busy aria-label="Cargando exámenes">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!isLoading && hasFilters && docs.length === 0 && (
        <div className={css.emptyState} role="status">
          <div className={css.emptyIcon}><FileText size={34} /></div>
          <h3 className={css.emptyTitle}>Sin resultados para esta búsqueda</h3>
          <p className={css.emptyDesc}>Prueba con otros términos o navega por comunidad o materia.</p>
          <div className={css.emptySuggestions}>
            {POPULAR_COMMUNITIES.slice(0, 3).map((com) => (
              <button key={com} className={css.chip} onClick={() => { clearAll(); setCommunity(com); }}>
                <MapPin size={11} /> {com}
              </button>
            ))}
          </div>
          <button className={css.clearBtn} onClick={clearAll} style={{ marginTop: 16 }}>
            <X size={13} /> Limpiar filtros
          </button>
        </div>
      )}

      {/* ── Document grid ───────────────────────────────────────────── */}
      {!isLoading && docs.length > 0 && (
        <motion.div
          className={css.grid}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          aria-label="Listado de exámenes"
        >
          {docs.map((doc: ExamDocItem) => <ExamCard key={doc.id} doc={doc} />)}
        </motion.div>
      )}
    </div>
  );
}
