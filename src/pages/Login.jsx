import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

import '../App.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  

const handleLogin = async () => {
    setError('');
    /*console.log(username, password);*/


    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      const response = await fetch('http://localhost/api-login/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('logged', 'true')
        navigate('/dashboard');
      } else {
        setError(data.message);
      }

    } catch  {
      setError('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="login-area">
      <div className="login-card">

        <div className="login-header">
          <i className="pi pi-user login-icon"></i>
          <h2>Área de Login</h2>
        </div>

        <div className="login-form">
          <FloatLabel>
            <InputText
              inputId="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
            <label htmlFor="username">Username</label>
          </FloatLabel>

          <FloatLabel>
            <Password
              inputId="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              className="login-password"
            />
            <label htmlFor="password">Senha</label>
          </FloatLabel>

          {error && <small style={{ color: 'red' }}>{error}</small>}

          <Button
            label="Entrar"
            className="login-button"
            onClick={handleLogin}
          />
        </div>

      </div>
    </div>
  );
}
