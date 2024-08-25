import React, { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress } from "@mui/material";
import axios from "axios";

const ConductorNotifications = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");

    // Obtener el camión del conductor usando el correo electrónico
    axios.get(`http://localhost:3001/camiones?correo=${userEmail}`)
      .then((response) => {
        const assignedCamion = response.data[0];
        if (assignedCamion) {
          // Obtener las notificaciones relacionadas con el conductor
          axios.get(`http://localhost:3001/notificaciones?conductor=${assignedCamion.conductor}`)
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
          setError("No se encontró un camión asignado.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener el camión:", error);
        setError("Error al cargar los datos del camión.");
      });
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
        Notificaciones
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Conductor</TableCell>
              <TableCell>Encargo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Mensaje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notificaciones.length > 0 ? (
              notificaciones.map((notificacion) => (
                <TableRow key={notificacion.id}>
                  <TableCell>{notificacion.conductor}</TableCell>
                  <TableCell>{notificacion.encargo}</TableCell>
                  <TableCell>{notificacion.fecha}</TableCell>
                  <TableCell>{notificacion.mensaje}</TableCell>
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

export default ConductorNotifications;
