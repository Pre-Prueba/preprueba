import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Calendar,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutGrid,
  LibraryBig,
  MapPin,
  Play,
  Rows3,
  Search,
  Shield,
  SlidersHorizontal,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { examDocs as examDocsApi } from '../../services/api';
import { fadeUp, staggerContainer } from '../../lib/animations';
import type { ExamDocFacetItem, ExamDocItem, TipoDocumento } from '../../services/api';
import css from './Examenes.module.css';

const RESULTS_PER_PAGE = 18;

const TIPO_LABEL: Record<TipoDocumento, string> = {
  EXAMEN_OFICIAL: 'Examen oficial',
  MODELO: 'Modelo',
  CONVOCATORIA_ANTERIOR: 'Convocatoria anterior',
  ORIENTACIONES: 'Orientaciones',
  CRITERIOS_CORRECCION: 'Criterios de corrección',
  SOLUCIONARIO: 'Solucionario',
};

const TIPO_COLOR: Record<TipoDocumento, string> = {
  EXAMEN_OFICIAL: css.tipoOficial,
  MODELO: css.tipoModelo,
  CONVOCATORIA_ANTERIOR: css.tipoConv,
  ORIENTACIONES: css.tipoOrient,
  CRITERIOS_CORRECCION: css.tipoCriterios,
  SOLUCIONARIO: css.tipoSolucionario,
};

type ViewMode = 'grid' | 'list';

function formatCall(call: string | null | undefined): string | null {
  if (!call) return null;
  return call.charAt(0).toUpperCase() + call.slice(1);
}

function sortStringFacets(items: ExamDocFacetItem<string>[] | undefined): ExamDocFacetItem<string>[] {
  return [...(items ?? [])].sort((a, b) => a.value.localeCompare(b.value, 'es'));
}

function sortYearFacets(items: ExamDocFacetItem<number>[] | undefined): ExamDocFacetItem<number>[] {
  return [...(items ?? [])].sort((a, b) => b.value - a.value);
}

function resultSummary(page: number, limit: number, total: number, currentCount: number): string {
  if (total === 0) return 'Sin resultados publicados para esta combinación.';

  const start = (page - 1) * limit + 1;
  const end = start + currentCount - 1;
  return `Mostrando ${start}-${end} de ${total} documentos publicados.`;
}

