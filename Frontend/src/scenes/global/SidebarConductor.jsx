import React, { useState, useEffect } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../Theme";
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const Item = ({ title, to, icon, selected, setSelected }) => {
  const navigate = useNavigate();

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: selected === title ? '#1F2A40' : '#1F2A40',
        backgroundColor: selected === title ? 'rgba(31, 42, 64, 0.1)' : 'transparent',
      }}
      onClick={() => {
        setSelected(title);
        navigate(to);
      }}
      icon={React.cloneElement(icon, { style: { color: '#1F2A40' } })}
    >
      <Typography color="#1F2A40">{title}</Typography>
    </MenuItem>
  );
};

const SidebarConductor = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Mi Camión");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("userEmail") || "Usuario";
    setUserName(loggedInUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Ajusta según tu método de autenticación
    localStorage.removeItem('userEmail');
    alert('Sesión cerrada correctamente'); // Muestra una ventana emergente
    navigate('/login_register'); // Redirige al usuario a la página de login
  };

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent!important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px!important",
        },
        "& .pro-inner-item:hover": {
          color: "#1F2A40!important",
        },
        "& .pro-menu-item.active": {
          color: "#1F2A40!important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon style={{ color: '#1F2A40' }} /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: '#1F2A40',
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
                background={colors.primary[400]}
              >
                <Typography variant="h3" color="#1F2A40">
                  EmpreTrans
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon style={{ color: '#1F2A40' }} />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color="#1F2A40"
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {userName}
                </Typography>
                <Typography variant="h5" color="#1F2A40">
                  Conductor
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Typography
              variant="h6"
              color="#1F2A40"
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="Mi Camión"
              to="/mi_camion"
              icon={<DirectionsBusIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Entregas"
              to="/entregas"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Notificaciones"
              to="/condunotis" // Añadir la ruta para las notificaciones
              icon={<NotificationsActiveIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <MenuItem
              onClick={handleLogout}
              style={{
                color: '#1F2A40',
                marginTop: 'auto',
              }}
              icon={<ExitToAppIcon style={{ color: '#1F2A40' }} />}
            >
              <Typography color="#1F2A40">Logout</Typography>
            </MenuItem>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default SidebarConductor;
