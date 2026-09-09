// Aplicación para calcular IVA y Renta en El Salvador
const express = require('express');
const app = express();
const port = 3157;

// Función para calcular renta en El Salvador
function calcularRenta(monto) {
    // Escala de renta simplificada para El Salvador
    if (monto <= 1000) return 0;
    if (monto <= 2000) return monto * 0.05;
    if (monto <= 4000) return monto * 0.10;
    return monto * 0.15;
}

app.get('/api/funcion/:parametroURL', (req, res) => {
    try {
        // Obtener el parámetro de la URL
        const parametroURL = req.params.parametroURL;
        const monto = Number(parametroURL);

        // VALIDACIÓN 1: Verifica si el parámetro es un número
        if (isNaN(parametroURL)) {
            return res.status(400).json({
                error: "El monto debe ser un número"
            });
        }

        // VALIDACIÓN 2: Verifica si el monto es de 0
        if (monto === 0) {
            return res.status(400).json({
                error: "El monto no puede ser igual a 0"
            });
        }

        // VALIDACIÓN 3: Verificar si es negativo
        if (monto < 0) {
            return res.status(400).json({
                error: "El monto no puede ser negativo"
            });
        }

        // CÁLCULOS
        const iva = monto * 0.13; // IVA en El Salvador 13%
        const renta = calcularRenta(monto);

        // En caso que responda bien
        const resultado = {
            monto: monto,
            iva: iva,
            renta: renta
        };

        res.status(200).json(resultado);

    } catch (error) {
        // Error interno del servidor
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});