function StatsBar() {
  const { data } = useQuery({
    queryKey: ['exam-docs-stats'],
    queryFn: () => examDocsApi.stats(),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { icon: MapPin, label: 'Comunidades', value: data?.numCommunities ?? '—' },
    { icon: GraduationCap, label: 'Universidades', value: data?.numUniversities ?? '—' },
    { icon: FileText, label: 'Documentos', value: data?.numDocuments ?? '—' },
    { icon: BookMarked, label: 'Materias', value: data?.numSubjects ?? '—' },
  ];

  return (
    <div className={css.statsBar} aria-label="Métricas del acervo">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className={css.statItem}>
          <Icon size={16} className={css.statIcon} aria-hidden />
          <span className={css.statValue}>{value}</span>
          <span className={css.statLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function ResultBadges({ doc }: { doc: ExamDocItem }) {
  return (
    <div className={css.cardBadges}>
      <span className={`${css.tipoBadge} ${TIPO_COLOR[doc.documentType]}`}>
        {TIPO_LABEL[doc.documentType]}
      </span>
      {doc.isOfficial && (
        <span className={css.officialBadge} title="Fuente oficial">
          <Shield size={10} aria-hidden />
          Oficial
        </span>
      )}
      {doc.isInteractive && (
        <span className={css.interactiveBadge} title="Versión interactiva disponible">
          <Zap size={10} aria-hidden />
          Interactivo
        </span>
      )}
      <span className={css.yearBadge}>{doc.year}</span>
    </div>
  );
}

function ResultActions({ doc }: { doc: ExamDocItem }) {
  const navigate = useNavigate();

  return (
    <div className={css.cardActions}>
      {doc.pdfUrl && (
        <a
          href={doc.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={css.btnPdf}
          aria-label={`Ver PDF de ${doc.subject}`}
        >
          <ExternalLink size={13} aria-hidden />
          Ver PDF
        </a>
      )}
      <button
        type="button"
        className={css.btnDetail}
        onClick={() => navigate(`/examenes/doc/${doc.id}`)}
        aria-label={`Ver detalles de ${doc.subject}`}
      >
        <BookOpen size={13} aria-hidden />
        Ver detalles
      </button>
      {doc.isInteractive && (
        <button
          type="button"
          className={css.btnResolve}
          onClick={() => navigate(`/examenes/doc/${doc.id}/resolver`)}
          aria-label={`Resolver ${doc.subject}`}
        >
          <Play size={13} aria-hidden />
          Resolver
        </button>
      )}
    </div>
  );
}

function ExamCard({ doc }: { doc: ExamDocItem }) {
  const normalizedCall = formatCall(doc.call);

  return (
    <motion.article variants={fadeUp} className={css.card}>
      <div className={css.cardTop}>
        <ResultBadges doc={doc} />
      </div>

      <div className={css.cardMain}>
        <h3 className={css.cardSubject}>{doc.subject}</h3>
        <p className={css.cardUniversity}>{doc.university}</p>
        <div className={css.cardMeta}>
          <span className={css.metaTag}>
            <MapPin size={11} aria-hidden />
            {doc.community}
          </span>
          {normalizedCall && (
            <span className={css.metaTag}>
              <Calendar size={11} aria-hidden />
              {normalizedCall}
            </span>
          )}
        </div>
      </div>

      <ResultActions doc={doc} />
    </motion.article>
  );
}

function ExamListItem({ doc }: { doc: ExamDocItem }) {
  const normalizedCall = formatCall(doc.call);

  return (
    <motion.article variants={fadeUp} className={css.listItem}>
      <div className={css.listMain}>
        <div className={css.listTitleRow}>
          <h3 className={css.listSubject}>{doc.subject}</h3>
          <ResultBadges doc={doc} />
        </div>
        <p className={css.listUniversity}>{doc.university}</p>
        <div className={css.listMeta}>
          <span className={css.metaTag}>
            <MapPin size={11} aria-hidden />
            {doc.community}
          </span>
          {normalizedCall && (
            <span className={css.metaTag}>
              <Calendar size={11} aria-hidden />
              {normalizedCall}
            </span>
          )}
          <span className={css.metaTag}>{TIPO_LABEL[doc.documentType]}</span>
        </div>
      </div>
      <ResultActions doc={doc} />
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className={css.skeletonCard}>
      <div className={css.skeletonLine} style={{ width: '42%', height: 18 }} />
      <div className={css.skeletonLine} style={{ width: '74%', height: 22, marginTop: 12 }} />
      <div className={css.skeletonLine} style={{ width: '58%', height: 15, marginTop: 6 }} />
      <div className={css.skeletonLine} style={{ width: '86%', height: 14, marginTop: 6 }} />
      <div className={css.skeletonActions}>
        <div className={css.skeletonBtn} />
        <div className={css.skeletonBtn} />
      </div>
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={css.pagination} aria-label="Paginación de resultados">
      <button
        type="button"
        className={css.paginationBtn}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ArrowLeft size={14} aria-hidden />
        Anterior
      </button>
      <span className={css.paginationInfo}>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>
      <button
        type="button"
        className={css.paginationBtn}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Siguiente
        <ArrowRight size={14} aria-hidden />
      </button>
    </nav>
  );
}

function ExplorerButtons({
  items,
  onSelect,
  emptyLabel,
}: {
  items: ExamDocFacetItem<string>[];
  onSelect: (value: string) => void;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className={css.discoveryEmpty}>{emptyLabel}</p>;
  }

  return (
    <div className={css.chipRow}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={css.chip}
          onClick={() => onSelect(item.value)}
        >
          <span>{item.value}</span>
          <span className={css.chipCount}>{item.count}</span>
        </button>
      ))}
    </div>
  );
}

export function ExamenesPage() {
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('');
  const [community, setCommunity] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('');
  const [call, setCall] = useState('');
  const [docType, setDocType] = useState('');
  const [oficiales, setOficiales] = useState(false);
  const [interactivos, setInteractivos] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);

  const hasFilters = Boolean(
    q || subject || community || university || year || call || docType || oficiales || interactivos,
  );

  useEffect(() => {
    document.title = 'Exámenes Reales | Biblioteca oficial M25 | Preprueba';
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, subject, community, university, year, call, docType, oficiales, interactivos]);

  const { data, isLoading } = useQuery({
    queryKey: [
      'exam-docs',
      q,
      subject,
      community,
      university,
      year,
      call,
      docType,
      oficiales,
      interactivos,
      page,
    ],
    queryFn: () =>
      examDocsApi.list({
        q: q || undefined,
        subject: subject || undefined,
        community: community || undefined,
        university: university || undefined,
        year: year ? parseInt(year, 10) : undefined,
        call: call || undefined,
        documentType: docType || undefined,
        soloOficiales: oficiales || undefined,
        soloInteractivos: interactivos || undefined,
        page,
        limit: RESULTS_PER_PAGE,
      }),
    staleTime: 60_000,
  });

  const { data: recentData } = useQuery({
    queryKey: ['exam-docs-recent'],
    queryFn: () => examDocsApi.recent(),
    staleTime: 5 * 60 * 1000,
  });

  const docs = data?.docs ?? [];
  const facets = data?.facets;
  const highlights = data?.highlights;
  const recentDocs = recentData?.docs ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const limit = data?.limit ?? RESULTS_PER_PAGE;
  const showExplorer = !isLoading && !hasFilters;

  const communityOptions = sortStringFacets(facets?.communities);
  const subjectOptions = sortStringFacets(facets?.subjects);
  const universityOptions = sortStringFacets(facets?.universities);
  const callOptions = sortStringFacets(facets?.calls);
  const yearOptions = sortYearFacets(facets?.years);

  const clearAll = () => {
    setQ('');
    setSubject('');
    setCommunity('');
    setUniversity('');
    setYear('');
    setCall('');
    setDocType('');
    setOficiales(false);
    setInteractivos(false);
    setPage(1);
  };

  return (
    <main className={css.page}>
      <header className={css.header}>
        <div className={css.headerText}>
          <p className={css.eyebrow}>Biblioteca oficial M25</p>
          <h1 className={css.title}>Exámenes Reales</h1>
          <p className={css.subtitle}>
            Biblioteca oficial de pruebas de acceso para mayores de 25 años. Explora por comunidad,
            universidad, materia, año y tipo de documento sin perderte en una lista infinita.
          </p>
        </div>
        <StatsBar />
      </header>

      <section className={css.toolBar} aria-labelledby="exam-library-tools">
        <div className={css.toolBarHeader}>
          <div className={css.toolBarIntro}>
            <p className={css.sectionEyebrow}>Búsqueda y filtros</p>
            <h2 id="exam-library-tools" className={css.sectionTitle}>
              Encuentra el documento exacto
            </h2>
            <p className={css.sectionDesc}>
              Filtra el acervo real por materia, comunidad, universidad, convocatoria y tipo.
            </p>
          </div>
          <div className={css.viewToggle}>
            <button
              type="button"
              className={`${css.viewToggleBtn} ${viewMode === 'list' ? css.viewToggleBtnActive : ''}`}
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <Rows3 size={15} aria-hidden />
              Lista
            </button>
            <button
              type="button"
              className={`${css.viewToggleBtn} ${viewMode === 'grid' ? css.viewToggleBtnActive : ''}`}
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={15} aria-hidden />
              Grid
            </button>
          </div>
        </div>

        <div className={css.searchField}>
          <label htmlFor="exam-doc-search" className={css.searchLabel}>
            Buscar en el acervo
          </label>
          <div className={css.searchRow}>
            <div className={css.searchWrapper}>
              <Search size={18} className={css.searchIcon} aria-hidden />
              <input
                id="exam-doc-search"
                type="search"
                placeholder="Busca por materia, comunidad, universidad o texto libre"
                className={css.searchInput}
                value={q}
                onChange={(event) => setQ(event.target.value)}
                aria-describedby="exam-doc-search-hint"
              />
              <span id="exam-doc-search-hint" className={css.searchHint}>
                Usa texto libre para localizar materias, universidades o nombres de documento.
              </span>
              {q && (
                <button
                  type="button"
                  className={css.searchClear}
                  onClick={() => setQ('')}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={15} aria-hidden />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`${css.filtersToggle} ${filtersOpen ? css.filtersToggleActive : ''}`}
              onClick={() => setFiltersOpen((current) => !current)}
              aria-expanded={filtersOpen}
              aria-controls="exam-doc-filters"
            >
              <SlidersHorizontal size={15} aria-hidden />
              Filtros
              {hasFilters && <span className={css.filtersBubble} aria-hidden />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              id="exam-doc-filters"
              className={css.filtersPanel}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className={css.filtersGrid}>
                <div className={css.filterField}>
                  <label htmlFor="exam-doc-subject" className={css.filterLabel}>
                    Materia
                  </label>
                  <div className={css.selectWrapper}>
                    <select
                      id="exam-doc-subject"
                      className={css.filterSelect}
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                    >
                      <option value="">Todas</option>
                      {subjectOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={css.filterField}>
                  <label htmlFor="exam-doc-community" className={css.filterLabel}>
                    Comunidad
                  </label>
                  <div className={css.selectWrapper}>
                    <select
                      id="exam-doc-community"
                      className={css.filterSelect}
                      value={community}
                      onChange={(event) => {
                        setCommunity(event.target.value);
                        setUniversity('');
                      }}
                    >
                      <option value="">Todas</option>
                      {communityOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={css.filterField}>
                  <label htmlFor="exam-doc-university" className={css.filterLabel}>
                    Universidad
                  </label>
                  <div className={css.selectWrapper}>
                    <select
                      id="exam-doc-university"
                      className={css.filterSelect}
                      value={university}
                      onChange={(event) => setUniversity(event.target.value)}
                    >
                      <option value="">Todas</option>
                      {universityOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={css.filterField}>
                  <label htmlFor="exam-doc-year" className={css.filterLabel}>
                    Año
                  </label>
                  <div className={css.selectWrapper}>
                    <select
                      id="exam-doc-year"
                      className={css.filterSelect}
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                    >
                      <option value="">Todos</option>
                      {yearOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={css.filterField}>
                  <label htmlFor="exam-doc-call" className={css.filterLabel}>
                    Convocatoria
                  </label>
                  <div className={css.selectWrapper}>
                    <select
                      id="exam-doc-call"
                      className={css.filterSelect}
                      value={call}
                      onChange={(event) => setCall(event.target.value)}
                    >
                      <option value="">Todas</option>
                      {callOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {formatCall(item.value)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={css.filterField}>
                  <label htmlFor="exam-doc-type" className={css.filterLabel}>
                    Tipo de documento
                  </label>
                  <div className={css.selectWrapper}>
                    <select
                      id="exam-doc-type"
                      className={css.filterSelect}
                      value={docType}
                      onChange={(event) => setDocType(event.target.value)}
                    >
                      <option value="">Todos</option>
                      {(facets?.documentTypes ?? []).map((item) => (
                        <option key={item.value} value={item.value}>
                          {TIPO_LABEL[item.value]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={css.filterToggles}>
                  <button
                    type="button"
                    className={`${css.toggleChip} ${oficiales ? css.toggleChipOn : ''}`}
                    onClick={() => setOficiales((current) => !current)}
                    aria-pressed={oficiales}
                  >
                    <Shield size={13} aria-hidden />
                    Solo oficiales
                  </button>
                  <button
                    type="button"
                    className={`${css.toggleChip} ${interactivos ? css.toggleChipOn : ''}`}
                    onClick={() => setInteractivos((current) => !current)}
                    aria-pressed={interactivos}
                  >
                    <Zap size={13} aria-hidden />
                    Solo interactivos
                  </button>
                </div>
              </div>

              {hasFilters && (
                <button type="button" className={css.clearBtn} onClick={clearAll}>
                  <X size={13} aria-hidden />
                  Limpiar todos los filtros
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {showExplorer && (
        <section className={css.discoveryPanel} aria-labelledby="discovery-title">
          <div className={css.discoveryIntro}>
            <p className={css.sectionEyebrow}>Exploración rápida</p>
            <h2 id="discovery-title" className={css.sectionTitle}>
              Navega como en una biblioteca
            </h2>
            <p className={css.sectionDesc}>
              Entra por comunidad, materia, universidad o por los últimos documentos incorporados.
            </p>
          </div>

          <div className={css.discoveryGrid}>
            <section className={css.discoveryBlock} aria-labelledby="community-explore">
              <div className={css.discoveryHeader}>
                <p id="community-explore" className={css.discoveryLabel}>
                  <MapPin size={13} aria-hidden />
                  Explorar por comunidad
                </p>
              </div>
              <ExplorerButtons
                items={highlights?.topCommunities ?? []}
                onSelect={(value) => {
                  setCommunity(value);
                  setFiltersOpen(true);
                }}
                emptyLabel="Aún no hay comunidades disponibles."
              />
            </section>

            <section className={css.discoveryBlock} aria-labelledby="subject-explore">
              <div className={css.discoveryHeader}>
                <p id="subject-explore" className={css.discoveryLabel}>
                  <BookMarked size={13} aria-hidden />
                  Explorar por materia
                </p>
              </div>
              <ExplorerButtons
                items={highlights?.topSubjects ?? []}
                onSelect={(value) => {
                  setSubject(value);
                  setFiltersOpen(true);
                }}
                emptyLabel="Aún no hay materias disponibles."
              />
            </section>

            <section className={css.discoveryBlock} aria-labelledby="university-explore">
              <div className={css.discoveryHeader}>
                <p id="university-explore" className={css.discoveryLabel}>
                  <GraduationCap size={13} aria-hidden />
                  Universidades con más acervo
                </p>
              </div>
              <ExplorerButtons
                items={highlights?.topUniversities ?? []}
                onSelect={(value) => {
                  setUniversity(value);
                  setFiltersOpen(true);
                }}
                emptyLabel="Aún no hay universidades disponibles."
              />
            </section>

            <section className={css.discoveryBlock} aria-labelledby="recent-explore">
              <div className={css.discoveryHeader}>
                <p id="recent-explore" className={css.discoveryLabel}>
                  <LibraryBig size={13} aria-hidden />
                  Últimos añadidos
                </p>
              </div>
              <div className={css.recentRow}>
                {recentDocs.slice(0, 4).map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    className={css.recentItem}
                    onClick={() => {
                      setSubject(doc.subject);
                      setUniversity(doc.university);
                    }}
                  >
                    <span className={css.recentSubject}>{doc.subject}</span>
                    <span className={css.recentMeta}>
                      {doc.university} · {doc.year}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>
      )}

      <section className={css.resultsSection} aria-labelledby="results-title">
        <div className={css.resultsHeader}>
          <div className={css.resultsIntro}>
            <p className={css.sectionEyebrow}>Resultados</p>
            <h2 id="results-title" className={css.sectionTitle}>
              Acervo publicado
            </h2>
            <p className={css.resultsCount} role="status">
              {resultSummary(page, limit, total, docs.length)}
            </p>
          </div>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>

        {isLoading && (
          <div className={viewMode === 'grid' ? css.grid : css.list} aria-busy aria-label="Cargando exámenes">
            {Array.from({ length: viewMode === 'grid' ? 6 : 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {!isLoading && docs.length === 0 && (
          <div className={css.emptyState} role="status">
            <div className={css.emptyIcon}>
              <FileText size={34} aria-hidden />
            </div>
            <h3 className={css.emptyTitle}>No hemos encontrado documentos para esta búsqueda</h3>
            <p className={css.emptyDesc}>
              Ajusta los filtros o vuelve a entrar por comunidad, materia o últimos añadidos para
              reabrir la navegación.
            </p>
            <div className={css.emptySuggestions}>
              {(highlights?.topCommunities ?? []).slice(0, 4).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={css.chip}
                  onClick={() => {
                    clearAll();
                    setCommunity(item.value);
                  }}
                >
                  <MapPin size={11} aria-hidden />
                  {item.value}
                </button>
              ))}
              {(highlights?.topSubjects ?? []).slice(0, 4).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={css.chip}
                  onClick={() => {
                    clearAll();
                    setSubject(item.value);
                  }}
                >
                  <BookMarked size={11} aria-hidden />
                  {item.value}
                </button>
              ))}
            </div>

            {recentDocs.length > 0 && (
              <div className={css.emptyRecent}>
                <p className={css.discoveryLabel}>
                  <LibraryBig size={13} aria-hidden />
                  Últimos documentos incorporados
                </p>
                <div className={css.recentRow}>
                  {recentDocs.slice(0, 3).map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      className={css.recentItem}
                      onClick={() => {
                        clearAll();
                        setSubject(doc.subject);
                      }}
                    >
                      <span className={css.recentSubject}>{doc.subject}</span>
                      <span className={css.recentMeta}>
                        {doc.university} · {doc.year}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="button" className={css.clearBtn} onClick={clearAll}>
              <X size={13} aria-hidden />
              Limpiar filtros
            </button>
          </div>
        )}

        {!isLoading && docs.length > 0 && (
          <>
            <motion.div
              className={viewMode === 'grid' ? css.grid : css.list}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              aria-label="Listado de documentos oficiales"
            >
              {docs.map((doc) =>
                viewMode === 'grid' ? (
                  <ExamCard key={doc.id} doc={doc} />
                ) : (
                  <ExamListItem key={doc.id} doc={doc} />
                ),
              )}
            </motion.div>

            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>
    </main>
  );
}
