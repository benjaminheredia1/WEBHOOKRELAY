// Importamos las librerías necesarias
// express: para crear el servidor web
// axios: para hacer la petición de reenvío
const express = require('express');
const axios = require('axios');

// Inicializamos la aplicación de express
const app = express();
// Usamos un middleware para que express pueda entender JSON en el cuerpo de las peticiones
app.use(express.json());
// También para entender datos de formularios
app.use(express.urlencoded({ extended: true }));

// Leemos la URL de destino desde una variable de entorno.
// Esto es una buena práctica para no tener URLs hardcodeadas en el código.
const DESTINATION_URL = process.env.DESTINATION_WEBHOOK_URL;

if (!DESTINATION_URL) {
  console.error("Error: La variable de entorno DESTINATION_WEBHOOK_URL no está definida.");
  process.exit(1); // Detiene la aplicación si la URL no está configurada
}

// Creamos una ruta que acepte CUALQUIER método (POST, GET, etc.) en la raíz '/'
app.all('/', async (req, res) => {
  console.log(`Webhook recibido en: ${new Date().toISOString()}`);
  console.log(`> Reenviando a: ${DESTINATION_URL}`);

  try {
    // Usamos axios para replicar la petición original
    const response = await axios({
      method: req.method, // Usamos el mismo método (POST, GET, etc.)
      url: DESTINATION_URL,
      data: req.body, // Reenviamos el mismo cuerpo (payload)
      headers: { ...req.headers, host: new URL(DESTINATION_URL).host } // Reenviamos las cabeceras, pero actualizamos el 'host'
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Error al reenviar el webhook:", error.message);
    res.status(500).send({ error: "Fallo el reenvío del webhook", details: error.message });
  }
});

// El servidor escuchará en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Webhook Relay escuchando en el puerto ${PORT}`);
});