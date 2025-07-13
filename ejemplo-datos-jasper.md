# Ejemplos de datos para reportes JasperReports

## 1. Estructura de datos para reporte de Factura

### Parámetros (Parameters):
```javascript
const parametros = {
    FACTURA_ID: "123",
    EMPRESA_NOMBRE: "Mi Empresa S.A.",
    EMPRESA_RUC: "80123456-7",
    EMPRESA_DIRECCION: "Av. Principal 123, Asunción",
    EMPRESA_TELEFONO: "+595 21 123456",
    CLIENTE_NOMBRE: "Cliente Ejemplo",
    CLIENTE_RUC: "12345678-9",
    CLIENTE_DIRECCION: "Calle Secundaria 456",
    FECHA_ACTUAL: "2024-01-15",
    USUARIO: "admin",
    SUBTOTAL: 175000,
    IVA: 17500,
    TOTAL: 192500
};
```

### Datos (DataSource) - Array de objetos:
```javascript
const datosFactura = [
    {
        item: 1,
        descripcion: "Producto A",
        cantidad: 2,
        precio_unitario: 50000,
        total: 100000
    },
    {
        item: 2,
        descripcion: "Servicio B",
        cantidad: 1,
        precio_unitario: 75000,
        total: 75000
    }
];
```

## 2. Estructura para reporte de Asientos Contables

### Parámetros:
```javascript
const parametros = {
    ID_EMPRESA: 1,
    EMPRESA_NOMBRE: "Mi Empresa S.A.",
    FECHA_DESDE: "2024-01-01",
    FECHA_HASTA: "2024-12-31",
    TITULO_REPORTE: "Reporte de Asientos Contables",
    USUARIO: "admin",
    FECHA_GENERACION: "2024-01-15 10:30:00"
};
```

### Query SQL para el reporte (si usas conexión directa):
```sql
SELECT 
    ac.numero_asiento,
    ac.fecha,
    ac.documento,
    ad.debe,
    ad.haber,
    c.codigo as cuenta_codigo,
    c.nombre as cuenta_nombre,
    ad.concepto,
    e.nombre as empresa_nombre
FROM asiento_cabecera ac
INNER JOIN asiento_detalle ad ON ac.id_asiento = ad.id_asiento
INNER JOIN cuentas c ON ad.id_cuenta = c.id_cuenta
INNER JOIN empresas e ON ac.id_empresa = e.id_empresa
WHERE ac.id_empresa = $P{ID_EMPRESA}
  AND ac.fecha BETWEEN $P{FECHA_DESDE} AND $P{FECHA_HASTA}
ORDER BY ac.fecha, ac.numero_asiento, ad.id_detalle
```

## 3. Configuración en JasperReports Studio

### Para parámetros:
1. En JasperReports Studio, ve a "Outline" → "Parameters"
2. Crea parámetros con estos nombres exactos
3. Tipos de datos:
   - String: EMPRESA_NOMBRE, CLIENTE_NOMBRE, etc.
   - Integer: ID_EMPRESA, FACTURA_ID
   - Date: FECHA_DESDE, FECHA_HASTA
   - BigDecimal: SUBTOTAL, IVA, TOTAL

### Para campos de datos:
1. Ve a "Outline" → "Fields"
2. Crea campos que coincidan con tu estructura de datos
3. Para factura: descripcion, cantidad, precio_unitario, total
4. Para asientos: numero_asiento, fecha, debe, haber, cuenta_codigo, etc.

## 4. Ejemplo de uso en el controlador

```javascript
// Reporte con datos JSON
const datosFactura = await obtenerDatosFactura(id);
const pdfPath = await generateJasperReport(
    'factura', 
    parametros, 
    datosFactura.items  // Array de items
);

// Reporte con conexión directa a BD
const pdfPath = await generateJasperReport(
    'asientos_contables', 
    parametros  // Solo parámetros, datos vienen de la query SQL
);
```

## 5. Tipos de datos soportados

### En parámetros:
- **String**: Texto simple
- **Integer**: Números enteros
- **BigDecimal**: Números decimales (recomendado para montos)
- **Date**: Fechas (formato: YYYY-MM-DD)
- **Boolean**: true/false

### En campos de datos:
- **String**: Texto
- **Integer**: Números enteros
- **BigDecimal**: Decimales
- **Date**: Fechas
- **Time**: Horas
- **Timestamp**: Fecha y hora

## 6. Consejos para el diseño del reporte

1. **Usa parámetros para**:
   - Información de cabecera (empresa, cliente, fechas)
   - Filtros de consulta
   - Totales calculados

2. **Usa campos de datos para**:
   - Detalles que se repiten (items de factura, líneas de asiento)
   - Información que viene de consultas SQL

3. **Formato de números**:
   - Para montos: `#,##0.00`
   - Para cantidades: `#,##0`
   - Para porcentajes: `#,##0.00%`

4. **Formato de fechas**:
   - `dd/MM/yyyy` para fechas
   - `dd/MM/yyyy HH:mm` para fecha y hora