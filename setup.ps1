# Script de Instalación y Configuración de PDF Creator Pro
# Ejecutar con: .\setup.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PDF Creator Pro - Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm detectado: $npmVersion" -ForegroundColor Green
Write-Host ""

# Instalar dependencias
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    Write-Host "Intentando con --force..." -ForegroundColor Yellow
    npm install --force
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Configuración Completa!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Siguiente paso:" -ForegroundColor Yellow
Write-Host "   Para iniciar la aplicación ejecuta:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host "📖 Documentación disponible:" -ForegroundColor Yellow
Write-Host "   - README.md          : Documentación completa" -ForegroundColor White
Write-Host "   - QUICK-START.md     : Inicio rápido" -ForegroundColor White
Write-Host "   - OPENAI-SETUP.md    : Configurar IA" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Características principales:" -ForegroundColor Yellow
Write-Host "   ✅ Crear PDFs desde cero" -ForegroundColor Green
Write-Host "   ✅ Leer y visualizar PDFs" -ForegroundColor Green
Write-Host "   ✅ Editar PDFs existentes" -ForegroundColor Green
Write-Host "   ✅ Rellenar formularios" -ForegroundColor Green
Write-Host "   ✅ Integración con OpenAI" -ForegroundColor Green
Write-Host "   ✅ Plantillas profesionales" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 ¡Listo para usar!" -ForegroundColor Cyan
Write-Host ""
