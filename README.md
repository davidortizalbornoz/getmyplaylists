# GetMyPlaylists - Spotify Playlist Extractor

## 📋 Descripción

Este proyecto permite obtener todas las playlists de un usuario de Spotify junto con los detalles completos de cada canción. Utiliza la API de Spotify para autenticación OAuth 2.0 y extrae información detallada de playlists con paginación automática.

## 🎯 Funcionalidades

- ✅ **Autenticación OAuth 2.0** con Spotify
- ✅ **Obtención de todas las playlists** del usuario
- ✅ **Paginación automática** para playlists y canciones
- ✅ **Detalles completos de canciones** por playlist
- ✅ **Servidor HTTPS local** para manejo de callbacks
- ✅ **Generación de archivo JSON** con toda la información
- ✅ **Resumen estadístico** de playlists y canciones

## 🛠️ Requerimientos Mínimos

### Sistema Operativo
- **macOS** 10.15+ (Catalina o superior)
- **Windows** 10/11
- **Linux** (Ubuntu 18.04+, CentOS 7+, etc.)

### Node.js
- **Versión mínima:** Node.js 16.0.0
- **Versión recomendada:** Node.js 18.0.0 o superior
- **NPM:** Incluido con Node.js

### Memoria RAM
- **Mínimo:** 512 MB
- **Recomendado:** 2 GB o superior
- **Para playlists grandes:** 4 GB o superior

### Espacio en Disco
- **Mínimo:** 100 MB
- **Recomendado:** 1 GB (para archivos JSON grandes)
- **Estimado por 1000 canciones:** ~50 MB

### Dependencias del Sistema
- **OpenSSL:** Para regeneración de certificados SSL (opcional)
  - macOS: Incluido por defecto
  - Windows: Incluido con Node.js
  - Linux: `sudo apt-get install openssl` (Ubuntu/Debian)
  - **Nota:** Los certificados SSL están incluidos en el repositorio

### Conectividad
- **Internet:** Conexión estable para API de Spotify
- **Puerto:** 3443 (HTTPS) disponible
- **Firewall:** Permitir conexiones locales en puerto 3443

## 📦 Instalación

### 1. Clonar o descargar el proyecto
```bash
git clone <repository-url>
cd getmyplaylists
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar credenciales de Spotify
Copiar el archivo de ejemplo y configurar:
```bash
cp config.example.js config.js
```

Editar el archivo `config.js`:
```javascript
module.exports = {
    spotify: {
        clientId: 'TU_CLIENT_ID_AQUI',
        clientSecret: 'TU_CLIENT_SECRET_AQUI',
        redirectUri: 'https://127.0.0.1:3443/callback'
    }
};
```

### 4. Obtener credenciales de Spotify
1. Ir a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crear una nueva aplicación
3. Obtener `clientId` y `clientSecret`
4. Configurar `redirect_uri` como `https://127.0.0.1:3443/callback`
5. Copiar las credenciales a `config.js`

### 5. Instalación rápida (opcional)
```bash
chmod +x install.sh
./install.sh
```

**💡 El script de instalación automática:**
- ✅ Verifica que Node.js esté instalado (versión 16+)
- ✅ Instala todas las dependencias
- ✅ Crea `config.js` desde `config.example.js`
- ✅ Genera certificados SSL si no existen
- ✅ Proporciona instrucciones claras para continuar

## 🚀 Uso

### Ejecutar el proyecto
```bash
npm start
# o
node index.js
```

### Flujo de trabajo
1. **Inicio del servidor:** Se inicia automáticamente en puerto 3443
2. **URL de autorización:** Se genera y muestra en consola
3. **Autorización:** Abrir URL en navegador y autorizar aplicación
4. **Proceso automático:** Se obtienen todas las playlists y canciones
5. **Resultado:** Archivo `myplaylist.json` generado

## 📁 Estructura del Proyecto

```
getmyplaylists/
├── index.js              # Código principal
├── config.js             # Configuración y credenciales (crear desde config.example.js)
├── config.example.js     # Plantilla de configuración
├── package.json          # Dependencias del proyecto
├── package-lock.json     # Versiones exactas de dependencias
├── myplaylist.json       # Archivo de salida (generado)
├── cert.pem              # Certificado SSL (RSA 4096 bits, válido 1 año)
├── key.pem               # Clave SSL privada (RSA 4096 bits)
├── install.sh            # Script de instalación automática
├── README.md             # Esta documentación
├── .gitignore            # Archivos a ignorar en Git
└── node_modules/         # Dependencias instaladas
```

## 🔧 Configuración

### Archivo config.js
```javascript
module.exports = {
    spotify: {
        clientId: 'TU_CLIENT_ID_AQUI',
        clientSecret: 'TU_CLIENT_SECRET_AQUI',
        redirectUri: 'https://127.0.0.1:3443/callback'
    }
};
```

**⚠️ Importante:** No incluir credenciales reales en el repositorio. Usar `config.example.js` como plantilla.


## 📊 Salida del Proyecto

### Archivo myplaylist.json
Contiene toda la información estructurada:
- **Playlists:** Información completa de cada playlist
- **Canciones:** Detalles de cada canción por playlist
- **Metadatos:** Información de paginación y totales

### Estructura de datos
```json
{
  "href": "https://api.spotify.com/v1/me/playlists",
  "items": [
    {
      "id": "playlist_id",
      "name": "Nombre de la Playlist",
      "tracks": {
        "items": [
          {
            "track": {
              "id": "track_id",
              "name": "Nombre de la Canción",
              "artists": [...],
              "album": {...}
            }
          }
        ],
        "total": 50
      }
    }
  ],
  "total": 118
}
```

## 🔒 Seguridad

