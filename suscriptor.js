// suscriptor.js
const eventBus = require("./publicador"); // Importar el eventBus del publicador
const dlq = [];
const monitor = [];

// Suscriptor: Simulación de Envío de Correo
eventBus.on("nuevaCompra", async (compra) => {
    try {
        console.log(`Simulando envío de correo a ${compra.email}: "Has comprado ${compra.producto}"`);
    } catch (error) {
        console.error(`Error simulando correo para ${compra.email}`, error);
        dlq.push({ ...compra, error: "Fallo al simular envío de correo" });
        monitor.push({ error, compra });
    }
});

// Endpoint para ver la DLQ (Mensajes fallidos)
const express = require("express");
const app = express();

app.get("/dlq", (req, res) => {
    res.status(200).json({ mensajes_fallidos: dlq });
});

// Endpoint para ver el Monitor de Errores
app.get("/monitor", (req, res) => {
    res.status(200).json({ errores: monitor });
});

app.listen(4000, () => console.log("Servidor Suscriptor corriendo en http://localhost:4000"));
