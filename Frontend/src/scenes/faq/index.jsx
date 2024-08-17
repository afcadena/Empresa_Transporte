import React, { useState, useEffect } from "react";
import { Box, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../Theme";
import axios from "axios";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [camiones, setCamiones] = useState([]);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [camionToDelete, setCamionToDelete] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3001/camiones")
      .then((response) => {
        setCamiones(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los camiones:", error);
      });
  }, []);

  const handleClickOpen = (camion) => {
    setSelectedCamion(camion);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCamion(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCamion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!selectedCamion || !selectedCamion.id) {
      console.error("Error: El camión seleccionado no tiene un ID válido.");
      return;
    }

    axios.put(`http://localhost:3001/camiones/${selectedCamion.id}`, selectedCamion)
      .then((response) => {
        setCamiones((prev) => prev.map((camion) => 
          camion.id === selectedCamion.id ? response.data : camion
        ));
        handleClose();
      })
      .catch((error) => {
        console.error("Error al guardar los cambios:", error);
        if (error.response) {
          console.error("Datos de error:", error.response.data);
        }
      });
  };

  const handleDeleteConfirmation = (camion) => {
    setCamionToDelete(camion);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setCamionToDelete(null);
  };

  const handleDelete = () => {
    axios.delete(`http://localhost:3001/camiones/${camionToDelete.id}`)
      .then(() => {
        setCamiones((prev) => prev.filter((camion) => camion.id !== camionToDelete.id));
        handleConfirmClose();
      })
      .catch((error) => {
        console.error("Error al eliminar el camión:", error);
      });
  };

  return (
    <Box m="20px">
      <Header title="Camiones" subtitle="Lista de todos los camiones registrados" />

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ color: colors.greenAccent[500] }}>Matrícula</TableCell>
              <TableCell style={{ color: colors.greenAccent[500] }}>Capacidad de Carga (Kg)</TableCell>
              <TableCell style={{ color: colors.greenAccent[500] }}>Consumo de Gasolina (Galones/Km)</TableCell>
              <TableCell style={{ color: colors.greenAccent[500] }}>Carga Actual (Kg)</TableCell>
              <TableCell style={{ color: colors.greenAccent[500] }}>Conductor</TableCell>
              <TableCell style={{ color: colors.greenAccent[500] }}>Correo del Conductor</TableCell>
              <TableCell style={{ color: colors.greenAccent[500] }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {camiones.map((camion) => (
              <TableRow key={camion.id}>
                <TableCell>{camion.matricula}</TableCell>
                <TableCell>{camion.capacidadCargaKg}</TableCell>
                <TableCell>{camion.consumoGasolinaGalonesPorKm}</TableCell>
                <TableCell>{camion.cargaActualKg}</TableCell>
                <TableCell>{camion.conductor}</TableCell>
                <TableCell>{camion.correo}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleClickOpen(camion)}
                    sx={{ marginRight: "10px" }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#E52647", color: "#fff" }}
                    onClick={() => handleDeleteConfirmation(camion)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Editar Camión</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Matrícula"
            type="text"
            fullWidth
            name="matricula"
            value={selectedCamion?.matricula || ''}
            InputProps={{
              readOnly: true,
            }} // Campo no editable
          />
          <TextField
            margin="dense"
            label="Capacidad de Carga (Kg)"
            type="number"
            fullWidth
            name="capacidadCargaKg"
            value={selectedCamion?.capacidadCargaKg || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Consumo de Gasolina (Galones/Km)"
            type="number"
            fullWidth
            name="consumoGasolinaGalonesPorKm"
            value={selectedCamion?.consumoGasolinaGalonesPorKm || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Carga Actual (Kg)"
            type="number"
            fullWidth
            name="cargaActualKg"
            value={selectedCamion?.cargaActualKg || ''}
            InputProps={{
              readOnly: true,
            }} // Campo no editable
          />
          <TextField
            margin="dense"
            label="Conductor"
            type="text"
            fullWidth
            name="conductor"
            value={selectedCamion?.conductor || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Correo del Conductor"
            type="email"
            fullWidth
            name="correo"
            value={selectedCamion?.correo || ''}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Box>
            ¿Estás seguro de que deseas eliminar el camión con matrícula {camionToDelete?.matricula}?
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} sx={{ backgroundColor: "#E52647", color: "#fff" }}>
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQ;
