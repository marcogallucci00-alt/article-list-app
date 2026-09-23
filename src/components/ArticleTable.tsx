import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
  Button,
  Modal,
  type DataTableHeader,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import type { Article } from '../types/article';
import { deleteArticle } from '../api/articles';

interface ArticleTableProps {
  articles: Article[];
  onRefresh: () => void;
}

const headers: DataTableHeader[] = [
  { key: 'id',          header: 'ID Articolo' },
  { key: 'description', header: 'Descrizione' },
  { key: 'familyCode',  header: 'Famiglia' },
  { key: 'vatCode',     header: 'Cod. IVA' },
  { key: 'salePrice',   header: 'Prezzo vendita' },
  { key: 'status',      header: 'Stato' },
  { key: 'actions',     header: 'Azioni' },
];

interface ArticleRow {
  id: string;
  description: string;
  familyCode: string;
  vatCode: string;
  salePrice: string;
  status: string;
  actions: string;
  _deleted: boolean;
}

function toRows(articles: Article[]): ArticleRow[] {
  return articles.map((a) => ({
    id:          a.id,
    description: a.description,
    familyCode:  a.familyCode,
    vatCode:     a.vatCode,
    salePrice:   `€ ${a.salePrice.toFixed(2)}`,
    status:      a.deleteFlag === 'X' ? 'Eliminato' : 'Attivo',
    actions:     '',
    _deleted:    a.deleteFlag === 'X',
  }));
}

export function ArticleTable({ articles, onRefresh }: ArticleTableProps) {
  const navigate = useNavigate();
  const rows     = toRows(articles);

  // Delete confirmation modal state
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(true);
    await deleteArticle(confirmId);
    setDeleting(false);
    setConfirmId(null);
    onRefresh();
  }

  return (
    <>
      {/* Delete confirmation modal (opt 4 — immediate in 5250, here we add a confirm) */}
      <Modal
        open={!!confirmId}
        danger
        modalHeading="Conferma eliminazione"
        primaryButtonText={deleting ? 'Eliminazione...' : 'Elimina'}
        secondaryButtonText="Annulla"
        onRequestSubmit={handleDelete}
        onRequestClose={() => setConfirmId(null)}
        primaryButtonDisabled={deleting}
      >
        <p>
          Vuoi eliminare logicamente l'articolo <strong>{confirmId}</strong>?
          <br />
          L'articolo verrà contrassegnato come eliminato (ARDEL = 'X').
        </p>
      </Modal>

      <DataTable rows={rows} headers={headers} isSortable>
        {({
          rows: tableRows,
          headers: tableHeaders,
          getTableProps,
          getHeaderProps,
          getRowProps,
          onInputChange,
        }: any) => (
          <TableContainer
            title="Articoli"
            description="Lista articoli dal file ARTICLE — SAMCO"
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Cerca per descrizione o ID..."
                  onChange={onInputChange}
                />
                <Button renderIcon={Add} onClick={() => navigate('/new')}>
                  Nuovo articolo
                </Button>
              </TableToolbarContent>
            </TableToolbar>

            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header: any) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {tableRows.map((row: any) => {
                  const isDeleted = row.cells.find((c: any) => c.id.endsWith(':status'))?.value === 'Eliminato';
                  return (
                    <TableRow
                      {...getRowProps({ row })}
                      key={row.id}
                      style={isDeleted ? { opacity: 0.5 } : undefined}
                    >
                      {row.cells.map((cell: any) => {
                        // Status column — Tag
                        if (cell.id.endsWith(':status')) {
                          return (
                            <TableCell key={cell.id}>
                              <Tag type={cell.value === 'Eliminato' ? 'red' : 'green'} size="sm">
                                {cell.value}
                              </Tag>
                            </TableCell>
                          );
                        }
                        // Actions column — overflow menu (opt 2, 3, 4)
                        if (cell.id.endsWith(':actions')) {
                          return (
                            <TableCell key={cell.id}>
                              <OverflowMenu flipped>
                                <OverflowMenuItem
                                  itemText="2 — Modifica"
                                  onClick={() => navigate(`/edit/${row.id}`)}
                                />
                                <OverflowMenuItem
                                  itemText="3 — Informazioni"
                                  onClick={() => navigate(`/info/${row.id}`)}
                                />
                                <OverflowMenuItem
                                  itemText="4 — Elimina"
                                  isDelete
                                  disabled={isDeleted}
                                  onClick={() => setConfirmId(row.id)}
                                />
                              </OverflowMenu>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </>
  );
}
