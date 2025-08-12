// Archivo de configuración de ejemplo
// Copiar este archivo como config.js y reemplazar con tus credenciales reales

module.exports = {
    spotify: {
        // Obtener desde: https://developer.spotify.com/dashboard
        clientId: 'TU_CLIENT_ID_AQUI',
        clientSecret: 'TU_CLIENT_SECRET_AQUI',
        
        // URL de redirección (no cambiar)
        redirectUri: 'https://127.0.0.1:3443/callback',
        
        // Código de autorización (se obtiene automáticamente)
        authorizationCode: 'TU_CODIGO_DE_AUTORIZACION_AQUI'
    }
};

/*
INSTRUCCIONES PARA OBTENER CREDENCIALES:

1. Ir a https://developer.spotify.com/dashboard
2. Iniciar sesión con tu cuenta de Spotify
3. Crear una nueva aplicación
4. Copiar el Client ID y Client Secret
5. En la configuración de la app, agregar:
   - Redirect URI: https://127.0.0.1:3443/callback
6. Guardar los cambios

El authorizationCode se obtiene automáticamente al ejecutar el proyecto.
*/
