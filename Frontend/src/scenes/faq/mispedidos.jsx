import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert
} from '@mui/material';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [nuevoPedido, setNuevoPedido] = useState({
    producto: '',
    cantidad: 0,
    estado: 'Pendiente',
    carga: 0,
    lugar: '',  // Nuevo campo para el lugar
  });
  const [mensajeError, setMensajeError] = useState('');
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [clienteNombre, setClienteNombre] = useState(''); // Para almacenar el nombre del cliente
  const clienteId = localStorage.getItem('userId'); // Recupera el ID del cliente desde el localStorage

  useEffect(() => {
    if (!clienteId) {
      setError('ID de cliente no encontrado en localStorage');
      return;
    }

    const fetchPedidos = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/pedidosCliente?clienteId=${clienteId}`);
        setPedidos(response.data);
      } catch (error) {
        setError('Error al cargar los pedidos.');
      }
    };

    const fetchCliente = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/clientes/${clienteId}`);
        setClienteNombre(response.data.nombre); // Almacenar el nombre del cliente
      } catch (error) {
        setError('Error al cargar los detalles del cliente.');
      }
    };

    fetchPedidos();
    fetchCliente(); // Obtener el nombre del cliente
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

      // Enviar el pedido a la tabla de pedidosCliente
      await axios.post('http://localhost:3001/pedidosCliente', newPedido);

      // Agregar el pedido a la tabla de encargosCliente
      await axios.post('http://localhost:3001/encargosCliente', newPedido);

      // Enviar notificación al cliente
      await axios.post('http://localhost:3001/notificaciones_cliente', {
        id: newId,
        clienteId,
        mensaje: `Tu pedido con ID ${newId} ha sido enviado.`,
        estado: 'enviado',
        fecha: new Date().toISOString(),
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
        lugar: '',  // Limpiar el campo lugar
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
              <TableCell>Lugar</TableCell>  {/* Nueva columna para Lugar */}
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
                <TableCell>{pedido.lugar}</TableCell> {/* Mostrar el lugar */}
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
            label="Carga (kg)"
            name="carga"
            type="number"
            value={nuevoPedido.carga}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Lugar"
            name="lugar"
            value={nuevoPedido.lugar}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          /> {/* Campo añadido para el lugar */}
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
          <Typography>La notificación al cliente ha sido enviada con éxito.</Typography>
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
