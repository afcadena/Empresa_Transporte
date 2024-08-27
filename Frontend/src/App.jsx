import React, { useEffect } from "react";
import { ColorModeContext, useMode } from "./Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Sidebar from "./scenes/global/Sidebar";
import SidebarConductor from "./scenes/global/SidebarConductor";
import SidebarCliente from "./scenes/global/SidebarCliente";
import FAQ from "./scenes/faq";
import Calendar from "./scenes/calendar/calendar";
import Entregas from "./scenes/calendar/entregas";
import Form from "./scenes/form";
import LoginRegister from "./app/Login_register/Login_register";
import CargarCamion from "./scenes/cargarCamion/index";
import MiCamion from "./scenes/faq/miCamion";
import Notificaciones from "./scenes/faq/notificaciones";
import ConductorNotifications from "./scenes/faq/condunotis";
import ClienteNotifications from "./scenes/faq/clientenotis";
import MisPedidos from "./scenes/faq/mispedidos";
import Cuenta from "./scenes/faq/cuenta";
import NotificacionesClientes from "./scenes/faq/notificacionesCliente"

function App() {
  const [theme, colorMode] = useMode();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
      navigate("/login_register");
    }
  }, [navigate]);

  const renderRoutesByRole = () => {
    const userRole = localStorage.getItem('userRole');

    if (userRole === 'conductor') {
      return (
        <>
          <SidebarConductor />
          <main className="content">
            <Routes>
              <Route path="/mi_camion" element={<MiCamion />} />
              <Route path="/entregas" element={<Entregas />} />
              <Route path="/condunotis" element={<ConductorNotifications />} />
            </Routes>
          </main>
        </>
      );
    } else if (userRole === 'cliente') {
      return (
        <>
          <SidebarCliente />
          <main className="content">
            <Routes>
              <Route path="/cuenta" element={<Cuenta />} />
              <Route path="/mis_pedidos" element={<MisPedidos />} />
              <Route path="/notificacionesClie" element={<ClienteNotifications/>} />
            </Routes>
          </main>
        </>
      );
    } else {
      return (
        <>
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/faq" element={<FAQ />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/form" element={<Form />} />
              <Route path="/cargar_camion" element={<CargarCamion />} />
              <Route path="/notificaciones" element={<Notificaciones />} />
              <Route path="/notificacionesCliente" element={<NotificacionesClientes />} />
            </Routes>
          </main>
        </>
      );
    }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/login_register" replace />}
            />
            <Route path="/login_register" element={<LoginRegister />} />
            <Route
              path="/*"
              element={
                localStorage.getItem('loggedIn') ? (
                  renderRoutesByRole()
                ) : (
                  <Navigate to="/login_register" />
                )
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
