const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DESTINATION_URL = process.env.DESTINATION_WEBHOOK_URL;

if (!DESTINATION_URL) {
  console.error("Error: La variable de entorno DESTINATION_WEBHOOK_URL no está definida.");
  process.exit(1); 
}

app.all('/', async (req, res) => {
  console.log(`Webhook recibido en: ${new Date().toISOString()}`);
  console.log(`> Reenviando a: ${DESTINATION_URL}`);

  try {
    const response = await axios({
      method: req.method,
      url: DESTINATION_URL,
      data: req.body, 
      headers: { ...req.headers, host: new URL(DESTINATION_URL).host }
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Error al reenviar el webhook:", error.message);
    res.status(500).send({ error: "Fallo el reenvío del webhook", details: error.message });
  }
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Webhook Relay escuchando en el puerto ${PORT}`);
});