import React, { useEffect } from "react";
import { ColorModeContext, useMode } from "./Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Sidebar from "./scenes/global/Sidebar";
import SidebarConductor from "./scenes/global/SidebarConductor";  // Importa el SidebarConductor
import FAQ from "./scenes/faq";
import Calendar from "./scenes/calendar/calendar";
import Form from "./scenes/form";
import LoginRegister from "./app/Login_register/Login_register";
import CargarCamion from "./scenes/cargarCamion/index";  // Importa el nuevo componente
import MiCamion from "./scenes/faq/miCamion";  // Asegúrate de tener este componente creado para mostrar la información del camión

function App() {
  const [theme, colorMode] = useMode();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
      navigate("/login_register");
    }
  }, [navigate]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Routes>
            {/* Ruta predeterminada redirige a login si no está autenticado */}
            <Route 
              path="/" 
              element={<Navigate to="/login_register" replace />} 
            />

            {/* Ruta del login */}
            <Route path="/login_register" element={<LoginRegister />} />
            
            {/* Rutas protegidas según el rol */}
            <Route
              path="/*"
              element={
                localStorage.getItem('loggedIn') ? (
                  localStorage.getItem('userRole') === 'conductor' ? (
                    <>
                      <SidebarConductor />  {/* Muestra el Sidebar del Conductor */}
                      <main className="content">
                        <Routes>
                          <Route path="/mi_camion" element={<MiCamion />} /> {/* Ruta para ver información del camión */}
                          <Route path="/calendar" element={<Calendar />} />

                        </Routes>
                      </main>
                    </>
                  ) : (
                    <>
                      <Sidebar />  {/* Muestra el Sidebar del Administrador */}
                      <main className="content">
                        <Routes>
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/form" element={<Form />} />
                          <Route path="/cargar_camion" element={<CargarCamion />} /> {/* Nueva ruta */}
                        </Routes>
                      </main>
                    </>
                  )
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
