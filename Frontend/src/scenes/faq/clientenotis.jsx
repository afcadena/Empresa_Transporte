import React, { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";
import axios from "axios";

const ClienteNotifications = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(""); // Estado para manejar mensajes generales

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");

    // Obtener el cliente usando el correo electrónico
    axios.get(`http://localhost:3001/clientes?correo=${userEmail}`)
      .then((response) => {
        const cliente = response.data[0];
        if (cliente) {
          // Obtener las notificaciones relacionadas con el cliente
          axios.get(`http://localhost:3001/notificaciones_cliente?clienteId=${cliente.id}`)
            .then((response) => {
              const notificacionesFiltradas = response.data.filter(noti => noti.estado === 'confirmada');
              setNotificaciones(notificacionesFiltradas);
              if (notificacionesFiltradas.length === 0) {
                setMessage("No hay notificaciones confirmadas."); // Mensaje cuando no hay notificaciones
              }
            })
            .catch((error) => {
              setError("Error al cargar las notificaciones.");
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setError("No se encontró un cliente con ese correo.");
          setLoading(false); // Termina el loading si no hay cliente
        }
      })
      .catch((error) => {
        setError("Error al cargar los datos del cliente.");
        setLoading(false); // Termina el loading en caso de error
      });
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Notificaciones Confirmadas
      </Typography>

      {/* Mostrar error si existe */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Mostrar mensaje si no hay notificaciones */}
      {message && <Typography>{message}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID del Encargo</TableCell>
              <TableCell>Mensaje</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notificaciones.length > 0 ? (
              notificaciones.map((notificacion) => (
                <TableRow key={notificacion.id}>
                  <TableCell>{notificacion.encargoId || 'Desconocido'}</TableCell>
                  <TableCell>{notificacion.mensaje || 'Desconocido'}</TableCell>
                  <TableCell>{notificacion.estado || 'Desconocido'}</TableCell>
                  <TableCell>{new Date(notificacion.fecha).toLocaleString() || 'Desconocido'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No hay notificaciones confirmadas.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClienteNotifications;
