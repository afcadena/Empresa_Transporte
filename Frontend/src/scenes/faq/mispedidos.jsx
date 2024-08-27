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
    lugar: '',
  });
  const [mensajeError, setMensajeError] = useState('');
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const clienteId = localStorage.getItem('userId');

  useEffect(() => {
    if (!clienteId) {
      setError('ID de cliente no encontrado en localStorage');
      return;
    }

    const fetchPedidos = async () => {
      try {
        // Obtener pedidos del cliente
        const pedidosResponse = await axios.get(`http://localhost:3001/pedidosCliente?clienteId=${clienteId}`);
        const pedidosData = pedidosResponse.data;

        // Obtener encargos del cliente
        const encargosResponse = await axios.get(`http://localhost:3001/encargosCliente?clienteId=${clienteId}`);
        const encargosData = encargosResponse.data;

        // Combinar datos de pedidos y encargos
        const encargosConEstado = encargosData.map(encargo => {
          const pedido = pedidosData.find(p => p.id === encargo.id);
          return {
            ...encargo,
            estado: pedido ? pedido.estado : encargo.estado || 'Desconocido'
          };
        });

        setPedidos(encargosConEstado);
        setClienteNombre(''); // Asigna aquí el nombre del cliente si es necesario
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
      const newId = Date.now().toString();
      const newPedido = { ...nuevoPedido, clienteId, id: newId, fecha: new Date().toISOString() };

      await axios.post('http://localhost:3001/pedidosCliente', newPedido);
      await axios.post('http://localhost:3001/encargosCliente', newPedido);

      await axios.post('http://localhost:3001/notificaciones_cliente', {
        id: newId,
        clienteId,
        mensaje: `Tu pedido con ID ${newId} ha sido enviado.`,
        estado: 'enviado',
        fecha: new Date().toISOString(),
      });

      setShowNotificationDialog(true);

      setPedidos((prevPedidos) => [...prevPedidos, newPedido]);

      handleCloseDialog();
      setNuevoPedido({
        producto: '',
        cantidad: 0,
        estado: 'Pendiente',
        carga: 0,
        lugar: '',
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
              <TableCell>Lugar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.producto || 'No disponible'}</TableCell>
                <TableCell>{pedido.cantidad || 'No disponible'}</TableCell>
                <TableCell>{pedido.estado}</TableCell>
                <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{pedido.carga || 'No disponible'}</TableCell>
                <TableCell>{pedido.lugar || 'No disponible'}</TableCell>
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
          <Typography>La notificación al cliente ha sido enviada con éxito.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotificationDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MisPedidos;
