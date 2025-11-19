import React from 'react';
import { NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="navigation">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/game">Jogar</NavLink>
      <NavLink to="/admin">Gerenciar Cartas</NavLink>
    </nav>
  );
}

export default Navigation;