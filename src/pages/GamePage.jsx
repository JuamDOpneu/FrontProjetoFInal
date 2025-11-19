import React, { useState, useEffect, useRef } from 'react';
import { getDistinctThemes, getCards } from '../services/cardService.js';
import MemoryCardComponent from '../components/MemoryCardComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

// --- CONFIGURAÇÃO DOS NÍVEIS ---
const GAME_CONFIG = {
  easy: { pairs: 6, label: 'Fácil (6 Pares)' },
  medium: { pairs: 8, label: 'Médio (8 Pares)' },
  hard: { pairs: 10, label: 'Difícil (10 Pares)' },
};
// ------------------------------

// Função para embaralhar
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

function GamePage() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); 
  const [matched, setMatched] = useState([]); 
  const [moves, setMoves] = useState(0);

  // --- Novos Estados ---
  const [gameState, setGameState] = useState('loading'); // 'loading', 'themeSelection', 'difficultySelection', 'playing', 'won'
  const [availableThemes, setAvailableThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [error, setError] = useState(null);
  
  // Estados do Timer
  const [timer, setTimer] = useState(0);
  // Usamos useRef para guardar o ID do intervalo, para não causar re-renderizações
  const timerIntervalRef = useRef(null); 
  // --------------------

  // 1. Efeito para buscar os temas disponíveis na primeira carga
  useEffect(() => {
    const loadThemes = async () => {
      setGameState('loading');
      setError(null);
      try {
        const response = await getDistinctThemes(); // Chama a API de temas
        if (response.data.length === 0) {
          setError("Nenhuma carta cadastrada. Adicione cartas na área de Admin.");
        } else {
          setAvailableThemes(response.data);
          setGameState('themeSelection');
        }
      } catch (err) {
        setError("Falha ao carregar temas. O back-end está rodando?");
        setGameState('error');
      }
    };
    
    loadThemes();
  }, []); // Roda apenas uma vez

  // 2. Limpa o timer quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // 3. Função chamada ao selecionar o TEMA
  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setGameState('difficultySelection'); // Avança para a tela de dificuldade
  };

  // 4. Função chamada ao selecionar a DIFICULDADE (inicia o jogo)
  const startGame = async (difficultyKey) => {
    setGameState('loading');
    setSelectedDifficulty(difficultyKey); // Salva a dificuldade
    setError(null);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setMoves(0);

    try {
      const { pairs } = GAME_CONFIG[difficultyKey];
      const response = await getCards({ theme: selectedTheme }); // Busca cartas do tema
      
      // Verifica se há cartas suficientes para a dificuldade
      if (response.data.length < pairs) {
         setError(`O tema "${selectedTheme}" não tem cartas suficientes (${pairs}) para este modo. Cadastre mais cartas ou escolha "Fácil".`);
         setGameState('difficultySelection'); // Volta para a tela de dificuldade
         return;
      }

      // Pega o número de pares necessários
      const pairsDeck = response.data.slice(0, pairs);
      const gameDeck = [...pairsDeck, ...pairsDeck].map((card, i) => ({
        ...card,
        uniqueId: i, 
      }));
      setCards(shuffleArray(gameDeck));
      setGameState('playing');

      // --- Inicia o Timer ---
      setTimer(0);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      // ---------------------

    } catch (err) {
      setError("Falha ao carregar o jogo.");
      setGameState('error');
    }
  };

  // 5. Lógica de clique no card (atualizada)
  const handleCardClick = (index) => {
    // Não faz nada se o jogo não está ativo, ou se já tem 2 viradas, etc.
    if (gameState !== 'playing' || flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].name)) {
      return; 
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1); 
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].name === cards[secondIndex].name) {
        const newMatched = [...matched, cards[firstIndex].name];
        setMatched(newMatched);
        setFlipped([]);
        
        // Checa se venceu
        if (newMatched.length === cards.length / 2) {
          setGameState('won');
          // --- Para o Timer ---
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          // --------------------
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // 6. Função para voltar à seleção de temas
  const resetToThemeSelection = () => {
    // Para o timer se estiver rodando
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setGameState('themeSelection');
    setSelectedTheme(null);
    setSelectedDifficulty(null);
    setCards([]);
    setError(null);
  };

  // 7. Renderização (o que o usuário vê)
  const renderContent = () => {
    if (gameState === 'loading') {
      return <LoadingSpinner />;
    }
    
    if (error && gameState !== 'difficultySelection') {
      return <p className="error-message">{error}</p>;
    }
    
    // --- TELA 1: SELEÇÃO DE TEMA ---
    if (gameState === 'themeSelection') {
      return (
        <div className="theme-selection">
          <h2>Escolha um Tema para Jogar!</h2>
          <div className="theme-buttons">
            {availableThemes.length > 0 ? (
              availableThemes.map(theme => (
                <Button key={theme} onClick={() => handleThemeSelect(theme)}>
                  {theme}
                </Button>
              ))
            ) : (
              <p>Nenhum tema encontrado. Cadastre cartas no Admin.</p>
            )}
          </div>
        </div>
      );
    }

    // --- TELA 2: SELEÇÃO DE DIFICULDADE ---
    if (gameState === 'difficultySelection') {
      return (
        <div className="theme-selection">
          <h2>Tema: {selectedTheme}</h2>
          <h3>Escolha a Dificuldade:</h3>
          {/* Mostra o erro de "cartas insuficientes" aqui */}
          {error && <p className="error-message">{error}</p>}
          <div className="theme-buttons">
            {Object.keys(GAME_CONFIG).map(key => (
              <Button key={key} onClick={() => startGame(key)}>
                {GAME_CONFIG[key].label}
              </Button>
            ))}
          </div>
          <Button onClick={resetToThemeSelection} variant="secondary" style={{marginTop: '2.0rem'}}>
            Voltar
          </Button>
        </div>
      );
    }
    
    // --- TELA 3: JOGANDO ---
    if (gameState === 'playing') {
      return (
        <div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '2.0 rem', alignItems: 'center', marginBottom: '1rem'}}>
            <Button onClick={resetToThemeSelection} variant="secondary">Voltar (Mudar Tema)</Button>
            <h3 style={{margin: 0}}>Tema: {selectedTheme}</h3>
            <h3 style={{margin: 0, color: '#007bff'}}>Tempo: {timer}s</h3>
            <h3 style={{margin: 0, color: '#dc3545'}}>Jogadas: {moves}</h3>
          </div>
          
          <div className="game-board">
            {cards.map((card, index) => (
              <MemoryCardComponent
                key={card.uniqueId}
                card={card}
                isFlipped={flipped.includes(index) || matched.includes(card.name)}
                onClick={() => handleCardClick(index)}
              />
            ))}
          </div>
        </div>
      );
    }

    // --- TELA 4: VITÓRIA ---
    if (gameState === 'won') {
       return (
        <div className="theme-selection"> {/* Reutiliza o estilo de centralizar */}
          <h2 className="success-message">Parabéns, você venceu!</h2>
          <h3>Estatísticas da Partida:</h3>
          <p><strong>Tema:</strong> {selectedTheme}</p>
          <p><strong>Dificuldade:</strong> {GAME_CONFIG[selectedDifficulty].label}</p>
          <p><strong>Tempo Final:</strong> {timer} segundos</p>
          <p><strong>Total de Jogadas:</strong> {moves}</p>
          <br/>
          <Button onClick={resetToThemeSelection} variant="primary">
            Jogar Novamente
          </Button>
        </div>
      );
    }
    
    return null; // Caso de erro
  };

  return (
    <div className="game-page">
      {renderContent()}
    </div>
  );
}

export default GamePage;