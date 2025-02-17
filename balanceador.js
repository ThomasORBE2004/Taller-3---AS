const http = require('http');
const axios = require('axios');

// Definir los suscriptores (en este caso, las URL de sus puertos)
const suscriptores = [
    'http://localhost:4000/nuevaCompra', // Suscriptor 1
    'http://localhost:5000/nuevaCompra'  // Suscriptor 2
];

let index = 0; // Empezar con el primer suscriptor

// Balanceador de carga simple: redirigir las solicitudes a suscriptores de forma rotativa
const balanceador = http.createServer(async (req, res) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/comprar') {
        let data = '';
        
        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', async () => {
            console.log(`Datos recibidos del cliente: ${data}`);
            
            try {
                const suscriptorUrl = suscriptores[index];
                console.log(`Enviando solicitud al suscriptor: ${suscriptorUrl}`);

                const response = await axios.post(suscriptorUrl, JSON.parse(data));

                console.log(`Respuesta del suscriptor (${suscriptorUrl}):`, response.status, response.data);

                // Cambiar al siguiente suscriptor (round robin)
                index = (index + 1) % suscriptores.length;
                console.log(`Siguiente suscriptor seleccionado: ${suscriptores[index]}`);

                res.statusCode = 200;
                res.end("Compra procesada y notificación enviada");
            } catch (error) {
                console.error("Error al enviar la notificación:", error.message);

                if (error.response) {
                    console.error(`Respuesta del error: ${error.response.status} - ${error.response.data}`);
                }

                res.statusCode = 500;
                res.end("Error procesando la compra");
            }
        });
    } else {
        console.log(`Solicitud a endpoint no encontrado: ${req.url}`);
        res.statusCode = 404;
        res.end("Endpoint no encontrado");
    }
});

balanceador.listen(3001, () => {
    console.log("Balanceador de carga corriendo en http://localhost:3001");
});
