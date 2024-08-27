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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";

const NotificacionesClientes = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/notificaciones_cliente")
      .then(response => {
        // Filtrar las notificaciones que no están confirmadas
        setNotificaciones(response.data.filter(noti => noti.estado !== 'confirmado'));
      })
      .catch(error => {
        console.error("Error al obtener las notificaciones:", error);
        setError(`Error al cargar las notificaciones: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAceptar = () => {
    if (selectedNotificacion) {
      const { id, clienteId } = selectedNotificacion;

      // Actualizar el estado de la notificación localmente
      const updatedNotificaciones = notificaciones.map(noti =>
        noti.id === id ? { ...noti, estado: 'confirmado' } : noti
      );
      setNotificaciones(updatedNotificaciones);

      // Enviar la actualización al servidor
      axios.put(`http://localhost:3001/notificaciones_cliente/${id}`, {
        estado: 'confirmado'
      })
      .then(() => {
        console.log("Notificación actualizada en el servidor");
        
        // Eliminar el encargo del servidor
        return axios.delete(`http://localhost:3001/encargosCliente/${id}`);
      })
      .then(() => {
        // Enviar una nueva notificación al cliente
        return axios.post(`http://localhost:3001/notificaciones_cliente`, {
          clienteId,
          mensaje: `Tu encargo con ID ${id} ha sido aceptado y enviado.`,
          estado: 'enviado',
          fecha: new Date().toISOString()
        });
      })
      .then(() => {
        console.log("Notificación enviada al cliente");
      })
      .catch(error => {
        console.error("Error al procesar la notificación:", error);
        setError(`Error al procesar la notificación: ${error.message}`);
      })
      .finally(() => {
        setOpenConfirmationDialog(false);
      });
    }
  };

  const handleRechazar = (id) => {
    axios.put(`http://localhost:3001/notificaciones_cliente/${id}`, { estado: 'rechazada' })
      .then(() => {
        setNotificaciones(prev => prev.filter(noti => noti.id !== id));
        alert("Notificación rechazada con éxito.");
      })
      .catch(error => {
        console.error("Error al rechazar la notificación:", error);
        alert(`Error al rechazar la notificación: ${error.message}`);
      });
  };

  const handleViewDetails = (notificacion) => {
    const encargoId = notificacion.id;

    if (!encargoId) {
      alert("ID de notificación no válido.");
      return;
    }

    axios.get(`http://localhost:3001/encargosCliente/${encargoId}`)
      .then(response => {
        setDetalle(response.data);
        setSelectedNotificacion(notificacion);
        setOpenDetailsDialog(true);
      })
      .catch(error => {
        console.error("Error al obtener los detalles del encargo:", error);
        setError(`Error al cargar los detalles del encargo: ${error.message}`);
        alert(`Error al cargar los detalles del encargo: ${error.message}`);
      });
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedNotificacion(null);
    setDetalle(null);
  };

  const handleOpenConfirmationDialog = (notificacion) => {
    setSelectedNotificacion(notificacion);
    setOpenConfirmationDialog(true);
  };

  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false);
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
      <Typography variant="h4" gutterBottom>Notificaciones de Clientes</Typography>

      <Paper>
        <List>
          {notificaciones.length === 0 ? (
            <Typography>No hay notificaciones pendientes.</Typography>
          ) : (
            notificaciones.map((notificacion) => (
              <ListItem key={notificacion.id}> {/* Usar el ID de la notificación como clave única */}
                <ListItemText
                  primary={`Cliente: ${notificacion.clienteId || 'Desconocido'}`}
                  secondary={`Mensaje: ${notificacion.mensaje || 'Desconocido'} - ${new Date(notificacion.fecha).toLocaleDateString() || 'Fecha no disponible'}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="detalles" onClick={() => handleViewDetails(notificacion)}>
                    <Typography variant="body2">Detalles</Typography>
                  </IconButton>
                  <IconButton edge="end" aria-label="aceptar" onClick={() => handleOpenConfirmationDialog(notificacion)}>
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
          {detalle ? (
            <Box>
              <Typography variant="h6">Detalles del Encargo:</Typography>
              <Typography>ID Encargo: {detalle.id || 'Desconocido'}</Typography>
              <Typography>Cliente: {detalle.clienteId || 'Desconocido'}</Typography>
              <Typography>Fecha de Pedido: {new Date(detalle.fecha_pedido).toLocaleDateString() || 'Desconocido'}</Typography>
              <Typography>Producto: {detalle.producto || 'Desconocido'}</Typography>
              <Typography>Cantidad: {detalle.cantidad || 'Desconocido'}</Typography>
              <Typography>Estado: {detalle.estado || 'Desconocido'}</Typography>
              <Typography>Carga: {detalle.carga || 'Desconocido'} kg</Typography>
              <Typography>Lugar: {detalle.lugar || 'Desconocido'}</Typography>
            </Box>
          ) : (
            <Typography>No hay detalles disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmationDialog} onClose={handleCloseConfirmationDialog}>
        <DialogTitle>Confirmar Aceptación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de aceptar el pedido?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog} color="primary">Cancelar</Button>
          <Button onClick={handleAceptar} color="primary">Aceptar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificacionesClientes;
