# Pruebas para Balance de Sumas y Saldos

## 1. Casos de prueba

### ✅ Caso exitoso
```
GET http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31
```

**Resultado esperado:**
- Status: 200 OK
- Content-Type: application/pdf
- Archivo PDF descargado con nombre: `balance_sumas_saldos_1_2024-01-01_2024-12-31.pdf`

### ❌ Casos de error

#### Parámetro IDEMPRESA faltante:
```
GET http://localhost:3000/api/reportes/balance-sumas-saldos?DESDE=2024-01-01&HASTA=2024-12-31
```
**Resultado:** 400 Bad Request

#### Parámetro DESDE faltante:
```
GET http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&HASTA=2024-12-31
```
**Resultado:** 400 Bad Request

#### Formato de fecha incorrecto:
```
GET http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=01/01/2024&HASTA=31/12/2024
```
**Resultado:** 400 Bad Request

#### Rango de fechas inválido:
```
GET http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-12-31&HASTA=2024-01-01
```
**Resultado:** 400 Bad Request

## 2. Scripts de prueba con cURL

### Crear archivo de pruebas: `test-balance.sh`
```bash
#!/bin/bash

echo "=== Pruebas Balance de Sumas y Saldos ==="

# Caso exitoso
echo "1. Prueba exitosa..."
curl -o "balance_exitoso.pdf" \
  "http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31"

if [ $? -eq 0 ]; then
    echo "✅ Prueba exitosa completada"
    ls -la balance_exitoso.pdf
else
    echo "❌ Error en prueba exitosa"
fi

# Caso error - parámetro faltante
echo "2. Prueba error - IDEMPRESA faltante..."
curl -v "http://localhost:3000/api/reportes/balance-sumas-saldos?DESDE=2024-01-01&HASTA=2024-12-31"

# Caso error - formato fecha
echo "3. Prueba error - formato fecha incorrecto..."
curl -v "http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=01/01/2024&HASTA=31/12/2024"

# Caso error - rango fechas
echo "4. Prueba error - rango fechas inválido..."
curl -v "http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-12-31&HASTA=2024-01-01"

echo "=== Fin de pruebas ==="
```

### Ejecutar pruebas:
```bash
chmod +x test-balance.sh
./test-balance.sh
```

## 3. Pruebas con Postman

### Configurar Collection:

#### Request 1: Balance Exitoso
- **Método:** GET
- **URL:** `{{base_url}}/api/reportes/balance-sumas-saldos`
- **Params:**
  - IDEMPRESA: 1
  - DESDE: 2024-01-01
  - HASTA: 2024-12-31
- **Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Content-Type is PDF", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/pdf");
});

pm.test("Has Content-Disposition header", function () {
    pm.expect(pm.response.headers.get("Content-Disposition")).to.include("balance_sumas_saldos");
});
```

#### Request 2: Error - Parámetro faltante
- **Método:** GET
- **URL:** `{{base_url}}/api/reportes/balance-sumas-saldos`
- **Params:**
  - DESDE: 2024-01-01
  - HASTA: 2024-12-31
- **Tests:**
```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message contains IDEMPRESA", function () {
    const response = pm.response.json();
    pm.expect(response.msg).to.include("IDEMPRESA");
});
```

## 4. Pruebas desde el navegador

### URLs para probar directamente:

#### Caso exitoso:
```
http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31
```

#### Diferentes rangos de fechas:
```
# Último mes
http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-11-01&HASTA=2024-11-30

# Último trimestre
http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-10-01&HASTA=2024-12-31

# Año completo
http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31
```

## 5. Verificación de archivos generados

### Script para monitorear archivos temporales:
```bash
# Crear archivo: monitor-tmp.sh
#!/bin/bash

echo "Monitoreando carpeta tmp..."
watch -n 1 'ls -la tmp/ && echo "--- $(date) ---"'
```

### Verificar limpieza automática:
```bash
# Generar reporte
curl -o test.pdf "http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31"

# Verificar que el archivo temporal se elimina después de 5 segundos
ls -la tmp/
sleep 6
ls -la tmp/
```

## 6. Logs y debugging

### Verificar logs en tiempo real:
```bash
# En una terminal, ejecutar el servidor con logs detallados
npm run dev

# En otra terminal, hacer requests y observar logs
curl "http://localhost:3000/api/reportes/balance-sumas-saldos?IDEMPRESA=1&DESDE=2024-01-01&HASTA=2024-12-31"
```

### Logs esperados:
```
Generando Balance de Sumas y Saldos con parámetros: {
  IDEMPRESA: '1',
  DESDE: '2024-01-01',
  HASTA: '2024-12-31'
}
Ejecutando comando: "path/to/jasperstarter" process "path/to/balance_sumas_saldos.jasper" -f pdf -o "path/to/output.pdf" -P IDEMPRESA="1" DESDE="2024-01-01" HASTA="2024-12-31" ...
JasperStarter stdout: ...
```

## 7. Checklist de verificación

Antes de hacer pruebas, verificar:

- [ ] JasperStarter está instalado y configurado
- [ ] Archivo `balance_sumas_saldos.jasper` existe en `/reportes/`
- [ ] Carpeta `/tmp/` existe y tiene permisos de escritura
- [ ] Variables de entorno de base de datos están configuradas
- [ ] Servidor Node.js está ejecutándose
- [ ] Base de datos tiene datos de prueba para la empresa especificada

## 8. Datos de prueba sugeridos

Para probar efectivamente, asegúrate de tener en tu base de datos:

```sql
-- Empresa de prueba
INSERT INTO empresas (id_empresa, nombre, ruc, estado) 
VALUES (1, 'Empresa de Prueba', '12345678-9', true);

-- Cuentas de prueba
INSERT INTO cuentas (codigo, nombre, asentable) VALUES 
(1000, 'Caja', 'Si'),
(2000, 'Bancos', 'Si'),
(3000, 'Proveedores', 'Si');

-- Asientos de prueba
INSERT INTO asiento_cabecera (id_empresa, numero_asiento, fecha, estado) 
VALUES (1, 'AST-001', '2024-06-15', 'procesado');

-- Detalles de prueba
INSERT INTO asiento_detalle (id_asiento, id_cuenta, debe, haber) VALUES 
(1, 1, 100000, 0),
(1, 3, 0, 100000);
```