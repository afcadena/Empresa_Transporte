import React, { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";
import axios from "axios";

const EntregasPendientes = () => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conductorNombre, setConductorNombre] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para controlar el Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Mensaje para el Snackbar

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");

    // Primero obtenemos el camión y el nombre del conductor usando el correo electrónico
    axios.get(`http://localhost:3001/camiones?correo=${userEmail}`)
      .then((response) => {
        const assignedCamion = response.data[0];
        if (assignedCamion) {
          setConductorNombre(assignedCamion.conductor);
        } else {
          setError("No se encontró un camión asignado.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener el camión:", error);
        setError("Error al cargar los datos del camión.");
      });
  }, []);

  useEffect(() => {
    if (conductorNombre) {
      axios.get(`http://localhost:3001/encargos`)
        .then((response) => {
          const entregasTotales = response.data;

          // Verificar si extendedProps existe y tiene conductor
          const entregasFiltradas = entregasTotales.filter(entrega => {
            if (!entrega.extendedProps) {
              console.warn(`Entrega con ID ${entrega.id} no tiene extendedProps.`);
              return false;
            }
            if (!entrega.extendedProps.conductor) {
              console.warn(`Entrega con ID ${entrega.id} no tiene conductor en extendedProps.`);
              return false;
            }
            return entrega.extendedProps.conductor === conductorNombre;
          });

          if (entregasFiltradas.length > 0) {
            setEntregas(entregasFiltradas);
          } else {
            setError("No se encontraron entregas pendientes para este conductor.");
          }
        })
        .catch((error) => {
          console.error("Error al obtener las entregas:", error);
          setError("Error al cargar los datos de entregas.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [conductorNombre]);

  const handleFinalizarClick = (entrega) => {
    setSelectedEntrega(entrega);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEntrega(null);
  };

  const handleConfirmFinalizar = () => {
    if (!selectedEntrega) {
      setSnackbarMessage("No se seleccionó ninguna entrega.");
      setSnackbarOpen(true);
      return;
    }

    axios.post("http://localhost:3001/notificaciones", {
      conductor: conductorNombre,
      encargo: selectedEntrega.title,
      fecha: selectedEntrega.start,
      mensaje: "El conductor ha finalizado el encargo.",
      id: selectedEntrega.id,
    })
    .then(() => {
      setSnackbarMessage("Se ha enviado la notificación al administrador.");
      setSnackbarOpen(true);
      handleCloseDialog();
    })
    .catch((error) => {
      console.error("Error al enviar la notificación:", error);
      setSnackbarMessage("Hubo un problema al enviar la notificación.");
      setSnackbarOpen(true);
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Entregas Pendientes
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha de Inicio</TableCell>
              <TableCell>Fecha de Fin</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Peso de Carga (Kg)</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entregas.map((entrega) => (
              <TableRow key={entrega.id.toString()}>
                <TableCell>{`Entrega de ${entrega.extendedProps?.carga || 'N/A'} Kg`}</TableCell>
                <TableCell>{entrega.start}</TableCell>
                <TableCell>{entrega.end || entrega.start}</TableCell>
                <TableCell>{entrega.extendedProps?.destinacion || 'N/A'}</TableCell>
                <TableCell>{entrega.extendedProps?.carga || 'N/A'}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleFinalizarClick(entrega)}>
                    Finalizar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de confirmación */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Finalización</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que finalizó el encargo "{selectedEntrega?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmFinalizar} color="secondary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default EntregasPendientes;
