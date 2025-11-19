import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCard, getCardById, updateCard } from '../services/cardService.js';
import Button from '../components/Button'; 
import Input from '../components/Input'; 
import LoadingSpinner from '../components/LoadingSpinner';

function AdminCardFormPage() {
  // Estado para os dados de texto e preview
  const [formData, setFormData] = useState({ name: '', theme: '', imageUrl: '' });
  // NOVO: Estado para guardar o arquivo físico que será enviado
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [loading, setLoading] = useState(false); 
  const [pageLoading, setPageLoading] = useState(false); 
  const [feedback, setFeedback] = useState(null); 
  
  const navigate = useNavigate();
  const { cardId } = useParams(); 
  const isEditing = Boolean(cardId);

  // Lógica de seleção de arquivo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Guarda o arquivo real para enviar pro backend depois
      setSelectedFile(file);

      // 2. Cria o preview visual para o usuário ver agora (Base64 ou URL temporária)
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Carrega dados se for edição
  useEffect(() => {
    if (isEditing) {
      setPageLoading(true);
      getCardById(cardId)
        .then(response => {
          // Preenche o formulário com os dados que vieram do banco
          setFormData(response.data);
        })
        .catch(() => {
          setFeedback({ type: 'error', message: 'Carta não encontrada.' });
        })
        .finally(() => setPageLoading(false));
    }
  }, [cardId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    // ---------------------------------------------------------
    // MUDANÇA CRUCIAL: Usando FormData para enviar Arquivo
    // ---------------------------------------------------------
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('theme', formData.theme);
    
    // Só anexa a imagem se o usuário tiver selecionado uma nova
    if (selectedFile) {
      // 'image' deve ser o mesmo nome que está no @RequestParam("image") do Kotlin
      dataToSend.append('image', selectedFile); 
    } else if (!isEditing) {
      // Se for criar nova e não tiver imagem, avisa (opcional)
      setFeedback({ type: 'error', message: 'Por favor, escolha uma imagem.' });
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        // Nota: Seu endpoint de update no backend precisa estar preparado para receber MultipartFile também
        // Se não estiver, talvez precise de uma lógica diferente aqui.
        await updateCard(cardId, dataToSend);
        setFeedback({ type: 'success', message: 'Carta atualizada com sucesso!' });
      } else {
        await createCard(dataToSend);
        setFeedback({ type: 'success', message: 'Carta criada com sucesso!' });
      }
      
      setTimeout(() => navigate('/admin'), 1500); 
      
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Falha ao salvar. Verifique os dados.' });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <LoadingSpinner />;

  return (
    <div className="form-page">
      <h2>{isEditing ? 'Editar Carta' : 'Nova Carta'}</h2>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome da Carta"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Leão"
        />
        <Input
          label="Tema"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          placeholder="Ex: Animais"
        />
        
        <div className="form-group">
          <label>Imagem da Carta</label>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            style={{ display: 'block', margin: '10px 0' }}
          />

          {formData.imageUrl && (
            <div style={{ marginTop: '10px' }}>
              <p style={{fontSize: '0.8rem', color: '#666'}}>Pré-visualização:</p>
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '8px' }} 
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>

      {feedback && (
        <p className={`feedback ${feedback.type}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

export default AdminCardFormPage;