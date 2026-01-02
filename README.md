# PDF Creator Pro 📄

Una aplicación de escritorio completa y profesional para crear, leer, editar y rellenar PDFs con inteligencia artificial integrada.

## 🚀 Características Principales

### Creación de PDFs
- ✅ PDFs en blanco personalizables
- ✅ Plantillas profesionales (Facturas, Contratos, Currículums, Formularios)
- ✅ Generación de contenido con IA (OpenAI)
- ✅ Añadir texto, imágenes y formas
- ✅ Control completo de diseño y formato

### Lectura y Visualización
- ✅ Visor de PDFs integrado
- ✅ Navegación por páginas
- ✅ Control de zoom (50% - 300%)
- ✅ Extracción de texto y metadatos
- ✅ Búsqueda de texto en documentos
- ✅ Análisis de estructura del documento

### Edición Avanzada
- ✅ Editar PDFs existentes
- ✅ Añadir/eliminar páginas
- ✅ Rotar y reordenar páginas
- ✅ Copiar páginas entre documentos
- ✅ Añadir marcas de agua
- ✅ Numeración automática de páginas
- ✅ Modificar metadatos

### Formularios
- ✅ Detección automática de campos
- ✅ Rellenar formularios manualmente
- ✅ Auto-relleno con IA
- ✅ Aplanar formularios
- ✅ Soporte para múltiples tipos de campos (texto, checkbox, radio, dropdown)

### Integración con IA (OpenAI)
- 🤖 Generar contenido de PDFs con prompts
- 🤖 Auto-rellenar formularios inteligentemente
- 🤖 Extraer y estructurar datos de PDFs
- 🤖 Generar código para crear PDFs programáticamente
- 🤖 Sugerir mejoras en documentos
- 🤖 Traducir contenido
- 🤖 Resumir documentos
- 🤖 Analizar y categorizar documentos
- 🤖 Generar plantillas personalizadas

## 📦 Instalación

### Requisitos Previos
- Node.js 16 o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
```bash
cd pdf-creator-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm start
```

4. **Construir para producción**
```bash
npm run build
```

## 🔑 Configuración de OpenAI

**✅ IA Pre-configurada**: Este sistema viene con OpenAI integrado y listo para usar.

- No necesitas configurar API Key manualmente
- Todas las funciones de IA están disponibles al iniciar
- Solo inicia la aplicación y comienza a usar IA

Para detalles técnicos, consulta `AI-INTEGRATION.md`

## 📚 Uso Básico

### Crear un Nuevo PDF

1. Haz clic en "Nuevo PDF" en el header
2. Selecciona una plantilla o crea uno en blanco
3. Usa las herramientas del sidebar para añadir contenido
4. Guarda tu PDF cuando termines

### Editar un PDF Existente

1. Haz clic en "Abrir PDF"
2. Selecciona el archivo PDF
3. Usa las herramientas de edición del sidebar
4. Guarda los cambios

### Rellenar Formularios

1. Abre un PDF con formularios
2. Haz clic en "Rellenar Formulario" en el sidebar
3. Completa los campos manualmente o usa "Auto-Rellenar con IA"
4. Guarda el PDF rellenado

### Usar IA para Generar Contenido

1. Haz clic en "Generar con IA" en el sidebar
2. Describe lo que quieres crear
3. La IA generará el contenido estructurado
4. El contenido se aplicará automáticamente al PDF

## 🛠️ Tecnologías Utilizadas

- **Electron**: Framework para aplicaciones de escritorio
- **pdf-lib**: Creación y edición de PDFs
- **pdfjs-dist**: Renderizado y lectura de PDFs
- **pdf-parse**: Extracción de texto de PDFs
- **OpenAI API**: Inteligencia artificial para generación de contenido
- **HTML/CSS/JavaScript**: Interfaz de usuario

## 📁 Estructura del Proyecto

```
pdf-creator-app/
├── src/
│   ├── modules/
│   │   ├── pdfCreator.js      # Creación de PDFs
│   │   ├── pdfReader.js       # Lectura de PDFs
│   │   ├── pdfEditor.js       # Edición de PDFs
│   │   └── aiIntegration.js   # Integración con OpenAI
│   ├── styles/
│   │   └── main.css           # Estilos principales
│   └── app.js                 # Lógica principal de la app
├── build/                      # Recursos de construcción
├── index.html                  # Interfaz principal
├── main.js                     # Proceso principal de Electron
├── package.json                # Dependencias y scripts
└── README.md                   # Este archivo
```

