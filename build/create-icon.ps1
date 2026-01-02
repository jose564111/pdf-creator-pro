# Script para crear un ícono simple para PDF Creator Pro
# Ejecutar con: .\build\create-icon.ps1

Write-Host "Creando ícono para PDF Creator Pro..." -ForegroundColor Cyan

# Crear carpeta build si no existe
if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
}

Write-Host ""
Write-Host "Para crear un ícono profesional, usa una de estas opciones:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opción 1: Generador Online (Recomendado)" -ForegroundColor Green
Write-Host "  1. Ve a: https://www.icoconverter.com/" -ForegroundColor White
Write-Host "  2. Sube una imagen PNG de 512x512 con el diseño:" -ForegroundColor White
Write-Host "     - Fondo azul gradiente" -ForegroundColor White
Write-Host "     - Ícono de documento PDF blanco" -ForegroundColor White
Write-Host "  3. Descarga como icon.ico" -ForegroundColor White
Write-Host "  4. Guárdalo en: build\icon.ico" -ForegroundColor White
Write-Host ""

Write-Host "Opción 2: Usar Canva (Gratuito)" -ForegroundColor Green
Write-Host "  1. Ve a: https://www.canva.com/" -ForegroundColor White
Write-Host "  2. Crea un diseño de 512x512 px" -ForegroundColor White
Write-Host "  3. Diseña tu ícono con:" -ForegroundColor White
Write-Host "     - Gradiente azul (#4a90e2 a #7b68ee)" -ForegroundColor White
Write-Host "     - Ícono de PDF o documento" -ForegroundColor White
Write-Host "     - Texto 'PDF' (opcional)" -ForegroundColor White
Write-Host "  4. Descarga como PNG" -ForegroundColor White
Write-Host "  5. Convierte a ICO en icoconverter.com" -ForegroundColor White
Write-Host ""

Write-Host "Opción 3: Usar Flaticon" -ForegroundColor Green
Write-Host "  1. Ve a: https://www.flaticon.com/" -ForegroundColor White
Write-Host "  2. Busca 'pdf icon' o 'document icon'" -ForegroundColor White
Write-Host "  3. Descarga un ícono gratuito en PNG (512x512)" -ForegroundColor White
Write-Host "  4. Personaliza el color si es necesario" -ForegroundColor White
Write-Host "  5. Convierte a ICO" -ForegroundColor White
Write-Host ""

Write-Host "Opción 4: Crear con PowerShell (Básico)" -ForegroundColor Green
Write-Host "  Ejecutando código para crear un ícono SVG temporal..." -ForegroundColor White

# Crear un SVG temporal que puede usarse
$svgContent = @'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4a90e2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7b68ee;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo con gradiente -->
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>
  
  <!-- Documento -->
  <g transform="translate(106, 76)">
    <!-- Página -->
    <rect x="0" y="0" width="300" height="360" fill="white" rx="10"/>
    
    <!-- Esquina doblada -->
    <path d="M 250 0 L 300 50 L 250 50 Z" fill="#e0e0e0"/>
    
    <!-- Líneas de texto -->
    <rect x="40" y="80" width="220" height="12" fill="#4a90e2" rx="6"/>
    <rect x="40" y="110" width="220" height="12" fill="#4a90e2" opacity="0.5" rx="6"/>
    <rect x="40" y="140" width="180" height="12" fill="#4a90e2" opacity="0.5" rx="6"/>
    
    <rect x="40" y="190" width="220" height="12" fill="#4a90e2" opacity="0.3" rx="6"/>
    <rect x="40" y="220" width="220" height="12" fill="#4a90e2" opacity="0.3" rx="6"/>
    <rect x="40" y="250" width="160" height="12" fill="#4a90e2" opacity="0.3" rx="6"/>
  </g>
  
  <!-- Texto PDF -->
  <text x="256" y="440" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
        fill="white" text-anchor="middle">PDF</text>
</svg>
'@

$svgContent | Out-File -FilePath "build\icon.svg" -Encoding UTF8

Write-Host ""
Write-Host "✅ Archivo SVG creado: build\icon.svg" -ForegroundColor Green
Write-Host ""
Write-Host "Para convertir SVG a ICO:" -ForegroundColor Yellow
Write-Host "  1. Abre el SVG en un navegador" -ForegroundColor White
Write-Host "  2. Captura de pantalla o usa una herramienta" -ForegroundColor White
Write-Host "  3. Convierte a ICO en: https://www.icoconverter.com/" -ForegroundColor White
Write-Host "  4. Guarda como: build\icon.ico" -ForegroundColor White
Write-Host ""

Write-Host "Mientras tanto, la app puede iniciar sin ícono personalizado." -ForegroundColor Cyan
Write-Host "Electron usará su ícono predeterminado." -ForegroundColor Cyan
Write-Host ""
Write-Host "¿Listo para iniciar la app?" -ForegroundColor Green
Write-Host "Ejecuta: npm start" -ForegroundColor Cyan
Write-Host ""
