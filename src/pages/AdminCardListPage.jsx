import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCards, deleteCard, getDistinctThemes } from '../services/cardService.js';
import Button from '../components/Button'; 
import LoadingSpinner from '../components/LoadingSpinner'; 

function AdminCardListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [themes, setThemes] = useState([]); 
  const [selectedTheme, setSelectedTheme] = useState(''); 

  // Função para buscar os dados (cartas E temas)
  const fetchApiData = async (themeQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const query = themeQuery ? { theme: themeQuery } : {};
      
      // 1. Busca as cartas
      const cardsResponse = await getCards(query);
      setCards(cardsResponse.data);
      
      // 2. Busca a lista de temas (CORREÇÃO AQUI)
      // Verifica se precisa buscar os temas (se a lista estiver vazia ou se for uma recarga forçada)
      if (themes.length === 0) {
        const themesResponse = await getDistinctThemes(); // Nome corrigido
        setThemes(themesResponse.data);
      }
      
    } catch (err) {
      console.error(err);
      setError('Falha ao buscar os dados. Verifique se o back-end está rodando.');
    } finally {
      setLoading(false);
    }
  };

  // Roda na primeira vez que a página carrega
  useEffect(() => {
    fetchApiData(); 
  }, []); 

  const handleFilter = () => {
    fetchApiData(selectedTheme);
  };
  
  const handleClearFilter = () => {
    setSelectedTheme(''); 
    fetchApiData(); // Busca todas as cartas sem filtro
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta carta?')) {
      try {
        await deleteCard(id); 
        // Remove a carta da lista local visualmente para não precisar recarregar tudo
        setCards(prevCards => prevCards.filter(card => card.id !== id));
        
        // Atualiza a lista de temas (caso tenha excluído o último item de um tema)
        // (CORREÇÃO AQUI TAMBÉM)
        const themesResponse = await getDistinctThemes(); 
        setThemes(themesResponse.data);

      } catch (err) {
        console.error(err);
        setError('Falha ao excluir a carta.');
      }
    }
  };

  if (loading && cards.length === 0) return <LoadingSpinner />;

  return (
    <div className="admin-list-page">
      <h2>Gerenciador de Cartas</h2>
      <Link to="/admin/new">
        <Button>Nova Carta</Button>
      </Link>
      
      <div className="filter-section">
        <select 
          value={selectedTheme} 
          onChange={(e) => setSelectedTheme(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
        >
          <option value="">Todos os Temas</option>
          {themes.map((theme, index) => (
            // Adicionei index como fallback da key caso o tema seja repetido ou nulo
            <option key={theme || index} value={theme}>
              {theme}
            </option>
          ))}
        </select>
        
        <Button onClick={handleFilter}>Buscar</Button>
        <Button onClick={handleClearFilter} variant="secondary">Limpar</Button>
      </div>
      
      {error && <p className="error-message">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tema</th>
            <th>Imagem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cards.map(card => (
            <tr key={card.id}>
              <td>{card.name}</td>
              <td>{card.theme}</td>
              <td>
                <img 
                  src={card.imageUrl} 
                  alt={card.name} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                />
              </td>
              <td>
                <Link to={`/admin/edit/${card.id}`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                <Button variant="danger" onClick={() => handleDelete(card.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCardListPage;