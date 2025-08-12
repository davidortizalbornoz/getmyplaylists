const axios = require('axios');
const fs = require('fs');
const express = require('express');
const https = require('https');
const path = require('path');
const config = require('./config');

const app = express();
const HTTPS_PORT = 3443;

// Función para obtener token de cliente (Client Credentials)
async function getClientToken() {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials', 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(config.spotify.clientId + ':' + config.spotify.clientSecret).toString('base64')
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo token de cliente:', error.response?.data || error.message);
        throw error;
    }
}

// Función para generar URL de autorización OAuth 2.0
function getAuthorizationUrl() {
    const scopes = [
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-read-private'
    ];
    
    const params = new URLSearchParams({
        client_id: config.spotify.clientId,
        response_type: 'code',
        redirect_uri: config.spotify.redirectUri,
        scope: scopes.join(' '),
        state: 'random-state-string'
    });
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Función para intercambiar código de autorización por token de acceso
async function exchangeCodeForToken(authorizationCode) {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: authorizationCode,
                redirect_uri: config.spotify.redirectUri
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(config.spotify.clientId + ':' + config.spotify.clientSecret).toString('base64')
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error intercambiando código por token:', error.response?.data || error.message);
        throw error;
    }
}



async function getPlaylistTracks(playlistId, accessToken) {
    try {
        let allTracks = [];
        let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;
        let pageCount = 0;
        
        while (nextUrl) {
            pageCount++;
            
            const response = await axios.get(nextUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            const pageData = response.data;
            allTracks = allTracks.concat(pageData.items);
            
            // Verificar si hay más páginas
            nextUrl = pageData.next;
        }
        
        return allTracks;
    } catch (error) {
        console.error(`Error obteniendo tracks de playlist ${playlistId}:`, error.response?.data || error.message);
        return [];
    }
}

async function getMyPlaylists(accessToken) {
    try {
        let allPlaylists = [];
        let nextUrl = 'https://api.spotify.com/v1/me/playlists?limit=50';
        let pageCount = 0;
        
        console.log('🔄 Iniciando obtención de playlists con paginación...');
        
        while (nextUrl) {
            pageCount++;
            console.log(`📄 Obteniendo página ${pageCount}...`);
            
            const response = await axios.get(nextUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            const pageData = response.data;
            allPlaylists = allPlaylists.concat(pageData.items);
            
            console.log(`✅ Página ${pageCount}: ${pageData.items.length} playlists obtenidas`);
            console.log(`📊 Total acumulado: ${allPlaylists.length} playlists`);
            
            // Verificar si hay más páginas
            nextUrl = pageData.next;
            
            if (nextUrl) {
                console.log(`⏭️  Siguiente página disponible: ${nextUrl}`);
            } else {
                console.log('🏁 No hay más páginas disponibles');
            }
        }
        
        console.log(`🎉 Obtención de playlists finalizada: ${allPlaylists.length} playlists en total`);
        
        // Obtener tracks de cada playlist
        console.log('🎵 Iniciando obtención de tracks para cada playlist...');
        const playlistsWithTracks = [];
        
        for (let i = 0; i < allPlaylists.length; i++) {
            const playlist = allPlaylists[i];
            console.log(`📋 Obteniendo tracks de playlist ${i + 1}/${allPlaylists.length}: "${playlist.name}"`);
            
            const tracks = await getPlaylistTracks(playlist.id, accessToken);
            
            // Crear objeto playlist con tracks incluidos
            const playlistWithTracks = {
                ...playlist,
                tracks: {
                    href: `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                    items: tracks,
                    limit: 50,
                    next: null,
                    offset: 0,
                    previous: null,
                    total: tracks.length
                }
            };
            
            playlistsWithTracks.push(playlistWithTracks);
            console.log(`✅ Playlist "${playlist.name}": ${tracks.length} tracks obtenidos`);
        }
        
        // Crear objeto de respuesta completo con todos los items y tracks
        const completeResponse = {
            href: 'https://api.spotify.com/v1/me/playlists',
            items: playlistsWithTracks,
            limit: 50,
            next: null,
            offset: 0,
            previous: null,
            total: playlistsWithTracks.length
        };
        
        console.log(`🎉 Obtención completa finalizada: ${playlistsWithTracks.length} playlists con tracks en total`);
        return completeResponse;
        
    } catch (error) {
        console.error('Error obteniendo playlists:', error.response?.data || error.message);
        throw error;
    }
}

// Función para crear certificados SSL autofirmados
function createSSLCertificates() {
    const certPath = path.join(__dirname, 'cert.pem');
    const keyPath = path.join(__dirname, 'key.pem');
    
    // Verificar si ya existen los certificados
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        console.log('🔐 Certificados SSL encontrados');
        return { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) };
    }
    
    console.log('🔐 Generando certificados SSL autofirmados...');
    
    // Crear certificados básicos para desarrollo
    const { execSync } = require('child_process');
    try {
        execSync(`openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
        console.log('✅ Certificados SSL generados exitosamente');
        return { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) };
    } catch (error) {
        console.log('⚠️  No se pudieron generar certificados SSL, usando HTTP');
        return null;
    }
}

// Variable global para almacenar el código de autorización
let authorizationCode = null;

// Endpoint de callback para OAuth 2.0
app.get('/callback', (req, res) => {
    const { code, state } = req.query;
    
    console.log('🎯 Callback recibido:');
    console.log('📋 Code:', code);
    console.log('🔒 State:', state);
    
    if (code) {
        authorizationCode = code;
        console.log('✅ Código de autorización capturado exitosamente');
        
        // Iniciar el proceso de obtención de playlists
        processPlaylists(code);
        
        res.send(`
            <html>
                <head><title>Autorización Exitosa</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #1DB954;">✅ Autorización Exitosa</h1>
                    <p>Tu cuenta de Spotify ha sido autorizada correctamente.</p>
                    <p>Puedes cerrar esta ventana y revisar la consola para ver el progreso.</p>
                    <p style="color: #666; font-size: 12px;">Código recibido: ${code.substring(0, 20)}...</p>
                </body>
            </html>
        `);
    } else {
        console.log('❌ Error: No se recibió código de autorización');
        res.status(400).send('Error: No se recibió código de autorización');
    }
});

// Función para procesar las playlists
async function processPlaylists(code) {
    try {
        console.log('🔄 Iniciando proceso de obtención de playlists...');
        
        // 1. Obtener token de cliente
        console.log('📋 Obteniendo token de cliente...');
        const clientToken = await getClientToken();
        console.log('✅ Token de cliente obtenido exitosamente');
        
        // 2. Intercambiar código por token de usuario
        console.log('🔄 Intercambiando código de autorización por token de usuario...');
        const userTokenData = await exchangeCodeForToken(code);
        console.log('✅ Token de usuario obtenido exitosamente');
        console.log('📅 Token expira en:', userTokenData.expires_in, 'segundos');
        
        // 3. Obtener playlists con token de usuario
        console.log('🎵 Obteniendo playlists de usuario...');
        const playlists = await getMyPlaylists(userTokenData.access_token);
        
        // 4. Guardar playlists en archivo JSON
        console.log('💾 Guardando playlists en archivo myplaylist.json...');
        fs.writeFileSync('myplaylist.json', JSON.stringify(playlists, null, 2), 'utf8');
        console.log('✅ Playlists guardadas exitosamente en myplaylist.json');
        
        // 5. Mostrar resumen detallado de la información obtenida
        console.log('\n📊 RESUMEN DETALLADO:');
        console.log(`📋 Total de playlists: ${playlists.items.length}`);
        
        // Calcular total de canciones
        let totalTracks = 0;
        playlists.items.forEach(playlist => {
            totalTracks += playlist.tracks.total;
        });
        console.log(`🎵 Total de canciones: ${totalTracks}`);
        
        // Mostrar las 5 playlists con más canciones
        const topPlaylists = playlists.items
            .sort((a, b) => b.tracks.total - a.tracks.total)
            .slice(0, 5);
        
        console.log('\n🏆 TOP 5 PLAYLISTS CON MÁS CANCIONES:');
        topPlaylists.forEach((playlist, index) => {
            console.log(`${index + 1}. "${playlist.name}" - ${playlist.tracks.total} canciones`);
        });
        
        console.log(`📅 Token expira en: ${userTokenData.expires_in} segundos`);
        
        // 6. Mostrar información adicional del token
        if (userTokenData.refresh_token) {
            console.log('🔄 Refresh token disponible para renovar el acceso');
        }
        
        console.log('\n🎉 Proceso completado exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en la ejecución:', error.message);
        if (error.response?.data) {
            console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

async function main() {
    try {
        console.log('🚀 Iniciando servidor de callback...');
        
        // 1. Crear certificados SSL e iniciar servidor HTTPS
        const sslOptions = createSSLCertificates();
        https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
            console.log(`🔒 Servidor HTTPS iniciado en puerto ${HTTPS_PORT}`);
            console.log(`🎯 Endpoint de callback: ${config.spotify.redirectUri}`);
            console.log(`⚠️  Nota: Es posible que veas una advertencia de seguridad en el navegador`);
            console.log(`    Esto es normal con certificados autofirmados. Puedes proceder de forma segura.`);
        });
        
        // 2. Generar URL de autorización
        console.log('🔗 Generando URL de autorización...');
        const authUrl = getAuthorizationUrl();
        console.log('📋 URL de autorización generada:');
        console.log(authUrl);
        console.log('');
        console.log('⚠️  INSTRUCCIONES:');
        console.log('1. Abre la URL anterior en tu navegador');
        console.log('2. Autoriza la aplicación');
        console.log('3. El proceso se completará automáticamente');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error en la ejecución:', error.message);
        if (error.response?.data) {
            console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();