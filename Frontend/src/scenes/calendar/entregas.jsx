import React, { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import axios from "axios";

const EntregasPendientes = () => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conductorNombre, setConductorNombre] = useState(null); // Almacenamos el nombre del conductor
  const [openDialog, setOpenDialog] = useState(false); // Estado para abrir el diálogo de confirmación
  const [selectedEntrega, setSelectedEntrega] = useState(null); // Entrega seleccionada para finalizar

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");

    // Primero obtenemos el camión y el nombre del conductor usando el correo electrónico
    axios.get(`http://localhost:3001/camiones?correo=${userEmail}`)
      .then((response) => {
        const assignedCamion = response.data[0]; // Suponemos que el correo es único y devuelve un camión
        if (assignedCamion) {
          setConductorNombre(assignedCamion.conductor); // Guardamos el nombre del conductor
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
    // Una vez que tengamos el nombre del conductor, hacemos la llamada para obtener las entregas
    if (conductorNombre) {
      axios.get(`http://localhost:3001/encargos`)
        .then((response) => {
          const entregasTotales = response.data; // Asumimos que la API devuelve todas las entregas
          // Filtramos por el nombre del conductor obtenido del camión
          const entregasFiltradas = entregasTotales.filter(entrega => entrega.extendedProps.conductor === conductorNombre); 
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
    setOpenDialog(true); // Abrir el diálogo de confirmación
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEntrega(null);
  };

  const handleConfirmFinalizar = () => {
    if (!selectedEntrega) {
      alert("No se seleccionó ninguna entrega.");
      return;
    }

    // Enviar la notificación al administrador con el ID del encargo seleccionado
    axios.post("http://localhost:3001/notificaciones", {
      conductor: conductorNombre,
      encargo: selectedEntrega.title,
      fecha: selectedEntrega.start,
      mensaje: "El conductor ha finalizado el encargo.",
      id: selectedEntrega.id, // Usamos el ID del encargo como ID de la notificación
    })
    .then(() => {
      alert("Se ha enviado la notificación al administrador.");
      handleCloseDialog();
    })
    .catch((error) => {
      console.error("Error al enviar la notificación:", error);
      alert("Hubo un problema al enviar la notificación.");
    });
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
                <TableCell>{`Entrega de ${entrega.extendedProps.carga} Kg`}</TableCell>
                <TableCell>{entrega.start}</TableCell>
                <TableCell>{entrega.end || entrega.start}</TableCell>
                <TableCell>{entrega.extendedProps.destinacion}</TableCell>
                <TableCell>{entrega.extendedProps.carga}</TableCell>
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
    </Box>
  );
};

export default EntregasPendientes;