## 🎨 Plantillas Disponibles

### 1. Factura
Plantilla profesional de factura con:
- Datos de emisor y cliente
- Tabla de conceptos
- Cálculo de totales e IVA

### 2. Contrato
Plantilla de contrato de servicios con:
- Datos de las partes
- Cláusulas estándar
- Espacios para firmas

### 3. Curriculum
Plantilla moderna de CV con:
- Secciones organizadas
- Diseño limpio y profesional
- Información de contacto destacada

### 4. Formulario
Plantilla de formulario genérico con:
- Múltiples tipos de campos
- Checkboxes y validaciones
- Espacio para firmas

## 🤝 Funciones de IA Disponibles

### Generación de Contenido
Describe el documento que necesitas y la IA generará el contenido estructurado.

**Ejemplo:**
```
"Crea un contrato de arrendamiento con campos para nombre del arrendador, 
arrendatario, dirección de la propiedad, renta mensual y duración del contrato"
```

### Auto-Relleno de Formularios
La IA puede rellenar automáticamente formularios basándose en contexto.

### Extracción de Datos
Extrae información estructurada de PDFs existentes.

### Análisis de Documentos
Obtén análisis detallados sobre tipo, categoría, entidades y temas del documento.

## 🔒 Privacidad y Seguridad

- Tu API Key de OpenAI se guarda localmente en tu dispositivo
- No se envían datos a servidores externos (excepto OpenAI para funciones de IA)
- Todos los PDFs se procesan localmente

## 🐛 Solución de Problemas

### Error al cargar PDFs
- Verifica que el archivo sea un PDF válido
- Asegúrate de tener suficiente memoria disponible

### Funciones de IA no funcionan
- Verifica que tu API Key de OpenAI sea válida
- Comprueba tu conexión a Internet
- Revisa que tengas créditos disponibles en tu cuenta de OpenAI

### La aplicación no inicia
- Ejecuta `npm install` nuevamente
- Verifica que tengas Node.js instalado
- Revisa los logs en la consola

## 📝 Ejemplos de Uso con IA

### Ejemplo 1: Crear Factura Personalizada
```
Prompt: "Crea una factura para servicios de consultoría con 
3 líneas de concepto, IVA del 21% y espacios para firma digital"
```

### Ejemplo 2: Generar Contrato
```
Prompt: "Genera un contrato de prestación de servicios de desarrollo 
de software con cláusulas de confidencialidad y propiedad intelectual"
```

### Ejemplo 3: Extraer Datos
```
Prompt: "Extrae todos los nombres, fechas y cantidades de este documento"
```

## 🎯 Casos de Uso

1. **Empresas**: Generar facturas, contratos y documentos corporativos
2. **Profesionales**: Crear currículums y portafolios
3. **Educación**: Crear formularios y documentos académicos
4. **Legal**: Generar contratos y documentos legales
5. **Administración**: Gestionar formularios y documentación

## 🔄 Actualizaciones Futuras

- [ ] Editor de texto enriquecido integrado
- [ ] Soporte para firmas digitales
- [ ] Plantillas adicionales
- [ ] Exportar a otros formatos (Word, HTML)
- [ ] Colaboración en tiempo real
- [ ] OCR para PDFs escaneados
- [ ] Compresión de PDFs
- [ ] Protección con contraseña

## 💡 Tips y Trucos

1. **Usa atajos de teclado**: Ctrl+S para guardar, Ctrl+O para abrir
2. **Zoom inteligente**: Ajusta el zoom según el tamaño de tu pantalla
3. **Plantillas**: Personaliza las plantillas para tus necesidades
4. **IA efectiva**: Sé específico en tus prompts para mejores resultados
5. **Backup**: Guarda copias de seguridad de documentos importantes

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
- Abre un issue en el repositorio
- Consulta la documentación
- Revisa las preguntas frecuentes

## 📄 Licencia

MIT License - Libre para uso personal y comercial

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando tecnologías modernas de JavaScript y IA.

---

**¡Gracias por usar PDF Creator Pro!** 🎉
