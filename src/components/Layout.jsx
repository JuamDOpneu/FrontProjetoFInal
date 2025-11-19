import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

function Layout() {
  return (
    <div className="app-container">
      <Navigation />
      <main className="content">
        <Outlet /> {/* As páginas (rotas) serão renderizadas aqui */}
      </main>
      <footer className="footer">
        <p>© 2025 Jogo da Memória Full-stack</p>
      </footer>
    </div>
  );
}

export default Layout;