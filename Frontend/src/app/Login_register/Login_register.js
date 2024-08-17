import React, { useState } from 'react';
import * as Components from './Components.js';
import axios from 'axios';

function Login_register() {
  const [signIn, setSignIn] = useState(true);
  const [formData, setFormData] = useState({ nombre: '', correo: '', contraseña: '', rol: 'admin' });
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
      const endpoint = formData.rol === 'conductor' ? 'camiones' : 'administrador';
      await axios.post(`http://localhost:3001/${endpoint}`, {
        ...formData,
        id: Date.now(),
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

      // Buscar en la tabla de administradores
      const adminRes = await axios.get(`http://localhost:3001/administrador?correo=${correo}`);
      const admin = adminRes.data.find((u) => u.correo === correo && u.contraseña === contraseña);

      // Buscar en la tabla de camiones para encontrar conductores
      const conductorRes = await axios.get(`http://localhost:3001/camiones?correo=${correo}`);
      const conductor = conductorRes.data.find((u) => u.correo === correo && u.contraseña === contraseña);

      // Validar si el usuario es un administrador o conductor
      const user = admin || conductor;

      if (user) {
        alert(`Inicio de sesión exitoso como ${user.rol}`);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userRole', user.rol);
        localStorage.setItem('userEmail', user.correo);
        if (user.rol === 'admin' || user.rol === 'superadmin') {
          window.location.href = '/form';
        } else if (user.rol === 'conductor') {
          window.location.href = '/mi_camion'; // Cambiar a la ruta principal para conductores
        }
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
          <select
            name='rol'
            value={formData.rol}
            onChange={handleInputChange}
            style={{ padding: '10px', marginTop: '10px', borderRadius: '4px', width: '100%' }}
          >
            <option value='admin'>Administrador</option>
            <option value='conductor'>Conductor</option>
          </select>
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
