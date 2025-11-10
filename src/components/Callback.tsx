// src/components/Callback.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const storedVerifier = localStorage.getItem('pkce_code_verifier');

  useEffect(() => {
    if (code && storedVerifier) {
      fetchToken(code, storedVerifier);
    }
  }, [code, storedVerifier]);

  async function fetchToken(code: string, codeVerifier: string) {
    try {
      const response = await axios.post('https://api.mercadolibre.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: '3183856155449075',
        client_secret: 'mBPsAyngR8Nwc4Nwl8F14N8bYaqgTBdr',
        code,
        redirect_uri: 'https://golden-halva-ed0b5f.netlify.app/callback',
        code_verifier: codeVerifier,
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('ml_access_token', response.data.access_token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro:', error.response?.data);
      alert('Erro na autenticação.');
    }
  }

  return <div className="bg-gray-900 text-white p-6">Autorizando...</div>;
}
