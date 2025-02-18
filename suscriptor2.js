const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const dlq = [];
const monitor = [];

// Configuración de Nodemailer con Mailtrap
const transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 2525, // Puerto de Mailtrap
    auth: {
        user: "d06eab9ca93dbd", 
        pass: "cf65fe9bc80891" 
    }
});

// Endpoint para recibir las compras del balanceador
app.post("/nuevaCompra", async (req, res) => {
    const compra = req.body;
    console.log("Nueva compra recibida:", compra);

    try {
        // Definir el contenido del correo
        const mailOptions = {
            from: "hello@demomailtrap.com", 
            to: compra.email, 
            subject: "Confirmación de compra",
            text: `Has comprado un ${compra.producto}`,
            html: `<strong>Has comprado un ${compra.producto}</strong>`
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo:", error);
                dlq.push({ ...compra, error: "Fallo al enviar correo" });
                monitor.push({ error, compra });
                return res.status(500).json({ mensaje: "Error al enviar el correo" });
            }
            console.log("Correo enviado:", info.response);
            res.status(200).json({ mensaje: "Compra procesada y correo enviado" });
        });
    } catch (error) {
        console.error("Error procesando la compra:", error);
        dlq.push({ ...compra, error: "Error interno en el suscriptor" });
        monitor.push({ error, compra });
        res.status(500).json({ mensaje: "Error procesando la compra" });
    }
});

// Endpoint para ver mensajes fallidos
app.get("/dlq", (req, res) => {
    res.status(200).json({ mensajes_fallidos: dlq });
});

// Endpoint para ver el monitor de errores
app.get("/monitor", (req, res) => {
    res.status(200).json({ errores: monitor });
});

// Iniciar servidor
app.listen(5000, () => console.log("Suscriptor corriendo en http://localhost:5000"));
