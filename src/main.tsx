import React from 'react';
import ReactDOM from 'react-dom/client';

// Carbon global styles — import once at the root entry point
import '@carbon/styles/css/styles.css';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
