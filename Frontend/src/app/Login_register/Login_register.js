import React, { useState } from 'react';
import * as Components from './Components.js';
import axios from 'axios';

function Login_register() {
  const [signIn, setSignIn] = useState(true);
  const [formData, setFormData] = useState({ nombre: '', correo: '', contraseña: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [message, setMessage] = useState(''); // Nuevo estado para manejar los mensajes de éxito o error

  const toggle = (isSignIn) => {
    setSignIn(isSignIn);
    setLoginError('');
    setRegisterError('');
    setMessage(''); // Limpiar mensajes al cambiar entre login y registro
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  };

  const registerUser = async () => {
    if (!validatePassword(formData.contraseña)) {
      setRegisterError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.');
      return;
    }

    try {
      const newUser = {
        ...formData,
        rol: 'cliente',
        id: Date.now(),
      };

      await axios.post(`http://localhost:3001/clientes`, newUser);
      setMessage('Usuario registrado con éxito como cliente'); // Reemplazo de alert
      toggle(true);
    } catch (error) {
      console.error(error);
      setMessage('Error al registrar el usuario.'); // Reemplazo de alert
    }
  };

  const loginUser = async () => {
    try {
      const { correo, contraseña } = formData;
      if (!correo || !contraseña) {
        setLoginError('Todos los campos son obligatorios.');
        return;
      }

      const adminRes = await axios.get(`http://localhost:3001/administrador?correo=${correo}`);
      const admin = adminRes.data.find((u) => u.correo === correo && u.contraseña === contraseña);

      const conductorRes = await axios.get(`http://localhost:3001/camiones?correo=${correo}`);
      const conductor = conductorRes.data.find((u) => u.correo === correo && u.contraseña === contraseña);

      const clienteRes = await axios.get(`http://localhost:3001/clientes?correo=${correo}`);
      const cliente = clienteRes.data.find((u) => u.correo === correo && u.contraseña === contraseña);

      const user = admin || conductor || cliente;

      if (user) {
        setMessage(`Inicio de sesión exitoso como ${user.rol}`); // Reemplazo de alert
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userRole', user.rol);
        localStorage.setItem('userEmail', user.correo);
        localStorage.setItem('userId', user.id);

        if (user.rol === 'admin' || user.rol === 'superadmin') {
          window.location.href = '/form';
        } else if (user.rol === 'conductor') {
          window.location.href = '/mi_camion';
        } else if (user.rol === 'cliente') {
          window.location.href = '/mis_pedidos';
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
      {/* Mostrar mensaje general */}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      
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
          {registerError && <p style={{ color: 'red' }}>{registerError}</p>}
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
              Para crear una cuenta nueva, por favor ingresa tus datos.
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(false)}>
              Crear Cuenta
            </Components.GhostButton>
          </Components.RightOverlayPanel>
        </Components.Overlay>
      </Components.OverlayContainer>
    </Components.Container>
  );
}

export default Login_register;