### Certificados SSL
- **Incluidos en repositorio:** cert.pem y key.pem
- **Autofirmados:** Para desarrollo local
- **Válidos:** 365 días desde la creación
- **Fecha de expiración:** 1 año desde la generación
- **Propósito:** Habilitar HTTPS local para OAuth 2.0 callback de Spotify
- **Necesarios:** Para que el servidor HTTPS funcione correctamente
- **Seguridad:** Certificados autofirmados solo para desarrollo local

### Advertencias del navegador
- **Normal:** Aparecen con certificados autofirmados
- **Seguro:** Puedes proceder de forma segura
- **Local:** Solo para desarrollo local

## 🔐 Certificados SSL - Detalles Técnicos

### Propósito y Funcionalidad
Los certificados SSL (`cert.pem` y `key.pem`) son **esenciales** para el funcionamiento del proyecto porque:

- **OAuth 2.0 Requisito:** Spotify requiere HTTPS para el callback de autorización
- **Seguridad Local:** Protege la comunicación entre el navegador y el servidor local
- **Callback Automático:** Permite que el proceso de autorización se complete automáticamente
- **Desarrollo Seguro:** Simula un entorno de producción seguro en desarrollo local

### Especificaciones Técnicas
- **Tipo:** Certificados X.509 autofirmados
- **Algoritmo:** RSA 4096 bits
- **Validez:** 365 días (1 año) desde la fecha de generación
- **Dominio:** Configurado para `localhost` y `127.0.0.1`
- **Formato:** PEM (Privacy Enhanced Mail)

### Gestión de Certificados
- **Incluidos:** Los certificados están incluidos en el repositorio para facilitar la instalación
- **Regeneración:** Si necesitas regenerarlos, usa el comando en la sección de solución de problemas
- **Expiración:** Los certificados expiran después de 1 año y deben ser regenerados
- **Verificación:** Puedes verificar la fecha de expiración con: `openssl x509 -in cert.pem -text -noout | grep "Not After"`

### Comando de Verificación
```bash
# Verificar fecha de expiración del certificado
openssl x509 -in cert.pem -text -noout | grep "Not After"

# Verificar detalles completos del certificado
openssl x509 -in cert.pem -text -noout

# Verificar que el certificado es válido
openssl verify cert.pem
```

## 📈 Estadísticas de Ejecución

### Ejemplo de salida
```
📊 RESUMEN DETALLADO:
📋 Total de playlists: 118
🎵 Total de canciones: 9468

🏆 TOP 5 PLAYLISTS CON MÁS CANCIONES:
1. "Piano Healing - 432 Hz" - 1685 canciones
2. "Música para calmar la ansiedad y la mente 🕯️" - 1525 canciones
3. "House Music All Night Long (Tiktok Hits)" - 577 canciones
4. "Yoga Music Playlist 2025" - 500 canciones
5. "Zara Home (Jazz & Chill Out)" - 330 canciones
```

## 🐛 Solución de Problemas

### Error: "Invalid redirect URI"
- Verificar que `redirectUri` en `config.js` coincida con la configuración en Spotify Developer Dashboard
- Asegurar que el formato sea exacto: `https://127.0.0.1:3443/callback`

### Error: "Authorization code expired"
- Los códigos de autorización expiran rápidamente
- Ejecutar nuevamente el proyecto para obtener nueva URL de autorización

### Error: "Port 3443 already in use"
- Cambiar puerto en el código o liberar el puerto
- Verificar que no haya otra instancia ejecutándose

### Error: "OpenSSL not found"
- Los certificados SSL están incluidos en el repositorio
- Si necesitas regenerarlos: `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`
- En macOS: `brew install openssl` (si no está instalado)
- En Ubuntu: `sudo apt-get install openssl` (si no está instalado)

### Error: "Certificate expired"
- Verificar fecha de expiración: `openssl x509 -in cert.pem -text -noout | grep "Not After"`
- Regenerar certificados si han expirado
- Los certificados tienen validez de 1 año desde la generación

### Error: "SSL certificate verification failed"
- Verificar que los archivos `cert.pem` y `key.pem` existan
- Comprobar permisos de lectura: `ls -la *.pem`
- Regenerar certificados si están corruptos

### Archivo JSON muy grande
- El archivo puede ser muy pesado con muchas playlists
- Considerar procesar por lotes para proyectos grandes

## 📝 Dependencias

### Principales
- **axios:** ^1.11.0 - Cliente HTTP para peticiones a API
- **express:** ^5.1.0 - Framework web para servidor
- **fs:** Módulo nativo de Node.js para manejo de archivos
- **https:** Módulo nativo de Node.js para servidor HTTPS
- **path:** Módulo nativo de Node.js para rutas de archivos

### Versiones específicas
```json
{
  "dependencies": {
    "axios": "^1.11.0",
    "express": "^5.1.0"
  }
}
```

## 🔄 Actualizaciones

### Mantenimiento
- **Certificados SSL:** Verificar expiración y regenerar si es necesario
- **Tokens:** Se renuevan automáticamente durante la ejecución
- **Dependencias:** Actualizar con `npm update`

### Versiones
- **Node.js:** Mantener actualizado para mejor rendimiento
- **npm:** Usar la versión más reciente estable

## 📞 Soporte

### Logs de depuración
El proyecto incluye logs detallados para facilitar la depuración:
- Progreso de obtención de playlists
- Estado de paginación
- Errores específicos de API
- Estadísticas de ejecución

### Información de contacto
Para reportar problemas o solicitar mejoras, crear un issue en el repositorio del proyecto.

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y personales. Respetar los términos de uso de la API de Spotify.

---

**Nota:** Este proyecto utiliza la API oficial de Spotify. Asegúrate de cumplir con los términos de servicio de Spotify al usar esta herramienta.
