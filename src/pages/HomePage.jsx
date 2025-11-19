import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button'; // Vamos usar nosso componente de botão!

function HomePage() {
  return (
    // Adicione esta classe "home-page-container"
    <div className="home-page-container">
      <h1>Bem-vindo ao Jogo da Memória!</h1>
      <p>Use a navegação acima para gerenciar as cartas ou clique abaixo para jogar.</p>
      
      {/* Usando o componente Button fica mais bonito */}
      <Link to="/game">
        <Button variant="primary">Começar a Jogar</Button>
      </Link>
    </div>
  );
}

export default HomePage;