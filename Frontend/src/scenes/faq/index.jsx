import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../Theme";
import axios from "axios";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [camiones, setCamiones] = useState([]);
  const [filteredCamiones, setFilteredCamiones] = useState([]);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [camionToDelete, setCamionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3001/camiones")
      .then((response) => {
        setCamiones(response.data);
        setFilteredCamiones(response.data); // Inicialmente, filtrar todos los camiones
      })
      .catch((error) => {
        console.error("Error al obtener los camiones:", error);
      });
  }, []);

  useEffect(() => {
    // Filtrar camiones según el término de búsqueda
    setFilteredCamiones(
      camiones.filter(camion =>
        camion.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, camiones]);

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
    if (!camionToDelete || !camionToDelete.id) {
      console.error("Error: El camión a eliminar no tiene un ID válido.");
      return;
    }

    axios.delete(`http://localhost:3001/camiones/${camionToDelete.id}`)
      .then(() => {
        setCamiones((prev) => prev.filter((camion) => camion.id !== camionToDelete.id));
        handleConfirmClose();
      })
      .catch((error) => {
        console.error("Error al eliminar el camión:", error);
        if (error.response) {
          console.error("Respuesta del servidor:", error.response);
          alert(`Error al eliminar el camión: ${error.response.statusText}`);
          console.log("Datos completos de la respuesta:", error.response.data);
        } else if (error.request) {
          console.error("Sin respuesta del servidor:", error.request);
          alert("Error: No se recibió respuesta del servidor. Verifica la conexión.");
        } else {
          console.error("Error durante la configuración de la solicitud:", error.message);
          alert(`Error: ${error.message}`);
        }
      });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box m="20px">
      <Header title="Camiones" subtitle="Lista de todos los camiones registrados" />
      
      <TextField
        label="Buscar por matrícula"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearchChange}
      />

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
            {filteredCamiones.map((camion) => (
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
                    disabled={camion.cargaActualKg > 0} // Desactivar si la carga actual es mayor a 0
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#E52647", color: "#fff" }}
                    onClick={() => handleDeleteConfirmation(camion)}
                    disabled={camion.cargaActualKg > 0} // Desactivar si la carga actual es mayor a 0
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
            disabled={selectedCamion?.cargaActualKg > 0} // Desactivar si la carga actual es mayor a 0
          />
          <TextField
            margin="dense"
            label="Consumo de Gasolina (Galones/Km)"
            type="number"
            fullWidth
            name="consumoGasolinaGalonesPorKm"
            value={selectedCamion?.consumoGasolinaGalonesPorKm || ''}
            onChange={handleChange}
            disabled={selectedCamion?.cargaActualKg > 0} // Desactivar si la carga actual es mayor a 0
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
            disabled={selectedCamion?.cargaActualKg > 0} // Desactivar si la carga actual es mayor a 0
          />
          <TextField
            margin="dense"
            label="Correo del Conductor"
            type="email"
            fullWidth
            name="correo"
            value={selectedCamion?.correo || ''}
            onChange={handleChange}
            disabled={selectedCamion?.cargaActualKg > 0} // Desactivar si la carga actual es mayor a 0
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <p>¿Estás seguro de que deseas eliminar este camión?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancelar</Button>
          <Button onClick={handleDelete} color="primary">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQ;
