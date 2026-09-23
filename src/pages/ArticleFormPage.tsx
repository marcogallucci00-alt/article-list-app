import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  Column,
  Form,
  FormGroup,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Button,
  InlineNotification,
  InlineLoading,
  Breadcrumb,
  BreadcrumbItem,
} from '@carbon/react';
import { fetchArticle, createArticle, updateArticle } from '../api/articles';
import type { Article } from '../types/article';

const VAT_OPTIONS = [
  { value: '1', label: '1 — Esente (0%)' },
  { value: '2', label: '2 — Ordinaria (22%)' },
  { value: '3', label: '3 — Ridotta (10%)' },
  { value: '4', label: '4 — Super-ridotta (5%)' },
];

const FAMILY_OPTIONS = [
  { value: 'ABT', label: 'ABT — Abbigliamento' },
  { value: 'CAL', label: 'CAL — Calzature' },
  { value: 'ACC', label: 'ACC — Accessori' },
];

/**
 * ArticleFormPage — Panel 2 equivalent of ART200.
 * Handles both Create (mode=crt) and Update (mode=upd).
 */
export default function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const isCreate  = !id;

  const [form, setForm] = useState<Omit<Article, 'id' | 'deleteFlag'>>({
    description: '',
    familyCode:  'ABT',
    vatCode:     '2',
    salePrice:   0,
  });

  const [loading,    setLoading]    = useState(!isCreate);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<Partial<Record<keyof typeof form, string>>>({});

  // Load existing article when editing (mirrors S02prp update branch)
  useEffect(() => {
    if (!id) return;
    fetchArticle(id)
      .then((a) => {
        if (!a) { navigate('/'); return; }
        setForm({
          description: a.description,
          familyCode:  a.familyCode,
          vatCode:     a.vatCode,
          salePrice:   a.salePrice,
        });
      })
      .catch(() => setError('Errore nel caricamento dell\'articolo'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Validation (mirrors S02chk)
  function validate(): boolean {
    const errors: typeof fieldError = {};
    if (!form.description.trim()) {
      errors.description = 'La descrizione è obbligatoria';
    }
    if (!form.familyCode.trim()) {
      errors.familyCode = 'Il codice famiglia è obbligatorio';
    }
    setFieldError(errors);
    return Object.keys(errors).length === 0;
  }

  // Save (mirrors S02act)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      if (isCreate) {
        await createArticle(form);
      } else {
        await updateArticle(id!, form);
      }
      navigate('/');
    } catch {
      setError('Errore durante il salvataggio. Riprovare.');
    } finally {
      setSaving(false);
    }
  }

  const priceIncVat = form.salePrice > 0
    ? (form.salePrice * (1 + (form.vatCode === '2' ? 0.22 : form.vatCode === '3' ? 0.10 : form.vatCode === '4' ? 0.05 : 0))).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <Grid>
        <Column lg={16} md={8} sm={4} style={{ paddingTop: '2rem' }}>
          <InlineLoading description="Caricamento articolo..." />
        </Column>
      </Grid>
    );
  }

  return (
    <Grid>
      <Column lg={16} md={8} sm={4} style={{ marginBottom: '1rem' }}>
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem href="/">Articoli</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            {isCreate ? 'Nuovo articolo' : `Modifica articolo ${id}`}
          </BreadcrumbItem>
        </Breadcrumb>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <h2 style={{ marginBottom: '1.5rem' }}>
          {isCreate ? 'Nuovo articolo' : `Modifica articolo — ${id}`}
        </h2>
      </Column>

      {error && (
        <Column lg={16} md={8} sm={4} style={{ marginBottom: '1rem' }}>
          <InlineNotification kind="error" title="Errore:" subtitle={error} />
        </Column>
      )}

      <Column lg={8} md={6} sm={4}>
        <Form onSubmit={handleSubmit}>
          <FormGroup legendText="">

            {/* Article ID — read-only when editing */}
            {!isCreate && (
              <TextInput
                id="art-id"
                labelText="ID Articolo (ARID)"
                value={id}
                readOnly
                style={{ marginBottom: '1rem' }}
              />
            )}

            {/* Description — mandatory (mirrors errDesc validation) */}
            <TextInput
              id="art-desc"
              labelText="Descrizione (ARDESC) *"
              value={form.description}
              maxLength={50}
              invalid={!!fieldError.description}
              invalidText={fieldError.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ marginBottom: '1rem' }}
            />

            {/* Family code — must exist (mirrors errFamilly validation) */}
            <Select
              id="art-family"
              labelText="Famiglia (ARTIFA) *"
              value={form.familyCode}
              invalid={!!fieldError.familyCode}
              invalidText={fieldError.familyCode}
              onChange={(e) => setForm((f) => ({ ...f, familyCode: e.target.value }))}
              style={{ marginBottom: '1rem' }}
            >
              {FAMILY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} text={o.label} />
              ))}
            </Select>

            {/* VAT code */}
            <Select
              id="art-vat"
              labelText="Codice IVA (ARVATCD)"
              value={form.vatCode}
              onChange={(e) => setForm((f) => ({ ...f, vatCode: e.target.value }))}
              style={{ marginBottom: '1rem' }}
            >
              {VAT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} text={o.label} />
              ))}
            </Select>

            {/* Sale price + computed price with VAT (mirrors WITHVAT display) */}
            <NumberInput
              id="art-price"
              label="Prezzo di vendita (ARSALEPR)"
              value={form.salePrice}
              min={0}
              step={0.01}
              onChange={(_e: any, { value }: any) =>
                setForm((f) => ({ ...f, salePrice: Number(value) || 0 }))
              }
              style={{ marginBottom: '0.5rem' }}
            />
            <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '1.5rem' }}>
              Prezzo IVA inclusa (WITHVAT): <strong>€ {priceIncVat}</strong>
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit" disabled={saving}>
                {saving
                  ? <InlineLoading description="Salvataggio..." />
                  : isCreate ? 'Crea articolo' : 'Salva modifiche'
                }
              </Button>
              <Button kind="secondary" onClick={() => navigate('/')}>
                Annulla
              </Button>
            </div>

          </FormGroup>
        </Form>
      </Column>
    </Grid>
  );
}
