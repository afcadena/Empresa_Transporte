import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
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

  useEffect(() => {
    axios
      .get("http://localhost:3001/camiones")
      .then((response) => {
        setCamiones(response.data);
      })
      .catch((error) => console.error("Error al obtener los camiones:", error));

    // Cargar los encargos existentes
    axios
      .get("http://localhost:3001/encargos")
      .then((response) => {
        setCurrentEvents(response.data.map(event => ({
          ...event,
          start: event.start,
        })));
      })
      .catch((error) => console.error("Error al obtener los encargos:", error));
  }, []);

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
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
      alert("No hay camiones disponibles para esta carga.");
      return;
    }

    const newEvent = {
      id: `${selectedDate.dateStr}-${camionSeleccionado.matricula}`,
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
        // Actualiza la lista de eventos después de guardar
        setCurrentEvents([...currentEvents, response.data]);
        handleCloseForm();
      })
      .catch((error) => console.error("Error al guardar el encargo:", error));
  };

  const handleEventClick = (selected) => {
    setEventDetails(selected.event.extendedProps);
    setOpenEventDetails(true);
  };

  const handleDeleteEvent = () => {
    axios
      .delete(`http://localhost:3001/encargos/${eventDetails.id}`)
      .then(() => {
        // Actualiza la lista de eventos después de eliminar
        const updatedEvents = currentEvents.filter(event => event.id !== eventDetails.id);
        setCurrentEvents(updatedEvents);
        handleCloseEventDetails();
      })
      .catch((error) => console.error("Error al eliminar el encargo:", error));
  };

  const handleEditEvent = () => {
    axios
      .put(`http://localhost:3001/encargos/${eventDetails.id}`, {
        ...eventDetails,
        carga: formValues.carga,
        destinacion: formValues.destinacion,
      })
      .then(() => {
        // Actualiza la lista de eventos después de editar
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

  return (
    <Box m="20px">
      <Header title="Calendario" subtitle="Calendario de cargas y descargas de camiones" />

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
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
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
            <Typography variant="h6" sx={{ marginTop: 2 }}>
              Mejor Camión Seleccionado: {mejorCamion.matricula} (Conductor: {mejorCamion.conductor})
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">Cancelar</Button>
          <Button onClick={handleSaveEncargo} color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEventDetails} onClose={handleCloseEventDetails}>
        <DialogTitle>Detalles del Evento</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Camión: {eventDetails?.camion}</Typography>
          <Typography variant="h6">Conductor: {eventDetails?.conductor}</Typography>
          <Typography variant="h6">Carga: {eventDetails?.carga} Kg</Typography>
          <Typography variant="h6">Lugar de Destinación: {eventDetails?.destinacion}</Typography>
          <Typography variant="h6">Fecha: {formatDate(eventDetails?.start, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</Typography>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDetails} color="primary">Cerrar</Button>
          <Button onClick={handleEditEvent} color="primary">Editar</Button>
          <Button onClick={handleDeleteEvent} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
