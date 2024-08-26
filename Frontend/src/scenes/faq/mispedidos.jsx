import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [nuevoPedido, setNuevoPedido] = useState({
    producto: '',
    cantidad: 0,
    estado: 'Pendiente',
    carga: 0,
  });
  const [mensajeError, setMensajeError] = useState('');
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const clienteId = localStorage.getItem('userId'); // Recupera el ID del cliente desde el localStorage

  useEffect(() => {
    if (!clienteId) {
      setError('ID de cliente no encontrado en localStorage');
      return;
    }

    const fetchPedidos = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/pedidos?clienteId=${clienteId}`);
        setPedidos(response.data);
      } catch (error) {
        setError('Error al cargar los pedidos.');
      }
    };

    fetchPedidos();
  }, [clienteId]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoPedido((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddPedido = async () => {
    if (!clienteId) {
      setMensajeError('ID de cliente no encontrado.');
      return;
    }

    try {
      // Generar un ID único para el pedido (puedes ajustar el método según tus necesidades)
      const newId = Date.now().toString();

      const newPedido = { ...nuevoPedido, clienteId, id: newId, fecha: new Date().toISOString() };

      // Enviar el pedido a la tabla de pedidos
      await axios.post('http://localhost:3001/pedidos', newPedido);

      // Agregar el pedido a la tabla de encargos
      await axios.post('http://localhost:3001/encargos', newPedido);

      // Enviar notificación al administrador
      await axios.post('http://localhost:3001/notificaciones', {
        id: newId,
        mensaje: `Nuevo pedido con ID ${newId} realizado por el cliente ${clienteId}.`,
        estado: 'pendiente',
      });

      // Mostrar ventana emergente de confirmación
      setShowNotificationDialog(true);

      // Actualizar la lista de pedidos
      setPedidos((prevPedidos) => [...prevPedidos, newPedido]);

      // Cerrar el diálogo de nuevo pedido
      handleCloseDialog();
      setNuevoPedido({
        producto: '',
        cantidad: 0,
        estado: 'Pendiente',
        carga: 0,
      });
      setMensajeError('');
    } catch (error) {
      setMensajeError('Error al agregar el pedido.');
    }
  };

  const handleCloseNotificationDialog = () => {
    setShowNotificationDialog(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Mis Pedidos
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {mensajeError && <Alert severity="error">{mensajeError}</Alert>}
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        Hacer un Pedido
      </Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Carga</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.producto}</TableCell>
                <TableCell>{pedido.cantidad}</TableCell>
                <TableCell>{pedido.estado}</TableCell>
                <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{pedido.carga}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Hacer un Pedido</DialogTitle>
        <DialogContent>
          <TextField
            label="Producto"
            name="producto"
            value={nuevoPedido.producto}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cantidad"
            name="cantidad"
            type="number"
            value={nuevoPedido.cantidad}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Carga"
            name="carga"
            type="number"
            value={nuevoPedido.carga}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddPedido} color="primary">
            Agregar Pedido
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showNotificationDialog} onClose={handleCloseNotificationDialog}>
        <DialogTitle>Notificación Enviada</DialogTitle>
        <DialogContent>
          <Typography>La notificación al administrador ha sido enviada con éxito.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotificationDialog} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MisPedidos;
