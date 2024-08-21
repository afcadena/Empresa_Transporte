import React, { useState, useEffect } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Header from "../../components/Header";
import axios from "axios";

const CargarCamion = () => {
  const [camiones, setCamiones] = useState([]);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [openSelectCamion, setOpenSelectCamion] = useState(true); // Diálogo de selección de camión
  const [openSetCarga, setOpenSetCarga] = useState(false); // Diálogo de entrada de carga
  const [openConfirmDownload, setOpenConfirmDownload] = useState(false); // Diálogo de confirmación de descarga
  const [carga, setCarga] = useState("");
  const [camionToReset, setCamionToReset] = useState(null); // Camión que se desea restablecer

  useEffect(() => {
    axios.get("http://localhost:3001/camiones")
      .then((response) => {
        setCamiones(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los camiones:", error);
      });
  }, []);

  const handleSelectCamion = (camion) => {
    setSelectedCamion(camion);
    setCarga(camion.cargaActualKg); // Inicializar la carga con la carga actual del camión
    setOpenSelectCamion(false);
    setOpenSetCarga(true);
  };

  const handleSetCarga = () => {
    const capacidadRestante = selectedCamion.capacidadCargaKg;
    if (parseInt(carga, 10) > capacidadRestante) {
      alert("La carga excede la capacidad del camión.");
      return;
    }

    const nuevoCamion = {
      ...selectedCamion,
      cargaActualKg: parseInt(carga, 10),
    };

    axios.put(`http://localhost:3001/camiones/${selectedCamion.id}`, nuevoCamion)
      .then(() => {
        setCamiones((prev) => prev.map((camion) => 
          camion.id === selectedCamion.id ? nuevoCamion : camion
        ));
        setOpenSetCarga(false);
        setSelectedCamion(null);
      })
      .catch((error) => {
        console.error("Error al actualizar la carga:", error);
      });
  };

  const handleResetCarga = (camion) => {
    setCamionToReset(camion);
    setOpenConfirmDownload(true);
  };

  const confirmResetCarga = () => {
    const camionReset = {
      ...camionToReset,
      cargaActualKg: 0, // Restablecer la carga a cero
    };

    axios.put(`http://localhost:3001/camiones/${camionToReset.id}`, camionReset)
      .then(() => {
        setCamiones((prev) => prev.map((c) =>
          c.id === camionToReset.id ? camionReset : c
        ));
        setOpenConfirmDownload(false);
        setCamionToReset(null);
      })
      .catch((error) => {
        console.error("Error al restablecer la carga:", error);
      });
  };

  const cancelResetCarga = () => {
    setOpenConfirmDownload(false);
    setCamionToReset(null);
  };

  const handleAddCamion = () => {
    setOpenSelectCamion(true);
  };

  return (
    <Box m="20px">
      <Header title="Cargar Camión" subtitle="Seleccione un camión para realizar la carga" />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Button variant="contained" color="primary" onClick={handleAddCamion}>
         Cargar camiones
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matrícula</TableCell>
              <TableCell>Capacidad de Carga (Kg)</TableCell>
              <TableCell>Carga Actual (Kg)</TableCell>
              <TableCell>Conductor</TableCell>
              <TableCell>Correo del Conductor</TableCell>
              <TableCell>Acciones</TableCell> {/* Añadido para el botón de descarga */}
            </TableRow>
          </TableHead>
          <TableBody>
            {camiones.map((camion) => (
              <TableRow key={camion.id}>
                <TableCell>{camion.matricula}</TableCell>
                <TableCell>{camion.capacidadCargaKg}</TableCell>
                <TableCell>{camion.cargaActualKg}</TableCell>
                <TableCell>{camion.conductor}</TableCell>
                <TableCell>{camion.correo}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleResetCarga(camion)}
                  >
                    Descargar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openSelectCamion} onClose={() => setOpenSelectCamion(false)}>
        <DialogTitle>Elija un camión para realizar la carga</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Capacidad de Carga (Kg)</TableCell>
                  <TableCell>Carga Actual (Kg)</TableCell>
                  <TableCell>Conductor</TableCell>
                  <TableCell>Correo del Conductor</TableCell>
                  <TableCell>Seleccionar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {camiones.map((camion) => (
                  <TableRow key={camion.id}>
                    <TableCell>{camion.matricula}</TableCell>
                    <TableCell>{camion.capacidadCargaKg}</TableCell>
                    <TableCell>{camion.cargaActualKg}</TableCell>
                    <TableCell>{camion.conductor}</TableCell>
                    <TableCell>{camion.correo}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSelectCamion(camion)}
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog open={openSetCarga} onClose={() => setOpenSetCarga(false)}>
        <DialogTitle>Ingrese la capacidad de carga</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Capacidad de Carga (Kg)"
            type="number"
            fullWidth
            value={carga}
            onChange={(e) => setCarga(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSetCarga(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSetCarga} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDownload} onClose={cancelResetCarga}>
        <DialogTitle>Confirmar Descarga</DialogTitle>
        <DialogContent>
          ¿Está seguro de que desea descargar este camión?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelResetCarga} color="primary">
            No
          </Button>
          <Button onClick={confirmResetCarga} color="primary">
            Sí
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CargarCamion;
