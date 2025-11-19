import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './index.css'

// Importando as páginas
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import AdminCardListPage from './pages/AdminCardListPage'
import AdminCardFormPage from './pages/AdminCardFormPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Rotas aninhadas dentro do Layout (App.jsx) */}
          <Route index element={<HomePage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="admin" element={<AdminCardListPage />} />
          <Route path="admin/new" element={<AdminCardFormPage />} />
          <Route path="admin/edit/:cardId" element={<AdminCardFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)