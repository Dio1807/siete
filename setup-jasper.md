# Configuración de JasperReports con JasperStarter

## 1. Descargar JasperStarter

1. Ve a: https://github.com/centic9/jasperstarter/releases
2. Descarga la última versión (ej: `jasperstarter-3.4.0-dist.zip`)
3. Extrae el contenido en tu proyecto: `./lib/jasperstarter/`

## 2. Estructura de carpetas recomendada

```
tu-proyecto/
├── controllers/
│   └── reportes.js
├── routes/
│   └── reportes.js
├── reportes/           # Archivos .jasper
│   ├── factura.jasper
│   ├── asientos_contables.jasper
│   └── otros_reportes.jasper
├── tmp/               # Archivos temporales (PDFs generados)
├── lib/
│   └── jasperstarter/
│       ├── bin/
│       │   ├── jasperstarter      # Linux/Mac
│       │   └── jasperstarter.exe  # Windows
│       └── lib/
└── package.json
```

## 3. Configuración del PATH de JasperStarter

En `controllers/reportes.js`, ajusta la ruta según tu sistema:

```javascript
// Para Windows
const JASPERSTARTER_PATH = path.join(__dirname, '../lib/jasperstarter/bin/jasperstarter.exe');

// Para Linux/Mac
const JASPERSTARTER_PATH = path.join(__dirname, '../lib/jasperstarter/bin/jasperstarter');
```

## 4. Permisos de ejecución (Linux/Mac)

```bash
chmod +x ./lib/jasperstarter/bin/jasperstarter
```

## 5. Variables de entorno requeridas

Asegúrate de tener en tu `.env`:

```env
# Base de datos (para reportes con conexión directa)
HOST=localhost
DATABASE=tu_base_datos
USER=tu_usuario
PASS=tu_password
```

## 6. Dependencias de Java

JasperStarter requiere Java 8 o superior. Verifica:

```bash
java -version
```

Si no tienes Java instalado:
- **Windows**: Descarga desde Oracle JDK o OpenJDK
- **Ubuntu/Debian**: `sudo apt install openjdk-11-jre`
- **CentOS/RHEL**: `sudo yum install java-11-openjdk`
- **macOS**: `brew install openjdk@11`

## 7. Drivers de base de datos

Para MySQL, el driver ya está incluido en JasperStarter. Para otras bases de datos:

- **PostgreSQL**: Descargar `postgresql-xx.x.x.jar` y colocar en `lib/jasperstarter/jdbc/`
- **SQL Server**: Descargar `mssql-jdbc-xx.x.x.jar`
- **Oracle**: Descargar `ojdbc8.jar`

## 8. Prueba de instalación

Ejecuta desde la terminal:

```bash
# Windows
./lib/jasperstarter/bin/jasperstarter.exe --help

# Linux/Mac
./lib/jasperstarter/bin/jasperstarter --help
```

Deberías ver la ayuda de JasperStarter.