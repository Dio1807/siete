# Cómo probar los reportes

## 1. Endpoints disponibles

### Listar reportes disponibles
```
GET http://localhost:3000/api/reportes
```

### Generar reporte de factura
```
GET http://localhost:3000/api/reportes/factura/123
```

### Generar reporte de asientos contables
```
GET http://localhost:3000/api/reportes/asientos?id_empresa=1&fecha_desde=2024-01-01&fecha_hasta=2024-12-31
```

## 2. Pruebas con Postman

### Configurar Postman para descargar PDFs:

1. **Headers necesarios**: Ninguno especial requerido
2. **Método**: GET
3. **En la respuesta**: 
   - Ve a la pestaña "Body"
   - Selecciona "Save Response" → "Save to file"
   - Guarda como `.pdf`

### Ejemplo de request:
```
GET http://localhost:3000/api/reportes/factura/123
```

**Respuesta esperada:**
- Status: 200 OK
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="factura_123.pdf"
- Body: Contenido binario del PDF

## 3. Pruebas desde el navegador

Simplemente visita las URLs en tu navegador:

```
http://localhost:3000/api/reportes/factura/123
```

El navegador debería:
- Mostrar el PDF directamente (si usa `inline`)
- Descargar el archivo (si usa `attachment`)

## 4. Pruebas con cURL

```bash
# Descargar factura
curl -o factura_123.pdf "http://localhost:3000/api/reportes/factura/123"

# Descargar reporte de asientos
curl -o asientos.pdf "http://localhost:3000/api/reportes/asientos?id_empresa=1&fecha_desde=2024-01-01&fecha_hasta=2024-12-31"
```

## 5. Debugging

### Verificar logs en consola:
- Comando JasperStarter ejecutado
- Stdout/stderr de JasperStarter
- Errores de generación

### Archivos temporales:
- Los PDFs se generan en `./tmp/`
- Se eliminan automáticamente después de 5 segundos
- Para debugging, comenta la línea de eliminación

### Errores comunes:

1. **"Archivo .jasper no encontrado"**
   - Verifica que el archivo existe en `./reportes/`
   - Verifica permisos de lectura

2. **"Java not found"**
   - Instala Java JRE/JDK
   - Verifica PATH de Java

3. **"JasperStarter command failed"**
   - Verifica permisos de ejecución
   - Revisa la ruta de JasperStarter
   - Verifica sintaxis del comando

4. **"Database connection failed"**
   - Verifica variables de entorno
   - Verifica conectividad a la base de datos
   - Verifica driver JDBC

## 6. Monitoreo de archivos temporales

Para evitar acumulación de archivos temporales:

```javascript
// Agregar limpieza periódica en server.js
setInterval(() => {
    const tmpDir = path.join(__dirname, 'tmp');
    const files = fs.readdirSync(tmpDir);
    const now = Date.now();
    
    files.forEach(file => {
        const filePath = path.join(tmpDir, file);
        const stats = fs.statSync(filePath);
        const ageInMinutes = (now - stats.mtime.getTime()) / (1000 * 60);
        
        if (ageInMinutes > 10) { // Eliminar archivos de más de 10 minutos
            fs.unlinkSync(filePath);
        }
    });
}, 5 * 60 * 1000); // Ejecutar cada 5 minutos
```