import { HashRouter, Routes, Route } from 'react-router-dom';
import { Content, Theme } from '@carbon/react';
import ArticleListPage  from './pages/ArticleListPage';
import ArticleFormPage  from './pages/ArticleFormPage';
import ArticleInfoPage  from './pages/ArticleInfoPage';

function App() {
  return (
    <HashRouter>
      <Theme theme="white">
        <Content>
          <Routes>
            {/* Panel 1 — Article list (subfile ART200-1) */}
            <Route path="/" element={<ArticleListPage />} />

            {/* Panel 2 — Create new article (F6 / mode=crt) */}
            <Route path="/new" element={<ArticleFormPage />} />

            {/* Panel 2 — Edit existing article (opt 2 / mode=upd) */}
            <Route path="/edit/:id" element={<ArticleFormPage />} />

            {/* Panel 3 — Article information / free-text notes (opt 3) */}
            <Route path="/info/:id" element={<ArticleInfoPage />} />
          </Routes>
        </Content>
      </Theme>
    </HashRouter>
  );
}

export default App;
