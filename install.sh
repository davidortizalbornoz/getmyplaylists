#!/bin/bash

echo "🚀 Instalando GetMyPlaylists..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "📥 Descarga Node.js desde: https://nodejs.org/"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Node.js versión 16 o superior requerida"
    echo "📥 Actualiza Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# Crear config.js si no existe
if [ ! -f "config.js" ]; then
    echo "📝 Creando archivo de configuración..."
    cp config.example.js config.js
    echo "⚠️  IMPORTANTE: Edita config.js con tus credenciales de Spotify"
else
    echo "✅ config.js ya existe"
fi

# Verificar certificados SSL
if [ ! -f "cert.pem" ] || [ ! -f "key.pem" ]; then
    echo "🔒 Generando certificados SSL..."
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Certificados SSL generados"
    else
        echo "⚠️  No se pudieron generar certificados SSL automáticamente"
        echo "📋 Instala OpenSSL y ejecuta manualmente:"
        echo "   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/C=US/ST=State/L=City/O=Organization/CN=localhost'"
    fi
else
    echo "✅ Certificados SSL encontrados"
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita config.js con tus credenciales de Spotify"
echo "2. Ejecuta: npm start"
echo ""
echo "📚 Para más información, consulta README.md"
