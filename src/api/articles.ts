import type { Article, ArticleInfo } from '../types/article';

/** Simulate a network delay (milliseconds). */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// In-memory store (mirrors ARTICLE PF + ARTIINF TABLE on SAMCO)
// ---------------------------------------------------------------------------
let MOCK_ARTICLES: Article[] = [
  { id: '000001', description: 'Giacca in cotone blu',  familyCode: 'ABT', vatCode: '2', salePrice: 89.90,  deleteFlag: '' },
  { id: '000002', description: 'Pantaloni chino beige', familyCode: 'ABT', vatCode: '2', salePrice: 59.90,  deleteFlag: '' },
  { id: '000003', description: 'Camicia oxford bianca', familyCode: 'ABT', vatCode: '2', salePrice: 49.90,  deleteFlag: '' },
  { id: '000004', description: 'Scarpe derby marrone',  familyCode: 'CAL', vatCode: '2', salePrice: 129.00, deleteFlag: '' },
  { id: '000005', description: 'Cintura in pelle nera', familyCode: 'ACC', vatCode: '2', salePrice: 39.90,  deleteFlag: '' },
  { id: '000006', description: 'Maglione lana grigio',  familyCode: 'ABT', vatCode: '2', salePrice: 79.00,  deleteFlag: 'X' },
];

let MOCK_ARTICLE_INFO: ArticleInfo[] = [
  { articleId: '000001', information: 'Giacca in cotone 100% biologico. Disponibile in taglie S-XXL.' },
  { articleId: '000003', information: 'Tessuto oxford traspirante, ideale per uso quotidiano.' },
];

// ---------------------------------------------------------------------------
// Article CRUD
// ---------------------------------------------------------------------------

/** Fetch all articles (mirrors ARTICLE1/ARTICLE2 LF). */
export async function fetchArticles(): Promise<Article[]> {
  await delay(500);
  return [...MOCK_ARTICLES];
}

/** Fetch a single article by ID (mirrors CHAIN arid article1). */
export async function fetchArticle(id: string): Promise<Article | undefined> {
  await delay(200);
  return MOCK_ARTICLES.find((a) => a.id === id);
}

/**
 * Create a new article.
 * Mirrors S02act create branch: auto-increment ARID, set ARCREA.
 */
export async function createArticle(data: Omit<Article, 'id' | 'deleteFlag'>): Promise<Article> {
  await delay(300);
  const maxId = MOCK_ARTICLES.reduce((max, a) => Math.max(max, parseInt(a.id, 10)), 0);
  const newId  = String(maxId + 1).padStart(6, '0');
  const article: Article = { ...data, id: newId, deleteFlag: '' };
  MOCK_ARTICLES = [...MOCK_ARTICLES, article];
  return article;
}

/**
 * Update an existing article.
 * Mirrors S02act update branch: record ARMOD/ARMODID.
 */
export async function updateArticle(id: string, data: Partial<Omit<Article, 'id'>>): Promise<Article> {
  await delay(300);
  MOCK_ARTICLES = MOCK_ARTICLES.map((a) =>
    a.id === id ? { ...a, ...data } : a,
  );
  return MOCK_ARTICLES.find((a) => a.id === id)!;
}

/**
 * Logically delete an article (set ARDEL = 'X').
 * Mirrors s01act option 4: immediate, no confirmation.
 */
export async function deleteArticle(id: string): Promise<void> {
  await delay(200);
  MOCK_ARTICLES = MOCK_ARTICLES.map((a) =>
    a.id === id ? { ...a, deleteFlag: 'X' } : a,
  );
}

// ---------------------------------------------------------------------------
// Article Info (ARTIINF table)
// ---------------------------------------------------------------------------

/** Fetch article information (mirrors S03prp SQL SELECT). */
export async function fetchArticleInfo(articleId: string): Promise<ArticleInfo | undefined> {
  await delay(200);
  return MOCK_ARTICLE_INFO.find((i) => i.articleId === articleId);
}

/**
 * Save article information — INSERT or UPDATE (mirrors S03act).
 * Trims the text before saving.
 */
export async function saveArticleInfo(articleId: string, information: string): Promise<void> {
  await delay(300);
  const trimmed = information.trim();
  const existing = MOCK_ARTICLE_INFO.find((i) => i.articleId === articleId);
  if (existing) {
    MOCK_ARTICLE_INFO = MOCK_ARTICLE_INFO.map((i) =>
      i.articleId === articleId ? { ...i, information: trimmed } : i,
    );
  } else {
    MOCK_ARTICLE_INFO = [...MOCK_ARTICLE_INFO, { articleId, information: trimmed }];
  }
}
