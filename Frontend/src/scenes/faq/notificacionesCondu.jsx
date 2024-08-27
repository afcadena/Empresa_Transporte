import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button
} from "@mui/material";
import axios from "axios";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const NotificacionesConductores = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null); 
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false); 

  useEffect(() => {
    // Obtener las notificaciones desde el servidor
    axios.get("http://localhost:3001/notificaciones")
      .then((response) => {
        setNotificaciones(response.data.filter(noti => noti.estado !== 'aceptada' && noti.estado !== 'confirmada' && noti.tipo === 'conductor'));
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
    const encargoId = notificacion.id;

    if (!encargoId) {
      alert("No se encontró un ID de encargo válido para esta notificación.");
      return;
    }

    console.log("Aceptando notificación con ID:", encargoId);

    axios.put(`http://localhost:3001/notificaciones/${encargoId}`, { estado: 'aceptada' })
      .then(() => {
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
          prevNotificaciones.filter(n => n.id !== encargoId)
        );
        alert("Notificación aceptada, encargo eliminado y confirmación enviada al conductor.");
      })
      .catch((error) => {
        console.error("Error al aceptar la notificación, eliminar el encargo o enviar confirmación:", error.response ? error.response.data : error.message);
        alert("Hubo un problema al aceptar la notificación o eliminar el encargo.");
      });
  };

  const handleRechazar = (id) => {
    if (!id) {
      alert("ID de notificación no válido.");
      return;
    }

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

  const handleViewDetails = (notificacion) => {
    const encargoId = notificacion.id;

    if (!encargoId) {
      alert("ID de notificación no válido para detalles.");
      return;
    }

    axios.get(`http://localhost:3001/encargos/${encargoId}`)
      .then((response) => {
        setSelectedNotificacion({ ...notificacion, encargoDetails: response.data });
        setOpenDetailsDialog(true);
      })
      .catch((error) => {
        console.error("Error al obtener los detalles del encargo:", error.response ? error.response.data : error.message);
        alert("Error al cargar los detalles del encargo.");
      });
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedNotificacion(null);
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
                  <IconButton edge="end" aria-label="detalles" onClick={() => handleViewDetails(notificacion)}>
                    <Typography variant="body2">Detalles</Typography>
                  </IconButton>
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

      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog}>
        <DialogTitle>Detalles del Encargo</DialogTitle>
        <DialogContent>
          {selectedNotificacion ? (
            <Box>
              <Typography variant="h6">Detalles del Pedido:</Typography>
              <Typography>Producto: {selectedNotificacion.encargoDetails?.producto || 'Desconocido'}</Typography>
              <Typography>Cantidad: {selectedNotificacion.encargoDetails?.cantidad || 'Desconocido'}</Typography>
              <Typography>Estado: {selectedNotificacion.encargoDetails?.estado || 'Desconocido'}</Typography>
              <Typography>Fecha: {new Date(selectedNotificacion.encargoDetails?.fecha).toLocaleDateString() || 'Desconocido'}</Typography>
              <Typography>Carga: {selectedNotificacion.encargoDetails?.carga || 'Desconocido'}</Typography>
            </Box>
          ) : (
            <Typography>No hay detalles disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificacionesConductores;
