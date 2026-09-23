/**
 * Mirrors the ARTICLE physical file (SAMCO/QDDSSRC/ARTICLE-Article_File.PF)
 * and the ARTIINF SQL table (SAMCO/QSQLSRC/ARTIINF.TABLE).
 */

export interface Article {
  /** ARID — 6-char article ID */
  id: string;
  /** ARDESC — article description (50 chars) */
  description: string;
  /** ARTIFA — family code (3 chars) */
  familyCode: string;
  /** ARVATCD — VAT code (1 char) */
  vatCode: string;
  /** ARSALEPR — reference sale price */
  salePrice: number;
  /** ARDEL — logical delete flag: 'X' = deleted */
  deleteFlag: string;
}

export interface ArticleInfo {
  /** ARTICLE_INFO_ID — matches ARID */
  articleId: string;
  /** ARTICLE_INFORMATION — free-text notes (up to 1520 chars) */
  information: string;
}
