import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper } from "@mui/material";
import axios from "axios";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener las notificaciones desde el servidor
    axios.get("http://localhost:3001/notificaciones")
      .then((response) => {
        // Filtrar las notificaciones para excluir las aceptadas y confirmadas
        setNotificaciones(response.data.filter(noti => noti.estado !== 'aceptada' && noti.estado !== 'confirmada'));
      })
      .catch((error) => {
        console.error("Error al obtener las notificaciones:", error.response ? error.response.data : error.message);
        setError("Error al cargar las notificaciones.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAceptar = (notificacion) => {
    const encargoId = notificacion.id; // Usamos el ID de la notificación como ID de encargo

    if (!encargoId) {
      alert("No se encontró un ID de encargo válido para esta notificación.");
      return;
    }

    console.log("Aceptando notificación con ID:", notificacion.id);

    axios.put(`http://localhost:3001/notificaciones/${notificacion.id}`, { estado: 'aceptada' })
      .then(() => {
        // Asegúrate de que el ID de encargo corresponde con un ID en la base de datos
        console.log("Eliminando encargo con ID:", encargoId);
        return axios.delete(`http://localhost:3001/encargos/${encargoId}`);
      })
      .then(() => {
        return axios.post(`http://localhost:3001/notificaciones`, {
          conductor: notificacion.conductor,
          mensaje: `Tu encargo con ID ${encargoId} ha sido aceptado y eliminado.`,
          estado: 'confirmada'
        });
      })
      .then(() => {
        setNotificaciones((prevNotificaciones) =>
          prevNotificaciones.filter(n => n.id !== notificacion.id)
        );
        alert("Notificación aceptada, encargo eliminado y confirmación enviada al conductor.");
      })
      .catch((error) => {
        console.error("Error al aceptar la notificación, eliminar el encargo o enviar confirmación:", error.response ? error.response.data : error.message);
        alert("Hubo un problema al aceptar la notificación o eliminar el encargo.");
      });
  };

  const handleRechazar = (id) => {
    axios.put(`http://localhost:3001/notificaciones/${id}`, { estado: 'rechazada' })
      .then(() => {
        setNotificaciones((prevNotificaciones) =>
          prevNotificaciones.filter(n => n.id !== id)
        );
        alert("Notificación rechazada con éxito.");
      })
      .catch((error) => {
        console.error("Error al rechazar la notificación:", error.response ? error.response.data : error.message);
        alert("Hubo un problema al rechazar la notificación.");
      });
  };

  if (loading) {
    return <Typography>Cargando notificaciones...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Notificaciones de Conductores
      </Typography>

      <Paper>
        <List>
          {notificaciones.length === 0 ? (
            <Typography>No hay notificaciones pendientes.</Typography>
          ) : (
            notificaciones.map((notificacion) => (
              <ListItem key={notificacion.id}>
                <ListItemText
                  primary={`Conductor: ${notificacion.conductor || 'Desconocido'}`}
                  secondary={`Encargo: ${notificacion.encargo || 'Desconocido'} - ${notificacion.fecha || 'Fecha no disponible'}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="aceptar" onClick={() => handleAceptar(notificacion)}>
                    <CheckIcon color="primary" />
                  </IconButton>
                  <IconButton edge="end" aria-label="rechazar" onClick={() => handleRechazar(notificacion.id)}>
                    <CloseIcon color="error" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Notificaciones;