// src/app/Login_register/Login_register.js
import React, { useState } from 'react';
import * as Components from './Components.js'; // Asegúrate de que la ruta sea correcta

function Login_register() {
  const [signIn, setSignIn] = useState(true);

  const toggle = (isSignIn) => {
    setSignIn(isSignIn);
  };

  return (
    <Components.Container>
      <Components.SignUpContainer signinIn={signIn}>
        <Components.Form>
          <Components.Title>Crea Una cuenta</Components.Title>
          <Components.Input type='text' placeholder='Nombre' />
          <Components.Input type='email' placeholder='Correo' />
          <Components.Input type='password' placeholder='Contraseña' />
          <Components.Button>Crear cuenta</Components.Button>
        </Components.Form>
      </Components.SignUpContainer>

      <Components.SignInContainer signinIn={signIn}>
        <Components.Form>
          <Components.Title>Iniciar Sesión</Components.Title>
          <Components.Input type='email' placeholder='Correo' />
          <Components.Input type='password' placeholder='Contraseña' />
          <Components.Anchor href='#'>Olvidaste tu contraseña?</Components.Anchor>
          <Components.Button>Iniciar Sesión</Components.Button>
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
