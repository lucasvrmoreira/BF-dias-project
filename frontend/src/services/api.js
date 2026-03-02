// src/services/api.js

// Verifica se está rodando localmente ou na nuvem
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';


const API_URL = isLocalhost ? 'http://127.0.0.1:8000' : 'https://bf-dias-project.onrender.com/';

export const acordarServidorRender = async () => {
  try {
    await fetch(`${API_URL}/health`);
  } catch (error) {
    console.error("Erro ao tentar acordar o servidor:", error);
  }
};

export const fetchCalcularAOR = async (dados) => {
  const response = await fetch(`${API_URL}/calcular-aor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error("Erro ao calcular AOR");
  return response.json();
};

export const fetchCalcularSOR = async (dados) => {
  const response = await fetch(`${API_URL}/calcular-sor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error("Erro ao calcular SOR");
  return response.json();
};

export const fetchCalcularVazao = async (dados) => {
  const response = await fetch(`${API_URL}/calcular-vazao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error("Erro ao calcular Vazão");
  return response.json();
};