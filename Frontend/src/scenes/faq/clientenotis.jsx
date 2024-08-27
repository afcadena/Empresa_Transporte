import React, { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";
import axios from "axios";

const ClienteNotifications = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener el correo electrónico del usuario desde el almacenamiento local
    const userEmail = localStorage.getItem("userEmail");

    // Asegúrate de que el correo electrónico esté disponible
    if (userEmail) {
      // Obtener el cliente usando el correo electrónico
      axios.get(`http://localhost:3001/clientes?correo=${userEmail}`)
        .then((response) => {
          const cliente = response.data[0];
          if (cliente) {
            // Obtener las notificaciones relacionadas con el cliente
            axios.get(`http://localhost:3001/notificaciones?clienteId=${cliente.id}`)
              .then((response) => {
                setNotificaciones(response.data);
              })
              .catch((error) => {
                console.error("Error al obtener las notificaciones:", error);
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
          console.error("Error al obtener los datos del cliente:", error);
          setError("Error al cargar los datos del cliente.");
          setLoading(false); // Termina el loading en caso de error
        });
    } else {
      setError("No se encontró un correo electrónico del usuario.");
      setLoading(false); // Termina el loading si no hay correo electrónico
    }
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Notificaciones del Cliente
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID del Pedido</TableCell>
              <TableCell>Mensaje</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notificaciones.length > 0 ? (
              notificaciones.map((notificacion) => (
                <TableRow key={notificacion.id}>
                  <TableCell>{notificacion.id}</TableCell>
                  <TableCell>{notificacion.mensaje}</TableCell>
                  <TableCell>{notificacion.estado}</TableCell>
                  <TableCell>{new Date(notificacion.fecha).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No hay notificaciones.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClienteNotifications;
