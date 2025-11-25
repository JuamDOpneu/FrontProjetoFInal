import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css';

// Páginas
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import AdminCardListPage from './pages/AdminCardListPage';
import AdminCardFormPage from './pages/AdminCardFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          
          {/* Rotas Públicas */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="game" element={<GamePage />} />
          
          {/* Rotas que requerem Login (Idealmente proteger com PrivateRoute) */}
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Rotas de Admin */}
          <Route path="admin" element={<AdminCardListPage />} />
          <Route path="admin/new" element={<AdminCardFormPage />} />
          <Route path="admin/edit/:cardId" element={<AdminCardFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);