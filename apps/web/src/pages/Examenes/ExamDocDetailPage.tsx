import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  FileBadge2,
  GraduationCap,
  MapPin,
  Play,
  Shield,
} from 'lucide-react';

import { examDocs as examDocsApi, type ExamDocItem, type TipoDocumento } from '../../services/api';
import s from './Examenes.module.css';

const TIPO_LABEL: Record<TipoDocumento, string> = {
  EXAMEN_OFICIAL: 'Examen oficial',
  MODELO: 'Modelo',
  CONVOCATORIA_ANTERIOR: 'Convocatoria anterior',
  ORIENTACIONES: 'Orientaciones',
  CRITERIOS_CORRECCION: 'Criterios de corrección',
  SOLUCIONARIO: 'Solucionario',
};

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className={s.detailMetaItem}>
      <div className={s.detailMetaLabel}>
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div className={s.detailMetaValue}>{value}</div>
    </div>
  );
}

function DetailContent({ doc }: { doc: ExamDocItem }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${doc.subject} ${doc.year} | Exámenes Reales`;
  }, [doc.subject, doc.year]);

  return (
    <>
      <button className={s.backBtn} onClick={() => navigate('/examenes')}>
        <ArrowLeft size={16} />
        Volver a Exámenes Reales
      </button>

      <header className={s.detailHero}>
        <div className={s.detailHeroTop}>
          <span className={s.detailTypeBadge}>{TIPO_LABEL[doc.documentType]}</span>
          {doc.isOfficial && (
            <span className={s.officialBadge}>
              <Shield size={12} />
              Fuente oficial
            </span>
          )}
        </div>

        <h1 className={s.detailTitle}>{doc.title}</h1>
        <p className={s.detailSubtitle}>
          Documento oficial de acceso para mayores de 25 años.
        </p>

        <div className={s.detailActions}>
          {doc.pdfUrl && (
            <a
              href={doc.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={s.btnResolve}
            >
              <FileBadge2 size={16} />
              Ver PDF
            </a>
          )}
          <a
            href={doc.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={s.btnPdf}
          >
            <ExternalLink size={16} />
            Ver fuente oficial
          </a>
          {doc.isInteractive && (
            <button className={s.btnDetail} onClick={() => navigate(`/examenes/doc/${doc.id}/resolver`)}>
              <Play size={16} />
              Resolver
            </button>
          )}
        </div>
      </header>

      <section className={s.detailSection}>
        <h2 className={s.detailSectionTitle}>Detalles del documento</h2>
        <div className={s.detailMetaGrid}>
          <MetaItem icon={BookOpen} label="Materia" value={doc.subject} />
          <MetaItem icon={GraduationCap} label="Universidad" value={doc.university} />
          <MetaItem icon={MapPin} label="Comunidad" value={doc.community} />
          <MetaItem icon={Calendar} label="Año" value={String(doc.year)} />
          <MetaItem icon={FileBadge2} label="Tipo" value={TIPO_LABEL[doc.documentType]} />
          <MetaItem icon={Shield} label="Estado" value={doc.status.toLowerCase()} />
          {doc.call && <MetaItem icon={Calendar} label="Convocatoria" value={doc.call} />}
          <MetaItem icon={ExternalLink} label="Fuente" value={doc.sourceName} />
        </div>
      </section>

      <section className={s.detailSection}>
        <h2 className={s.detailSectionTitle}>Acceso</h2>
        <div className={s.detailLinkList}>
          {doc.pdfUrl ? (
            <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className={s.detailLinkCard}>
              <div>
                <strong>PDF almacenado</strong>
                <p>Abre la copia guardada por el pipeline de ingestión.</p>
              </div>
              <ExternalLink size={16} />
            </a>
          ) : (
            <div className={s.detailLinkCardMuted}>
              <div>
                <strong>PDF pendiente</strong>
                <p>Este registro aún no tiene una copia almacenada accesible.</p>
              </div>
            </div>
          )}

          <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className={s.detailLinkCard}>
            <div>
              <strong>Fuente oficial</strong>
              <p>Enlace institucional original del documento.</p>
            </div>
            <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </>
  );
}

export function ExamDocDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['exam-doc', id],
    queryFn: () => examDocsApi.get(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    document.title = 'Detalle de examen oficial | Exámenes Reales';
  }, []);

  if (isLoading) {
    return (
      <div className={s.page}>
        <div className={s.skeletonCard} style={{ height: 260 }} />
      </div>
    );
  }

  if (!data?.doc) {
    return (
      <div className={s.page}>
        <div className={s.emptyState} role="status">
          <div className={s.emptyIcon}>
            <BookOpen size={28} />
          </div>
          <h1 className={s.emptyTitle}>Documento no encontrado</h1>
          <p className={s.emptyDesc}>No se pudo cargar el documento oficial solicitado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <DetailContent doc={data.doc} />
    </div>
  );
}
