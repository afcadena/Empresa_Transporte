import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../Theme";
import axios from "axios";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formValues, setFormValues] = useState({
    carga: "",
    destinacion: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [camiones, setCamiones] = useState([]);
  const [mejorCamion, setMejorCamion] = useState(null);
  const [openEventDetails, setOpenEventDetails] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [message, setMessage] = useState(""); // Nuevo estado para manejar mensajes de éxito/error

  useEffect(() => {
    axios
      .get("http://localhost:3001/camiones")
      .then((response) => {
        setCamiones(response.data);
      })
      .catch((error) => console.error("Error al obtener los camiones:", error));

    axios
      .get("http://localhost:3001/encargos")
      .then((response) => {
        setCurrentEvents(response.data.map(event => ({
          ...event,
          start: event.start,
          id: event.id || generateNumericId(),  // Generar un ID numérico
        })));
      })
      .catch((error) => console.error("Error al obtener los encargos:", error));
  }, []);

  const generateNumericId = () => {
    return Math.floor(Math.random() * 10000000000000).toString(); // Genera un número grande como string
  };

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    setMejorCamion(getBestCamion());
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedDate(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const getBestCamion = () => {
    const cargaNecesaria = parseFloat(formValues.carga);

    const camionesFiltrados = camiones.filter((camion) => {
      const capacidadRestante = camion.capacidadCargaKg - camion.cargaActualKg;
      return capacidadRestante >= cargaNecesaria;
    });

    if (camionesFiltrados.length === 0) {
      return null;
    }

    const mejorCamion = camionesFiltrados.sort((a, b) => {
      const capacidadRestanteA = a.capacidadCargaKg - a.cargaActualKg;
      const capacidadRestanteB = b.capacidadCargaKg - b.cargaActualKg;

      if (capacidadRestanteA === capacidadRestanteB) {
        return a.consumoGasolinaGalonesPorKm - b.consumoGasolinaGalonesPorKm;
      }
      return capacidadRestanteA - capacidadRestanteB;
    })[0];

    return mejorCamion;
  };

  const handleSaveEncargo = () => {
    const camionSeleccionado = getBestCamion();

    if (!camionSeleccionado) {
      setMessage("No hay camiones disponibles para esta carga."); // Reemplazo de alert
      return;
    }

    const newEvent = {
      id: generateNumericId(),  // Generar un ID numérico
      title: `Encargo de ${camionSeleccionado.conductor} - ${formValues.carga} Kg`,
      start: selectedDate.startStr,
      allDay: selectedDate.allDay,
      extendedProps: {
        conductor: camionSeleccionado.conductor,
        camion: camionSeleccionado.matricula,
        carga: formValues.carga,
        destinacion: formValues.destinacion,
        start: selectedDate.startStr,
      },
    };

    axios
      .post("http://localhost:3001/encargos", newEvent)
      .then((response) => {
        setCurrentEvents([...currentEvents, response.data]);

        const nuevaCarga = parseFloat(camionSeleccionado.cargaActualKg) + parseFloat(formValues.carga);
        const camionActualizado = {
          ...camionSeleccionado,
          cargaActualKg: nuevaCarga,
        };

        return axios.put(`http://localhost:3001/camiones/${camionSeleccionado.id}`, camionActualizado);
      })
      .then(() => {
        setMessage(`El camión ${camionSeleccionado.matricula} ha sido cargado con ${formValues.carga} Kg.`); // Reemplazo de alert
        handleCloseForm();
      })
      .catch((error) => {
        console.error("Error al guardar el encargo o actualizar la carga:", error);
      });
  };

  const handleEventClick = (selected) => {
    setEventDetails({
      id: selected.event.id,
      ...selected.event.extendedProps,
    });
    setOpenEventDetails(true);
  };

  const handleDeleteEvent = () => {
    if (!eventDetails?.id) {
      setMessage("No se pudo obtener el ID del encargo."); // Reemplazo de alert
      return;
    }

    axios
      .delete(`http://localhost:3001/encargos/${eventDetails.id}`)
      .then(() => {
        const updatedEvents = currentEvents.filter(event => event.id !== eventDetails.id);
        setCurrentEvents(updatedEvents);
        removeEventFromCalendar(eventDetails.camion);
        handleCloseEventDetails();
      })
      .catch((error) => console.error("Error al eliminar el encargo:", error));
  };

  const handleEditEvent = () => {
    if (!eventDetails?.id) {
      setMessage("No se pudo obtener el ID del encargo."); // Reemplazo de alert
      return;
    }

    axios
      .put(`http://localhost:3001/encargos/${eventDetails.id}`, {
        ...eventDetails,
        carga: formValues.carga,
        destinacion: formValues.destinacion,
      })
      .then(() => {
        const updatedEvents = currentEvents.map(event =>
          event.id === eventDetails.id
            ? { ...event, extendedProps: { ...event.extendedProps, carga: formValues.carga, destinacion: formValues.destinacion } }
            : event
        );
        setCurrentEvents(updatedEvents);
        handleCloseEventDetails();
      })
      .catch((error) => console.error("Error al editar el encargo:", error));
  };

  const handleCloseEventDetails = () => {
    setOpenEventDetails(false);
  };

  const removeEventFromCalendar = (matricula) => {
    axios.get("http://localhost:3001/encargos")
      .then((response) => {
        const eventToRemove = response.data.find(event => event.extendedProps.camion === matricula);
        if (eventToRemove) {
          return axios.delete(`http://localhost:3001/encargos/${eventToRemove.id}`);
        }
      })
      .then(() => {
        setCurrentEvents(prevEvents => prevEvents.filter(event => event.extendedProps.camion !== matricula));
        setMessage(`Evento relacionado con el camión ${matricula} ha sido eliminado del calendario.`); // Reemplazo de alert
      })
      .catch((error) => {
        console.error("Error al eliminar el evento del calendario:", error);
      });
  };

  return (
    <Box m="20px">
      <Header title="Calendario" subtitle="Calendario de cargas y descargas de camiones" />

      {/* Mostrar mensaje general */}
      {message && <Typography style={{ color: message.includes("error") ? 'red' : 'green' }}>{message}</Typography>}

      <Box display="flex" justifyContent="space-between">
        <Box flex="1 1 20%" backgroundColor={colors.primary[400]} p="15px" borderRadius="4px">
          <Typography variant="h5">Eventos</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{ backgroundColor: colors.greenAccent[500], margin: "10px 0", borderRadius: "2px" }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start, { year: "numeric", month: "short", day: "numeric" })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            events={currentEvents}
            eventClick={handleEventClick}
          />
        </Box>
      </Box>

      {/* Formulario para registrar encargo */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>Registrar Encargo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="filled"
            label="Carga (Kg)"
            name="carga"
            value={formValues.carga}
            onChange={handleFormChange}
            margin="dense"
          />
          <TextField
            fullWidth
            variant="filled"
            label="Lugar de Destinación"
            name="destinacion"
            value={formValues.destinacion}
            onChange={handleFormChange}
            margin="dense"
          />

          {mejorCamion && (
            <Typography variant="h6" mt="15px">
              Mejor Camión: {mejorCamion.matricula} (Conductor: {mejorCamion.conductor})
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancelar</Button>
          <Button onClick={handleSaveEncargo}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Detalles del evento */}
      <Dialog open={openEventDetails} onClose={handleCloseEventDetails}>
        <DialogTitle>Detalles del Encargo</DialogTitle>
        <DialogContent>
          {eventDetails && (
            <Box>
              <Typography variant="h6">Título: {eventDetails.title}</Typography>
              <Typography>Conductor: {eventDetails.conductor}</Typography>
              <Typography>Camión: {eventDetails.camion}</Typography>
              <Typography>Carga: {eventDetails.carga} Kg</Typography>
              <Typography>Destinación: {eventDetails.destinacion}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteEvent} color="error">Eliminar</Button>
          <Button onClick={handleEditEvent} color="primary">Editar</Button>
          <Button onClick={handleCloseEventDetails}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
