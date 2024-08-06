import React, { useEffect } from "react";
import { ColorModeContext, useMode } from "./Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import FAQ from "./scenes/faq";
import Calendar from "./scenes/calendar/calendar";
import Form from "./scenes/form";
import LoginRegister from "./app/Login_register/Login_register";

function App() {
  const [theme, colorMode] = useMode();
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      localStorage.setItem("hasVisited", "true");
      navigate("/Login_register");
    }
  }, [navigate]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Routes>
            <Route path="/login_register" element={<LoginRegister />} />
            <Route
              path="/*"
              element={
                <>
                  <Sidebar />
                  <main className="content">
                    <Topbar />
                    <Routes>
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/form" element={<Form />} />
                      <Route path="/" element={<Form />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
