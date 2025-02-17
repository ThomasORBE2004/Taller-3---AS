// publicador.js
const express = require("express");
const EventEmitter = require("events");

const app = express();
app.use(express.json());

const eventBus = new EventEmitter();
const queue = [];

// Publicador (Simulación de Compra)
app.post("/comprar", (req, res) => {
    const compra = {
        id: Date.now(),
        usuario: req.body.usuario,
        producto: req.body.producto,
        email: req.body.email,
        telefono: req.body.telefono
    };

    queue.push(compra);
    eventBus.emit("nuevaCompra", compra); // Emitir el evento de compra
    res.status(200).json({ mensaje: "Compra registrada en el sistema", compra });
});

// Endpoint para ver la cola de mensajes
app.get("/queue", (req, res) => {
    res.status(200).json({ queue });
});

app.listen(3000, () => console.log("Servidor Publicador corriendo en http://localhost:3000"));

module.exports = eventBus; // Exportar eventBus para que el suscriptor lo utilice
