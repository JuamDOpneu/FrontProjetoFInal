import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // <--- Importar o contexto
import Button from '../components/Button';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // <--- Pegar o status do usuário

  const handlePlayClick = () => {
    if (user) {
      navigate('/game'); // Se logado, vai pro jogo
    } else {
      navigate('/login'); // Se não, vai pro login
    }
  };

  return (
    <div className="home-page-container" style={{textAlign: 'center', padding: '2rem'}}>
      <h1>Jogo da Memória</h1>
      <p>Exercite seu cérebro e divirta-se encontrando os pares!</p>
      
      <div style={{marginTop: '2rem'}}>
        {/* Renderização Condicional do Botão */}
        <Button 
          variant={user ? "success" : "primary"} // Verde se puder jogar, Azul se precisar logar
          onClick={handlePlayClick}
          style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
        >
          {user ? "Jogar Agora!" : "Faça login para jogar"}
        </Button>
      </div>

      {!user && (
        <p style={{fontSize: '0.9rem', marginTop: '1rem', color: '#666'}}>
          É necessário ter uma conta para salvar seu progresso.
        </p>
      )}
    </div>
  );
}

export default HomePage;