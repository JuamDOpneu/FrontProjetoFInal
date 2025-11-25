import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function ProfilePage() {
  const { user, updateUser } = useContext(AuthContext);
  const [stats, setStats] = useState({ gamesPlayed: 0, wins: 0 });
  const [loading, setLoading] = useState(true);
  
  // Ref para o input de arquivo escondido
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      api.get(`/users/${user.id}/stats`)
        .then(res => setStats(res.data))
        .catch(err => console.error("Erro ao buscar stats", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Quando o usuário seleciona o arquivo, já faz o upload direto
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        setLoading(true); // Mostra loading rápido enquanto sobe
        const res = await api.put(`/users/${user.id}/avatar`, formData);
        updateUser(res.data); // Atualiza o contexto global e a imagem na tela
        alert('Foto atualizada com sucesso!');
    } catch (err) {
        console.error(err);
        alert('Erro ao atualizar foto.');
    } finally {
        setLoading(false);
    }
  };

  // Função para abrir o seletor de arquivos ao clicar na foto
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Cálculo de Porcentagem de Vitória (evita divisão por zero)
  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-container">
      
      {/* --- CARTÃO DO USUÁRIO --- */}
      <div className="profile-header-card">
        
        {/* Input escondido */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        {/* Avatar com Overlay de Edição */}
        <div className="avatar-wrapper" onClick={handleAvatarClick} title="Alterar foto">
          <img 
            src={user.avatarUrl || "https://via.placeholder.com/150?text=User"} 
            alt="Avatar" 
            className="profile-avatar-img"
          />
          <div className="avatar-overlay">
            📷 {/* Ícone de câmera (pode usar FontAwesome se tiver) */}
          </div>
        </div>

        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
            Clique na foto para alterar
          </p>
        </div>
      </div>

      {/* --- GRID DE ESTATÍSTICAS --- */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Partidas Jogadas</h3>
          <p className="value">{stats.gamesPlayed || 0}</p>
        </div>

        <div className="stat-card green">
          <h3>Vitórias</h3>
          <p className="value">{stats.wins || 0}</p>
        </div>

        <div className="stat-card purple">
          <h3>Aproveitamento</h3>
          <p className="value">{winRate}%</p>
        </div>
      </div>

    </div>
  );
}

export default ProfilePage;