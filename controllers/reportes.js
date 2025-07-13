const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuración de rutas
const JASPER_REPORTS_PATH = path.join(__dirname, '../reportes');
const TEMP_PATH = path.join(__dirname, '../tmp');
const JASPERSTARTER_PATH = path.join(__dirname, '../lib/jasperstarter/bin/jasperstarter'); // Ajustar según instalación

// Asegurar que existe la carpeta temporal
if (!fs.existsSync(TEMP_PATH)) {
    fs.mkdirSync(TEMP_PATH, { recursive: true });
}

/**
 * Generar reporte PDF usando JasperStarter
 * @param {string} jasperFile - Nombre del archivo .jasper (sin extensión)
 * @param {Object} parameters - Parámetros para el reporte
 * @param {Array} dataSource - Datos para el reporte (opcional si usa conexión DB)
 * @returns {Promise<string>} - Ruta del archivo PDF generado
 */
const generateJasperReport = async (jasperFile, parameters = {}, dataSource = null) => {
    return new Promise((resolve, reject) => {
        const reportId = uuidv4();
        const jasperPath = path.join(JASPER_REPORTS_PATH, `${jasperFile}.jasper`);
        const outputPath = path.join(TEMP_PATH, `${reportId}.pdf`);
        
        // Verificar que existe el archivo .jasper
        if (!fs.existsSync(jasperPath)) {
            return reject(new Error(`Archivo .jasper no encontrado: ${jasperPath}`));
        }

        // Construir parámetros para JasperStarter
        let paramString = '';
        if (Object.keys(parameters).length > 0) {
            const params = Object.entries(parameters)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            paramString = `-P ${params}`;
        }

        // Comando JasperStarter
        // Opción 1: Sin conexión a DB (usando datos JSON)
        let command;
        if (dataSource) {
            // Crear archivo JSON temporal con los datos
            const dataFile = path.join(TEMP_PATH, `${reportId}_data.json`);
            fs.writeFileSync(dataFile, JSON.stringify(dataSource));
            
            command = `"${JASPERSTARTER_PATH}" process "${jasperPath}" -f pdf -o "${outputPath}" ${paramString} --data-file "${dataFile}"`;
        } else {
            // Opción 2: Con conexión a base de datos
            const dbConfig = {
                driver: 'com.mysql.cj.jdbc.Driver',
                url: `jdbc:mysql://${process.env.HOST}:3306/${process.env.DATABASE}`,
                username: process.env.USER,
                password: process.env.PASS
            };
            
            command = `"${JASPERSTARTER_PATH}" process "${jasperPath}" -f pdf -o "${outputPath}" ${paramString} -t mysql --db-driver ${dbConfig.driver} --db-url "${dbConfig.url}" --db-user ${dbConfig.username} --db-password ${dbConfig.password}`;
        }

        console.log('Ejecutando comando:', command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error ejecutando JasperStarter:', error);
                return reject(error);
            }

            if (stderr) {
                console.warn('JasperStarter stderr:', stderr);
            }

            console.log('JasperStarter stdout:', stdout);

            // Verificar que se generó el archivo
            if (fs.existsSync(outputPath)) {
                resolve(outputPath);
            } else {
                reject(new Error('No se pudo generar el archivo PDF'));
            }
        });
    });
};

/**
 * Controlador para generar reporte de factura
 */
const generarReporteFactura = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener datos de la factura (ejemplo con datos mock)
        const datosFactura = await obtenerDatosFactura(id);
        
        if (!datosFactura) {
            return res.status(404).json({ 
                msg: `No se encontró la factura con ID: ${id}` 
            });
        }

        // Parámetros para el reporte
        const parametros = {
            FACTURA_ID: id,
            EMPRESA_NOMBRE: datosFactura.empresa.nombre,
            FECHA_ACTUAL: new Date().toLocaleDateString('es-PY'),
            USUARIO: req.usuario?.nombre || 'Sistema'
        };

        // Generar el reporte
        const pdfPath = await generateJasperReport('factura', parametros, datosFactura.items);

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="factura_${id}.pdf"`);

        // Enviar el archivo
        res.sendFile(pdfPath, (err) => {
            if (err) {
                console.error('Error enviando archivo:', err);
                res.status(500).json({ msg: 'Error al enviar el archivo PDF' });
            }
            
            // Limpiar archivo temporal después de enviarlo
            setTimeout(() => {
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }, 5000);
        });

    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({ 
            msg: 'Error al generar el reporte PDF',
            error: error.message 
        });
    }
};

/**
 * Controlador para reporte de asientos contables
 */
const generarReporteAsientos = async (req, res) => {
    try {
        const { id_empresa, fecha_desde, fecha_hasta } = req.query;

        // Validaciones
        if (!id_empresa) {
            return res.status(400).json({ msg: 'El ID de empresa es requerido' });
        }

        // Parámetros para el reporte
        const parametros = {
            ID_EMPRESA: id_empresa,
            FECHA_DESDE: fecha_desde || '2024-01-01',
            FECHA_HASTA: fecha_hasta || new Date().toISOString().split('T')[0],
            TITULO_REPORTE: 'Reporte de Asientos Contables'
        };

        // Generar reporte usando conexión directa a BD
        const pdfPath = await generateJasperReport('asientos_contables', parametros);

        // Configurar headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="asientos_${id_empresa}.pdf"`);

        // Enviar archivo
        res.sendFile(pdfPath, (err) => {
            if (err) {
                console.error('Error enviando archivo:', err);
                res.status(500).json({ msg: 'Error al enviar el archivo PDF' });
            }
            
            // Limpiar archivo temporal
            setTimeout(() => {
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }, 5000);
        });

    } catch (error) {
        console.error('Error generando reporte de asientos:', error);
        res.status(500).json({ 
            msg: 'Error al generar el reporte de asientos',
            error: error.message 
        });
    }
};

/**
 * Función auxiliar para obtener datos de factura
 * Reemplazar con consulta real a la base de datos
 */
const obtenerDatosFactura = async (id) => {
    // Datos mock - reemplazar con consulta real
    return {
        id: id,
        numero: `FAC-${id.padStart(6, '0')}`,
        fecha: new Date().toLocaleDateString('es-PY'),
        empresa: {
            nombre: 'Mi Empresa S.A.',
            ruc: '80123456-7',
            direccion: 'Av. Principal 123, Asunción'
        },
        cliente: {
            nombre: 'Cliente Ejemplo',
            ruc: '12345678-9',
            direccion: 'Calle Secundaria 456'
        },
        items: [
            {
                descripcion: 'Producto 1',
                cantidad: 2,
                precio_unitario: 50000,
                total: 100000
            },
            {
                descripcion: 'Producto 2',
                cantidad: 1,
                precio_unitario: 75000,
                total: 75000
            }
        ],
        subtotal: 175000,
        iva: 17500,
        total: 192500
    };
};

/**
 * Listar reportes disponibles
 */
const listarReportes = async (req, res) => {
    try {
        const reportes = fs.readdirSync(JASPER_REPORTS_PATH)
            .filter(file => file.endsWith('.jasper'))
            .map(file => ({
                nombre: file.replace('.jasper', ''),
                archivo: file,
                ruta: `/api/reportes/${file.replace('.jasper', '')}`
            }));

        res.json({
            total: reportes.length,
            reportes
        });
    } catch (error) {
        console.error('Error listando reportes:', error);
        res.status(500).json({ 
            msg: 'Error al listar reportes disponibles' 
        });
    }
};

module.exports = {
    generarReporteFactura,
    generarReporteAsientos,
    listarReportes
};