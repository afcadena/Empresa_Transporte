import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import axios from "axios";

const Entregas = ({ conductorId }) => {
  const [eventos, setEventos] = useState([]);
  const [openEventDetails, setOpenEventDetails] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  // Cargar los eventos (entregas) del conductor desde la base de datos
  useEffect(() => {
    // Asegúrate de que la URL esté configurada para filtrar por conductorId
    axios
      .get(`http://localhost:3001/encargos`, { params: { conductorId } }) // Usa params para pasar el query
      .then((response) => {
        setEventos(response.data);
      })
      .catch((error) => console.error("Error al obtener los encargos:", error));
  }, [conductorId]);

  // Muestra los detalles del evento al hacer clic
  const handleEventClick = (selected) => {
    setEventDetails(selected.event.extendedProps);
    setOpenEventDetails(true);
  };

  // Cierra la ventana de detalles del evento
  const handleCloseEventDetails = () => {
    setOpenEventDetails(false);
    setEventDetails(null); // Limpiar los detalles del evento
  };

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Calendario de Entregas
      </Typography>

      <Box>
        <FullCalendar
          height="75vh"
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          events={eventos.map(evento => ({
            id: evento.id,
            title: `Entrega de ${evento.carga} Kg`,
            start: evento.fecha, // Usa la fecha en el formato adecuado
            end: evento.fecha,   // Usa la fecha en el formato adecuado
            extendedProps: {
              carga: evento.carga,
              destinacion: evento.destinacion,
              fecha: evento.fecha,
            },
          }))}
          eventClick={handleEventClick} // Maneja clic en evento
          editable={false} // El conductor no puede modificar los eventos
          selectable={false}
        />
      </Box>

      {/* DETALLES DEL EVENTO */}
      <Dialog open={openEventDetails} onClose={handleCloseEventDetails}>
        <DialogTitle>Detalles de la Entrega</DialogTitle>
        <DialogContent>
          {eventDetails ? (
            <>
              <Typography variant="h6">Carga: {eventDetails.carga} Kg</Typography>
              <Typography variant="h6">Lugar de Destinación: {eventDetails.destinacion}</Typography>
              <Typography variant="h6">Fecha: {eventDetails.fecha}</Typography> {/* Asegúrate de que `fecha` esté en el formato correcto */}
            </>
          ) : (
            <Typography variant="h6">No hay detalles disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDetails} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Entregas;
