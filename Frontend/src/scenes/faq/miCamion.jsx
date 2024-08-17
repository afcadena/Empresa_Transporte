import React, { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Header from "../../components/Header";
import axios from "axios";

const MiCamion = () => {
  const [camion, setCamion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");

    axios.get(`http://localhost:3001/camiones?correo=${userEmail}`)
      .then((response) => {
        const assignedCamion = response.data[0]; // Suponemos que el correo es único y solo devuelve un camión
        if (assignedCamion) {
          setCamion(assignedCamion);
        } else {
          setError("No se encontró un camión asignado.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener el camión:", error);
        setError("Error al cargar los datos del camión.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box m="20px">
      <Header title="Mi Camión" subtitle="Información sobre tu camión asignado" />

      {camion ? (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matrícula</TableCell>
                <TableCell>Capacidad de Carga (Kg)</TableCell>
                <TableCell>Consumo de Gasolina (Galones/Km)</TableCell>
                <TableCell>Carga Actual (Kg)</TableCell>
                <TableCell>Conductor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{camion.matricula}</TableCell>
                <TableCell>{camion.capacidadCargaKg}</TableCell>
                <TableCell>{camion.consumoGasolinaGalonesPorKm}</TableCell>
                <TableCell>{camion.cargaActualKg}</TableCell>
                <TableCell>{camion.conductor}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No se encontró información sobre tu camión.</Typography>
      )}
    </Box>
  );
};

export default MiCamion;
