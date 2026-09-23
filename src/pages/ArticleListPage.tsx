import { useCallback, useEffect, useState } from 'react';
import {
  Grid,
  Column,
  Heading,
  InlineNotification,
  Loading,
} from '@carbon/react';
import { ArticleTable } from '../components/ArticleTable';
import { fetchArticles } from '../api/articles';
import type { Article } from '../types/article';

/**
 * ArticleListPage — Panel 1 equivalent of ART200.
 * Displays the SAMCO ARTICLE catalogue with search, status tags,
 * and per-row actions: 2=Modifica, 3=Informazioni, 4=Elimina.
 */
export default function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchArticles()
      .then(setArticles)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Errore nel caricamento degli articoli'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Heading style={{ marginBottom: '0.5rem' }}>Gestione Articoli</Heading>
        <p style={{ marginBottom: '2rem', color: '#525252' }}>
          Modernizzazione interfaccia 5250 — ART200 Work with Articles
        </p>
      </Column>

      <Column lg={16} md={8} sm={4}>
        {loading && (
          <Loading description="Caricamento articoli..." withOverlay={false} />
        )}

        {error && (
          <InlineNotification
            kind="error"
            title="Errore:"
            subtitle={error}
            style={{ marginBottom: '1rem' }}
          />
        )}

        {!loading && !error && (
          <ArticleTable articles={articles} onRefresh={load} />
        )}
      </Column>
    </Grid>
  );
}
