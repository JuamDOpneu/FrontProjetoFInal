import axios from 'axios';

const api = axios.create({
  /**
   * Esta é a "inicialização".
   * Estamos dizendo ao Axios que toda requisição que ele fizer
   * deve começar com este endereço (a URL do seu back-end Kotlin).
   */
  baseURL: 'http://localhost:8080/api', 
});

export default api;