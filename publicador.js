const express = require("express");
const EventEmitter = require("events");
const axios = require("axios");  // Importar Axios para hacer peticiones HTTP

const app = express();
app.use(express.json());

const eventBus = new EventEmitter();
const queue = [];
const BALANCEADOR_URL = "http://localhost:3001/comprar"; // URL del balanceador

// Publicador (Simulación de Compra)
app.post("/comprar", async (req, res) => {
    const compra = {
        id: Date.now(),
        usuario: req.body.usuario,
        producto: req.body.producto,
        email: req.body.email,
        telefono: req.body.telefono
    };

    queue.push(compra);
    eventBus.emit("nuevaCompra", compra); // Emitir el evento de compra localmente

    try {
        // Enviar la compra al balanceador de carga
        const response = await axios.post(BALANCEADOR_URL, compra);
        console.log("Compra enviada al balanceador:", response.data);
        res.status(200).json({ mensaje: "Compra registrada y enviada al balanceador", compra });
    } catch (error) {
        console.error("Error enviando la compra al balanceador:", error.message);
        res.status(500).json({ error: "Error al procesar la compra" });
    }
});

// Endpoint para ver la cola de mensajes
app.get("/queue", (req, res) => {
    res.status(200).json({ queue });
});

// Levantar el servidor del publicador solo cuando se ejecute directamente
if (require.main === module) {
    app.listen(3000, () => console.log("Servidor Publicador corriendo en http://localhost:3000"));
}

module.exports = eventBus; // Exportar eventBus para que el suscriptor lo utilice
