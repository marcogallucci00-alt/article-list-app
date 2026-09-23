import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  Column,
  TextArea,
  Button,
  InlineNotification,
  InlineLoading,
  Breadcrumb,
  BreadcrumbItem,
} from '@carbon/react';
import { fetchArticle, fetchArticleInfo, saveArticleInfo } from '../api/articles';

/**
 * ArticleInfoPage — Panel 3 equivalent of ART200.
 * Allows viewing and editing the free-text note stored in ARTIINF.
 * Max 1520 characters, trimmed on save (mirrors S03act SQL trim(:text)).
 */
export default function ArticleInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [text,        setText]        = useState('');
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [saved,       setSaved]       = useState(false);

  // Load article description + existing note (mirrors S03prp)
  useEffect(() => {
    if (!id) { navigate('/'); return; }
    Promise.all([fetchArticle(id), fetchArticleInfo(id)])
      .then(([article, info]) => {
        if (!article) { navigate('/'); return; }
        setDescription(article.description);
        setText(info?.information ?? '');
      })
      .catch(() => setError('Errore nel caricamento delle informazioni'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Save note (mirrors S03act INSERT or UPDATE with trim)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await saveArticleInfo(id!, text);
      setSaved(true);
      setTimeout(() => navigate('/'), 800);
    } catch {
      setError('Errore durante il salvataggio. Riprovare.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Grid>
        <Column lg={16} md={8} sm={4} style={{ paddingTop: '2rem' }}>
          <InlineLoading description="Caricamento informazioni..." />
        </Column>
      </Grid>
    );
  }

  return (
    <Grid>
      <Column lg={16} md={8} sm={4} style={{ marginBottom: '1rem' }}>
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem href="/">Articoli</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Informazioni articolo</BreadcrumbItem>
        </Breadcrumb>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <h2 style={{ marginBottom: '0.25rem' }}>Informazioni articolo</h2>
        <p style={{ color: '#525252', marginBottom: '1.5rem' }}>
          <strong>{id}</strong> — {description}
        </p>
      </Column>

      {error && (
        <Column lg={16} md={8} sm={4} style={{ marginBottom: '1rem' }}>
          <InlineNotification kind="error" title="Errore:" subtitle={error} />
        </Column>
      )}

      {saved && (
        <Column lg={16} md={8} sm={4} style={{ marginBottom: '1rem' }}>
          <InlineNotification kind="success" title="Salvato!" subtitle="Le informazioni sono state aggiornate." />
        </Column>
      )}

      <Column lg={10} md={6} sm={4}>
        <form onSubmit={handleSubmit}>
          {/* Free-text note field (mirrors ARTIINF.ARTICLE_INFORMATION, max 1520 chars) */}
          <TextArea
            id="art-info"
            labelText="Note libere (ARTICLE_INFORMATION)"
            helperText={`${text.length} / 1520 caratteri`}
            value={text}
            maxCount={1520}
            enableCounter
            rows={10}
            onChange={(e) => setText(e.target.value)}
            style={{ marginBottom: '1.5rem' }}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="submit" disabled={saving}>
              {saving
                ? <InlineLoading description="Salvataggio..." />
                : 'Salva note'
              }
            </Button>
            <Button kind="secondary" onClick={() => navigate('/')}>
              Annulla
            </Button>
          </div>
        </form>
      </Column>
    </Grid>
  );
}
