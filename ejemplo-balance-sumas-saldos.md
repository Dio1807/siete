# Ejemplo de uso: Balance de Sumas y Saldos

## 1. Estructura de parámetros requeridos

Tu archivo `.jasper` debe tener estos parámetros definidos:

```
IDEMPRESA (Integer) - ID de la empresa
DESDE (String/Date) - Fecha inicial en formato YYYY-MM-DD
HASTA (String/Date) - Fecha final en formato YYYY-MM-DD
```

## 2. Ubicación del archivo .jasper

Coloca tu archivo en:
```
/reportes/balance_sumas_saldos.jasper
```

**Importante**: El nombre del archivo debe coincidir con el usado en el controlador (`balance_sumas_saldos`).

## 3. Ejemplos de uso de la API

### Endpoint:
```
GET /api/reportes/balance-sumas-saldos
```

### Parámetros de consulta requeridos:
- `IDEMPRESA`: ID de la empresa (número entero)
- `DESDE`: Fecha inicial (formato: YYYY-MM-DD)
- `HASTA`: Fecha final (formato: YYYY-MM-DD)

### Ejemplos de requests:

#### Con Postman:
```
GET http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31
```

#### Con cURL:
```bash
curl -o balance.pdf "http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31"
```

#### Desde el navegador:
```
http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31
```

## 4. Respuestas esperadas

### Éxito (200 OK):
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `inline; filename="balance_sumas_saldos_1_2024-01-01_2024-12-31.pdf"`
- **Body**: Contenido binario del PDF

### Errores comunes:

#### Parámetros faltantes (400 Bad Request):
```json
{
  "msg": "El parámetro IDEMPRESA es requerido"
}
```

#### Formato de fecha incorrecto (400 Bad Request):
```json
{
  "msg": "Las fechas deben tener formato YYYY-MM-DD"
}
```

#### Rango de fechas inválido (400 Bad Request):
```json
{
  "msg": "La fecha DESDE debe ser menor o igual a HASTA"
}
```

#### Error de generación (500 Internal Server Error):
```json
{
  "msg": "Error al generar el Balance de Sumas y Saldos",
  "error": "Descripción del error específico"
}
```

## 5. Query SQL sugerida para tu reporte .jasper

Si tu reporte usa conexión directa a la base de datos, aquí tienes una query SQL típica para Balance de Sumas y Saldos:

```sql
SELECT 
    c.codigo,
    c.nombre,
    COALESCE(SUM(CASE WHEN ad.debe > 0 AND ac.fecha < $P{DESDE} THEN ad.debe ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN ad.haber > 0 AND ac.fecha < $P{DESDE} THEN ad.haber ELSE 0 END), 0) as saldo_anterior,
    
    COALESCE(SUM(CASE WHEN ad.debe > 0 AND ac.fecha BETWEEN $P{DESDE} AND $P{HASTA} THEN ad.debe ELSE 0 END), 0) as debe_periodo,
    
    COALESCE(SUM(CASE WHEN ad.haber > 0 AND ac.fecha BETWEEN $P{DESDE} AND $P{HASTA} THEN ad.haber ELSE 0 END), 0) as haber_periodo,
    
    COALESCE(SUM(CASE WHEN ad.debe > 0 AND ac.fecha <= $P{HASTA} THEN ad.debe ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN ad.haber > 0 AND ac.fecha <= $P{HASTA} THEN ad.haber ELSE 0 END), 0) as saldo_final

FROM cuentas c
LEFT JOIN asiento_detalle ad ON c.id_cuenta = ad.id_cuenta
LEFT JOIN asiento_cabecera ac ON ad.id_asiento = ac.id_asiento 
    AND ac.id_empresa = $P{IDEMPRESA}
    AND ac.estado = 'procesado'
WHERE c.asentable = 'Si'
GROUP BY c.id_cuenta, c.codigo, c.nombre
HAVING saldo_anterior != 0 OR debe_periodo != 0 OR haber_periodo != 0 OR saldo_final != 0
ORDER BY c.codigo
```

## 6. Configuración en JasperReports Studio

### Parámetros a crear:
1. **IDEMPRESA**
   - Tipo: `java.lang.Integer`
   - Descripción: "ID de la empresa"

2. **DESDE**
   - Tipo: `java.lang.String` o `java.util.Date`
   - Descripción: "Fecha inicial del período"

3. **HASTA**
   - Tipo: `java.lang.String` o `java.util.Date`
   - Descripción: "Fecha final del período"

### Campos sugeridos:
- `codigo` (String)
- `nombre` (String)
- `saldo_anterior` (BigDecimal)
- `debe_periodo` (BigDecimal)
- `haber_periodo` (BigDecimal)
- `saldo_final` (BigDecimal)

## 7. Testing paso a paso

1. **Verificar que el archivo .jasper existe:**
   ```bash
   ls -la reportes/balance_sumas_saldos.jasper
   ```

2. **Probar el endpoint:**
   ```bash
   curl -v "http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31"
   ```

3. **Verificar logs en consola** para ver:
   - Parámetros recibidos
   - Comando JasperStarter ejecutado
   - Errores de generación

4. **Verificar archivos temporales:**
   ```bash
   ls -la tmp/
   ```

## 8. Troubleshooting

### Si el PDF no se genera:
1. Verifica que JasperStarter esté instalado correctamente
2. Revisa que el archivo .jasper esté en la ruta correcta
3. Verifica la conexión a la base de datos
4. Revisa los logs de JasperStarter en la consola

### Si los datos no aparecen:
1. Verifica que los parámetros lleguen correctamente
2. Revisa la query SQL en tu reporte .jasper
3. Verifica que existan datos en el rango de fechas especificado
4. Confirma que la empresa tenga asientos contables procesados