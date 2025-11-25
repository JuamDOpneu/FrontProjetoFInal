import React, { useState, useEffect, useRef, useContext } from 'react';
import { getDistinctThemes, getCards } from '../services/cardService.js';
import { AuthContext } from '../contexts/AuthContext'; // <--- Importando Contexto de Auth
import api from '../services/api'; // <--- Importando API para salvar resultado
import MemoryCardComponent from '../components/MemoryCardComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

// --- CONFIGURAÇÃO DOS NÍVEIS ---
const GAME_CONFIG = {
  easy: { pairs: 6, label: 'Fácil (6 Pares)' },
  medium: { pairs: 8, label: 'Médio (8 Pares)' },
  hard: { pairs: 10, label: 'Difícil (10 Pares)' },
};

// Função para embaralhar
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

function GamePage() {
  const { user } = useContext(AuthContext); // <--- Acessando usuário logado
  
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); 
  const [matched, setMatched] = useState([]); 
  const [moves, setMoves] = useState(0);

  // Estados de Controle
  const [gameState, setGameState] = useState('loading');
  const [availableThemes, setAvailableThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [error, setError] = useState(null);
  
  // Timer
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef(null); 

  // 1. Carregar Temas
  useEffect(() => {
    const loadThemes = async () => {
      setGameState('loading');
      setError(null);
      try {
        const response = await getDistinctThemes();
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
  }, []);

  // 2. Limpeza do Timer
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setGameState('difficultySelection');
  };

  const startGame = async (difficultyKey) => {
    setGameState('loading');
    setSelectedDifficulty(difficultyKey);
    setError(null);
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setMoves(0);

    try {
      const { pairs } = GAME_CONFIG[difficultyKey];
      const response = await getCards({ theme: selectedTheme });
      
      if (response.data.length < pairs) {
         setError(`O tema "${selectedTheme}" não tem cartas suficientes (${pairs}).`);
         setGameState('difficultySelection');
         return;
      }

      const pairsDeck = response.data.slice(0, pairs);
      const gameDeck = [...pairsDeck, ...pairsDeck].map((card, i) => ({
        ...card,
        uniqueId: i, 
      }));
      setCards(shuffleArray(gameDeck));
      setGameState('playing');

      // Inicia Timer
      setTimer(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError("Falha ao carregar o jogo.");
      setGameState('error');
    }
  };

  const handleCardClick = (index) => {
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
        
        // Checa Vitória
        if (newMatched.length === cards.length / 2) {
          handleGameWin(); // <--- Chama função de vitória
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // --- Lógica de Vitória e Salvamento ---
  const handleGameWin = () => {
      setGameState('won');
      
      // Para o Timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Se usuário estiver logado, salva no banco
      if (user && user.id) {
          const gameData = {
              win: true,
              moves: moves + 1, // +1 pois o state 'moves' ainda não atualizou na renderização
              time: timer,
              difficulty: selectedDifficulty,
              theme: selectedTheme
          };

          api.post(`/users/${user.id}/game-result`, gameData)
             .then(() => console.log("Resultado salvo com sucesso!"))
             .catch(err => console.error("Erro ao salvar resultado:", err));
      }
  };

  const resetToThemeSelection = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setGameState('themeSelection');
    setSelectedTheme(null);
    setSelectedDifficulty(null);
    setCards([]);
    setError(null);
  };

  const renderContent = () => {
    if (gameState === 'loading') return <LoadingSpinner />;
    if (error && gameState !== 'difficultySelection') return <p className="error-message">{error}</p>;
    
    // --- TELA 1: TEMA ---
    if (gameState === 'themeSelection') {
      return (
        <div className="theme-selection">
          <h2>Escolha um Tema</h2>
          <div className="theme-buttons">
            {availableThemes.map(theme => (
                <Button key={theme} onClick={() => handleThemeSelect(theme)}>{theme}</Button>
            ))}
          </div>
        </div>
      );
    }

    // --- TELA 2: DIFICULDADE ---
    if (gameState === 'difficultySelection') {
      return (
        <div className="theme-selection">
          <h2>Tema: {selectedTheme}</h2>
          <h3>Dificuldade:</h3>
          {error && <p className="error-message">{error}</p>}
          <div className="theme-buttons">
            {Object.keys(GAME_CONFIG).map(key => (
              <Button key={key} onClick={() => startGame(key)}>{GAME_CONFIG[key].label}</Button>
            ))}
          </div>
          <Button onClick={resetToThemeSelection} variant="secondary" style={{marginTop: '2rem'}}>Voltar</Button>
        </div>
      );
    }
    
    // --- TELA 3: JOGANDO ---
    if (gameState === 'playing') {
      return (
        <div>
          {/* AQUI: Usamos a classe CSS 'game-stats-bar' para responsividade */}
          <div className="game-stats-bar">
            <Button onClick={resetToThemeSelection} variant="secondary">Voltar</Button>
            
            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center'}}>
                <h3 style={{margin: 0}}>Tema: {selectedTheme}</h3>
                <h3 style={{margin: 0, color: '#007bff'}}>Tempo: {timer}s</h3>
                <h3 style={{margin: 0, color: '#dc3545'}}>Jogadas: {moves}</h3>
            </div>
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
        <div className="theme-selection">
          <h2 className="success-message">Parabéns, você venceu!</h2>
          <div style={{margin: '1rem 0'}}>
             <p><strong>Tempo:</strong> {timer} segundos</p>
             <p><strong>Jogadas:</strong> {moves}</p>
          </div>
          
          {/* Mensagem sobre salvamento */}
          <p style={{fontSize: '0.9rem', color: user ? '#28a745' : '#6c757d'}}>
              {user 
                ? "Resultado salvo no seu perfil! 🏆" 
                : "Faça login para salvar suas estatísticas na próxima vez."}
          </p>

          <Button onClick={resetToThemeSelection} variant="primary">Jogar Novamente</Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="game-page">
      {renderContent()}
    </div>
  );
}

export default GamePage;