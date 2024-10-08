import React, { useState, useEffect } from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { tokens } from '../../Theme';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'; 
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard'; 
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import AddBoxIcon from '@mui/icons-material/AddBox'; 
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'; // Importa el icono de notificaciones

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

const SidebarComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState('Camiones');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate(); 

  useEffect(() => {
    const loggedInUser = localStorage.getItem('userEmail') || 'Usuario';
    setUserName(loggedInUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn'); 
    localStorage.removeItem('userRole'); 
    localStorage.removeItem('userEmail'); 
    alert('Sesión cerrada correctamente'); 
    navigate('/login_register'); 
  };

  return (
    <Box
      sx={{
        '& .pro-sidebar-inner': {
          background: `${colors.primary[400]} !important`,
        },
        '& .pro-icon-wrapper': {
          backgroundColor: 'transparent!important',
        },
        '& .pro-inner-item': {
          padding: '5px 35px 5px 20px!important',
        },
        '& .pro-inner-item:hover': {
          color: '#1F2A40!important',
        },
        '& .pro-menu-item.active': {
          color: '#1F2A40!important',
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon style={{ color: '#1F2A40' }} /> : undefined}
            style={{
              margin: '10px 0 20px 0',
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
                  sx={{ m: '10px 0 0 0' }}
                >
                  {userName}
                </Typography>
                <Typography variant="h5" color="#1F2A40">
                  Administrador
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : '10%'}>
            <Typography
              variant="h6"
              color="#1F2A40"
              sx={{ m: '15px 0 5px 20px' }}
            >
              Pages
            </Typography>
            <Item
              title="Nuevo Camión"
              to="/form"
              icon={<DirectionsBusIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Calendario"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Info Camión"
              to="/faq"
              icon={<DashboardIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Estado Camión"  
              to="/cargar_camion"
              icon={<AddBoxIcon />} 
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Notificaciones Conductores"
              to="/notificaciones"
              icon={<NotificationsActiveIcon />} 
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Notificaciones Clientes"
              to="/notificacionesCliente"
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

export default SidebarComponent;