// Aplicación para calcular IVA y Renta en El Salvador
const express = require('express');
const app = express();
const port = 3157;

app.use(express.json());

//EJERCICIO 1: Calcular IVA y Renta

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

// EJERCICIO 2: Impuestos por Pais

// 1. Objeto con la configuracion de impuestos por pais
const baseDatosPaises = {
    "elsalvador": { iva: 0.13, renta: 0.10 },
    "guatemala": { iva: 0.12, renta: 0.05 },
    "costarica": { iva: 0.13, renta: 0.15 },
    "honduras": { iva: 0.15, renta: 0.10 },
    "panama": { iva: 0.07, renta: 0.10 },
    "nicaragua": { iva: 0.15, renta: 0.10 }
};

// 2. Funcion para limpiar el texto del pais 
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");
}

// 3. Funcion para calcular impuestos y armar la respuesta
function calcularImpuestosSalario(paisKey, salarioBruto, configPais) {
    const ivaCalculado = salarioBruto * configPais.iva;
    const rentaCalculada = salarioBruto * configPais.renta;
    const salarioNeto = salarioBruto - ivaCalculado - rentaCalculada;

    return {
        pais: paisKey,
        salarioBruto: salarioBruto,
        porcentajeIVA: `${configPais.iva * 100}%`,
        porcentajeRenta: `${configPais.renta * 100}%`,
        iva: ivaCalculado,
        renta: rentaCalculada,
        salarioNeto: salarioNeto
    };
}

// 4. Ruta con parametros URL: /api/calcular-salario/:pais/:salario
app.get('/api/calcular-salario/:pais/:salario', (req, res) => {
    try {
        const { pais, salario } = req.params;

        // Validar que el salario sea un número válido y mayor a cero
        const salarioBruto = Number(salario);
        if (isNaN(salarioBruto) || salarioBruto <= 0) {
            return res.status(400).json({
                error: "El salario debe ser un numero mayor a cero"
            });
        }

        // Validar que el pais enviado sea permitido
        const paisKey = normalizarTexto(pais);
        const configPais = baseDatosPaises[paisKey];

        if (!configPais) {
            return res.status(400).json({
                error: `El pais '${pais}' no está permitido. Paises validos: El Salvador, Guatemala, Costa Rica, Honduras, Panama, Nicaragua.`
            });
        }

        // Procesar calculo y responder
        const resultado = calcularImpuestosSalario(paisKey, salarioBruto, configPais);
        return res.json(resultado);

    } catch (error) {
        return res.status(500).json({
            error: "Ocurrió un error inesperado en el servidor al calcular el salario."
        });
    }
});

// Arrancar servidor
app.listen(port, () => {
    console.log(`Servidor de desarrollo corriendo en http://localhost:${port}`);
});