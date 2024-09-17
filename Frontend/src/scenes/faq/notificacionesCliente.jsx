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
  Button,
  Snackbar
} from "@mui/material";
import axios from "axios";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const NotificacionesClientes = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [encargoDetails, setEncargoDetails] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    // Obtener notificaciones de clientes
    axios.get("http://localhost:3001/notificaciones_cliente")
      .then((response) => {
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

  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAceptar = (notificacion) => {
    const encargoId = notificacion.id;

    if (!encargoId) {
      handleSnackbarOpen("No se encontró un ID de encargo válido para esta notificación.", "error");
      return;
    }

    axios.put(`http://localhost:3001/notificaciones_cliente/${encargoId}`, { estado: 'aceptada' })
      .then(() => {
        // Actualizar el estado del encargo en la tabla pedidosCliente
        return axios.put(`http://localhost:3001/pedidosCliente/${encargoId}`, { estado: 'Aceptado' });
      })
      .then(() => {
        // Opcional: Confirmar el cambio con una nueva notificación
        return axios.post(`http://localhost:3001/notificaciones_cliente`, {
          clienteId: notificacion.clienteId,
          mensaje: `Tu encargo con ID ${encargoId} ha sido aceptado.`,
          estado: 'confirmada'
        });
      })
      .then(() => {
        setNotificaciones(prev => prev.filter(n => n.id !== encargoId));
        handleSnackbarOpen("Notificación aceptada y estado del encargo actualizado a 'Aceptado'.");
      })
      .catch((error) => {
        console.error("Error al aceptar la notificación o actualizar el encargo:", error.response ? error.response.data : error.message);
        handleSnackbarOpen("Hubo un problema al aceptar la notificación o actualizar el encargo.", "error");
      });
  };

  const handleRechazar = (id) => {
    if (!id) {
      handleSnackbarOpen("ID de notificación no válido.", "error");
      return;
    }

    axios.put(`http://localhost:3001/notificaciones_cliente/${id}`, { estado: 'rechazada' })
      .then(() => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
        handleSnackbarOpen("Notificación rechazada con éxito.");
      })
      .catch((error) => {
        console.error("Error al rechazar la notificación:", error.response ? error.response.data : error.message);
        handleSnackbarOpen("Hubo un problema al rechazar la notificación.", "error");
      });
  };

  const handleViewDetails = (notificacion) => {
    const encargoId = notificacion.id;

    if (!encargoId) {
      handleSnackbarOpen("ID de notificación no válido.", "error");
      return;
    }

    // Obtener detalles del encargo usando el `id` del encargo.
    axios.get(`http://localhost:3001/encargosCliente/${encargoId}`)
      .then((response) => {
        setEncargoDetails(response.data);  // Asignar los detalles del encargo
        setSelectedNotificacion(notificacion);  // Guardar la notificación seleccionada
        setOpenDetailsDialog(true);  // Abrir el diálogo de detalles
      })
      .catch((error) => {
        console.error("Error al obtener los detalles del encargo:", error.response ? error.response.data : error.message);
        handleSnackbarOpen("Error al cargar los detalles del encargo.", "error");
      });
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedNotificacion(null);
    setEncargoDetails(null);
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
              <ListItem key={notificacion.id}>
                <ListItemText
                  primary={`Cliente: ${notificacion.clienteId || 'Desconocido'}`}
                  secondary={`Mensaje: ${notificacion.mensaje || 'Desconocido'} - ${new Date(notificacion.fecha).toLocaleDateString() || 'Fecha no disponible'}`}
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
          {encargoDetails ? (
            <Box>
              <Typography variant="h6">Detalles del Encargo:</Typography>
              <Typography>Producto: {encargoDetails.producto || 'Desconocido'}</Typography>
              <Typography>Cantidad: {encargoDetails.cantidad || 'Desconocido'}</Typography>
              <Typography>Estado: {encargoDetails.estado || 'Desconocido'}</Typography>
              <Typography>Fecha: {new Date(encargoDetails.fecha).toLocaleDateString() || 'Desconocido'}</Typography>
              <Typography>Carga: {encargoDetails.carga || 'Desconocido'} kg</Typography>
              <Typography>Lugar: {encargoDetails.lugar || 'Desconocido'}</Typography>
            </Box>
          ) : (
            <Typography>No hay detalles disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon />
          </IconButton>
        }
        ContentProps={{
          sx: {
            backgroundColor: snackbarSeverity === "error" ? "error.main" : "success.main",
          },
        }}
      />
    </Box>
  );
};

export default NotificacionesClientes;
