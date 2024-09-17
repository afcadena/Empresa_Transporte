import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [message, setMessage] = useState(""); // Nuevo estado para manejar los mensajes

  // Genera un ID único y lo convierte en una cadena con comillas
  const generateUniqueId = () => {
    return Date.now().toString(); // Esto asegura que el ID se maneje como una cadena
  };

  const handleFormSubmit = (values, { resetForm }) => {
    axios.post("http://localhost:3001/camiones", {
      ...values,
      cargaActualKg: 0, // Se asigna el valor cero a la carga actual
      id: generateUniqueId(), // Genera un ID único y lo asigna como cadena al camión
      rol: "conductor", // Asigna el rol directamente aquí
    })
    .then((response) => {
      console.log("Camión registrado con el rol de conductor:", response.data);
      setMessage("Camión y conductor registrados con éxito"); // Reemplazo de alert
      resetForm(); // Reinicia el formulario después de un registro exitoso
    })
    .catch((error) => {
      console.error("Error al registrar el camión y conductor:", error);
      setMessage("Error al registrar el camión y conductor"); // Reemplazo de alert
    });
  };

  return (
    <Box m="20px">
      <Header title="REGISTRAR CAMIÓN" subtitle="Registrar un nuevo camión y conductor" />

      {/* Mostrar mensaje general */}
      {message && <p style={{ color: message.includes("éxito") ? 'green' : 'red' }}>{message}</p>}

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Matrícula"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.matricula}
                name="matricula"
                error={!!touched.matricula && !!errors.matricula}
                helperText={touched.matricula && errors.matricula}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Capacidad de Carga (Kg)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.capacidadCargaKg}
                name="capacidadCargaKg"
                error={!!touched.capacidadCargaKg && !!errors.capacidadCargaKg}
                helperText={touched.capacidadCargaKg && errors.capacidadCargaKg}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Consumo de Gasolina (Galones/Km)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.consumoGasolinaGalonesPorKm}
                name="consumoGasolinaGalonesPorKm"
                error={!!touched.consumoGasolinaGalonesPorKm && !!errors.consumoGasolinaGalonesPorKm}
                helperText={touched.consumoGasolinaGalonesPorKm && errors.consumoGasolinaGalonesPorKm}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nombre del Conductor"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.conductor}
                name="conductor"
                error={!!touched.conductor && !!errors.conductor}
                helperText={touched.conductor && errors.conductor}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="Correo del Conductor"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.correo}
                name="correo"
                error={!!touched.correo && !!errors.correo}
                helperText={touched.correo && errors.correo}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Contraseña del Conductor"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contraseña}
                name="contraseña"
                error={!!touched.contraseña && !!errors.contraseña}
                helperText={touched.contraseña && errors.contraseña}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Registrar Camión
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// Esquema de validación con Yup
const checkoutSchema = yup.object().shape({
  matricula: yup.string().required("La matrícula es obligatoria"),
  capacidadCargaKg: yup
    .number()
    .required("La capacidad de carga es obligatoria")
    .min(1, "La capacidad debe ser mayor a 0"),
  consumoGasolinaGalonesPorKm: yup
    .number()
    .required("El consumo de gasolina es obligatorio")
    .min(0, "El consumo no puede ser negativo"),
  conductor: yup.string().required("El nombre del conductor es obligatorio"),
  correo: yup.string().email("El correo es inválido").required("El correo es obligatorio"),
  contraseña: yup.string().required("La contraseña es obligatoria").min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Valores iniciales del formulario
const initialValues = {
  matricula: "",
  capacidadCargaKg: "",
  consumoGasolinaGalonesPorKm: "",
  conductor: "",
  correo: "",
  contraseña: "",
};

export default Form;
