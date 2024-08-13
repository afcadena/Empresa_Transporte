import React, { useState } from 'react';
import * as Components from './Components.js';
import axios from 'axios';

function Login_register() {
  const [signIn, setSignIn] = useState(true);
  const [formData, setFormData] = useState({ nombre: '', correo: '', contraseña: '' });
  const [loginError, setLoginError] = useState('');

  const toggle = (isSignIn) => {
    setSignIn(isSignIn);
    setLoginError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const registerUser = async () => {
    try {
      const response = await axios.post('http://localhost:3001/administrador', {
        ...formData,
        id: Date.now(),
        rol: 'admin',
      });
      alert('Usuario registrado con éxito');
      toggle(true);
    } catch (error) {
      console.error(error);
      alert('Error al registrar el usuario.');
    }
  };

  const loginUser = async () => {
    try {
      const { correo, contraseña } = formData;
      if (!correo || !contraseña) {
        setLoginError('Todos los campos son obligatorios.');
        return;
      }

      const response = await axios.get(`http://localhost:3001/administrador?correo=${correo}`);
      const user = response.data.find((u) => u.correo === correo);

      if (user && user.contraseña === contraseña) {
        alert('Inicio de sesión exitoso como Administrador');
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userRole', user.rol);
        window.location.href = '/form'; // Redirige al formulario
      } else {
        setLoginError('Correo o contraseña incorrectos.');
      }
    } catch (error) {
      console.error(error);
      setLoginError('Error al iniciar sesión. Inténtalo de nuevo.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (signIn) {
      loginUser();
    } else {
      registerUser();
    }
  };

  return (
    <Components.Container>
      <Components.SignUpContainer signinIn={signIn}>
        <Components.Form onSubmit={handleSubmit}>
          <Components.Title>Crea Una cuenta</Components.Title>
          <Components.Input
            type='text'
            placeholder='Nombre'
            name='nombre'
            value={formData.nombre}
            onChange={handleInputChange}
          />
          <Components.Input
            type='email'
            placeholder='Correo'
            name='correo'
            value={formData.correo}
            onChange={handleInputChange}
          />
          <Components.Input
            type='password'
            placeholder='Contraseña'
            name='contraseña'
            value={formData.contraseña}
            onChange={handleInputChange}
          />
          <Components.Button type='submit'>Crear cuenta</Components.Button>
        </Components.Form>
      </Components.SignUpContainer>

      <Components.SignInContainer signinIn={signIn}>
        <Components.Form onSubmit={handleSubmit}>
          <Components.Title>Iniciar Sesión</Components.Title>
          <Components.Input
            type='email'
            placeholder='Correo'
            name='correo'
            value={formData.correo}
            onChange={handleInputChange}
          />
          <Components.Input
            type='password'
            placeholder='Contraseña'
            name='contraseña'
            value={formData.contraseña}
            onChange={handleInputChange}
          />
          <Components.Anchor href='#'>Olvidaste tu contraseña?</Components.Anchor>
          <Components.Button type='submit'>Iniciar Sesión</Components.Button>
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        </Components.Form>
      </Components.SignInContainer>

      <Components.OverlayContainer signinIn={signIn}>
        <Components.Overlay signinIn={signIn}>
          <Components.LeftOverlayPanel signinIn={signIn}>
            <Components.OverlayTitle>Bienvenido a EmpreTransporte</Components.OverlayTitle>
            <Components.Paragraph>
              Para acceder a tu panel de administración, por favor ingresa con tus credenciales.
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(true)}>
              Iniciar Sesión
            </Components.GhostButton>
          </Components.LeftOverlayPanel>

          <Components.RightOverlayPanel signinIn={signIn}>
            <Components.OverlayTitle>Bienvenido a Empretransporte</Components.OverlayTitle>
            <Components.Paragraph>
              Regístrate con tus datos personales y empieza a usar nuestra plataforma.
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(false)}>
              Registrarse
            </Components.GhostButton>
          </Components.RightOverlayPanel>
        </Components.Overlay>
      </Components.OverlayContainer>
    </Components.Container>
  );
}

export default Login_register;
