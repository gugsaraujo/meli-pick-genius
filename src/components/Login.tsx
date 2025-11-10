// src/components/Login.tsx
import { generateCodeVerifier, generateCodeChallenge } from '../lib/pkceUtils';
import { Button } from './ui/button';

export default function Login() {
  const handleLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem('pkce_code_verifier', codeVerifier);

    const authUrl = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=SEU_APP_ID&redirect_uri=https://meli-pick-genius.netlify.app/callback&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=read%20write%20offline_access%20orders%20items%20shipments`;
    window.location.href = authUrl;
  };

  return (
    <div className="bg-gray-900 text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Meli Pick Genius</h1>
      <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
        Login com Mercado Livre
      </Button>
    </div>
  );
}
