import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';

const Cuenta = () => {
  const [clienteData, setClienteData] = useState({
    id: '',
    nombre: '',
    correo: '',
    contraseña: '',
  });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [inputValues, setInputValues] = useState(clienteData);

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        const correo = localStorage.getItem('userEmail');
        if (!correo) throw new Error('Correo no encontrado en localStorage');

        const response = await axios.get('http://localhost:3001/clientes');  // Obtener todos los clientes
        console.log('Respuesta del servidor:', response);  // Para depuración

        // Buscar el cliente con el correo proporcionado
        const cliente = response.data.find(cliente => cliente.correo === correo);
        if (!cliente) throw new Error('No se encontraron datos para el correo');

        setClienteData({
          id: cliente.id,
          nombre: cliente.nombre,
          correo: cliente.correo,
          contraseña: cliente.contraseña,
        });
        setInputValues({
          id: cliente.id,
          nombre: cliente.nombre,
          correo: cliente.correo,
          contraseña: cliente.contraseña,
        });
      } catch (error) {
        console.error('Error al obtener los datos del cliente:', error.message);
        setError('Error al cargar los datos.');
      }
    };

    fetchClienteData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/clientes/${inputValues.id}`, inputValues);
      setClienteData(inputValues);
      setIsEditing(false);
      setError('');  // Limpia el mensaje de error
    } catch (error) {
      console.error('Error al actualizar los datos del cliente:', error.message);
      setError('Error al guardar los datos.');
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Mi Cuenta
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box mt={2}>
        <TextField
          label="Nombre"
          name="nombre"
          value={inputValues.nombre}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          disabled={!isEditing}
        />
        <TextField
          label="Correo"
          name="correo"
          value={inputValues.correo}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          disabled={!isEditing}
        />
        <TextField
          label="Contraseña"
          name="contraseña"
          type="password"
          value={inputValues.contraseña}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          disabled={!isEditing}
        />
        {isEditing ? (
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Guardar
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)} sx={{ ml: 2 }}>
              Cancelar
            </Button>
          </Box>
        ) : (
          <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Cuenta;
