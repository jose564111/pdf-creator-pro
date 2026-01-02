# Configuración de OpenAI para PDF Creator Pro

## 🔑 Obtener tu API Key

### Paso 1: Crear Cuenta en OpenAI

1. Ve a https://platform.openai.com/
2. Haz clic en **"Sign up"** o inicia sesión si ya tienes cuenta
3. Completa el registro

### Paso 2: Generar API Key

1. Una vez dentro, ve a https://platform.openai.com/api-keys
2. Haz clic en **"Create new secret key"**
3. Dale un nombre (ej: "PDF-Creator-Pro")
4. **¡IMPORTANTE!** Copia la key inmediatamente
   - Solo se mostrará una vez
   - Formato: `sk-proj-...` o `sk-...`
5. Guárdala en un lugar seguro

### Paso 3: Configurar en la Aplicación

1. Abre **PDF Creator Pro**
2. Haz clic en cualquier botón de IA:
   - 🤖 **"Generar con IA"**
   - 🤖 **"Auto-Rellenar con IA"**
   - 🤖 **"Extraer Datos"**

3. Se abrirá el modal de configuración
4. Pega tu API Key en el campo
5. Haz clic en **"Guardar"**
6. ✅ ¡Configurado!

## 💰 Costos de OpenAI

### Modelo Usado: GPT-4o-mini

**Precios aproximados (Enero 2025):**
- Input: $0.15 por 1M tokens (~$0.0001 por solicitud)
- Output: $0.60 por 1M tokens (~$0.0004 por solicitud)

**En promedio:**
- Generar un PDF: ~$0.001 - $0.005 (menos de 1 centavo)
- Rellenar formulario: ~$0.0005 - $0.002
- Analizar documento: ~$0.002 - $0.01

### Créditos Gratuitos

- **Nuevos usuarios**: $5 USD de crédito gratuito
- **Duración**: 3 meses desde el registro
- **Suficiente para**: ~1000-5000 operaciones

## 🛡️ Seguridad de tu API Key

### ✅ Buenas Prácticas

1. **Nunca compartas tu API Key**
   - No la publiques en redes sociales
   - No la compartas por email/chat
   - No la subas a repositorios públicos

2. **Guárdala localmente**
   - PDF Creator Pro guarda tu key solo en tu dispositivo
   - Está en localStorage del navegador
   - No se envía a ningún servidor nuestro

3. **Regenera si se compromete**
   - Si crees que alguien tiene tu key
   - Ve a OpenAI y genera una nueva
   - Revoca la anterior

### ⚠️ Qué NO hacer

- ❌ Compartir tu key con otros
- ❌ Usar la key de producción en apps públicas
- ❌ Dejarla en código fuente
- ❌ Usar la misma key en múltiples apps sin control

## 🔍 Verificar tu Configuración

### Método 1: Probar Generación Simple

1. En PDF Creator Pro, clic en **"Generar con IA"**
2. Escribe un prompt simple:
   ```
   Crea un documento simple con título "Hola Mundo"
   ```
3. Clic en **"Generar"**
4. Si funciona ✅ está bien configurado

### Método 2: Revisar Créditos en OpenAI

1. Ve a https://platform.openai.com/usage
2. Verifica tu balance
3. Revisa el historial de uso

## 📊 Monitorear Uso

### En OpenAI Dashboard

1. Ve a https://platform.openai.com/usage
2. Verás:
   - Uso diario
   - Costo acumulado
   - Tokens consumidos
   - Solicitudes por modelo

### Establecer Límites

1. Ve a https://platform.openai.com/account/limits
2. Configura límites de gasto:
   - **Soft limit**: Recibes notificación
   - **Hard limit**: Se detiene el uso

**Recomendación:** 
- Establece un límite de $10-20 para empezar
- Aumenta según necesites

## 🎯 Optimizar Costos

### Tips para Reducir Gastos

1. **Prompts concisos**
   - Sé específico pero breve
   - Evita textos muy largos

2. **Caché de resultados**
   - Si generas el mismo contenido, guárdalo
   - No regeneres innecesariamente

3. **Usa modelos apropiados**
   - GPT-4o-mini es perfecto para PDFs
   - Más barato que GPT-4

4. **Limita el max_tokens**
   - La app ya lo hace automáticamente
   - Evita respuestas excesivamente largas

## 🔧 Solución de Problemas

### Error: "Invalid API Key"

**Causas:**
- Key incorrecta o mal copiada
- Key revocada en OpenAI
- Espacios extra al copiar

**Solución:**
1. Copia nuevamente tu key desde OpenAI
2. Asegúrate de copiar completa (empieza con `sk-`)
3. Pégala sin espacios extra
4. Guarda nuevamente

### Error: "Rate Limit Exceeded"

**Causa:** Demasiadas solicitudes en poco tiempo

**Solución:**
1. Espera 1 minuto
2. Reintenta
3. Si persiste, verifica límites en OpenAI

### Error: "Insufficient Quota"

**Causa:** Se acabaron tus créditos

**Solución:**
1. Ve a https://platform.openai.com/account/billing
2. Añade un método de pago
3. Recarga créditos

### Error: "Connection Failed"

**Causa:** Problema de conectividad

**Solución:**
1. Verifica tu conexión a internet
2. Revisa firewall/antivirus
3. Prueba en otra red

## 🌟 Funciones de IA Disponibles

Con tu API Key configurada puedes usar:

### 1. Generación de Contenido
```
"Crea un contrato de arrendamiento..."
"Genera una factura para servicios de..."
"Diseña un formulario de registro con..."
```

### 2. Auto-Relleno Inteligente
```
La IA detecta los campos y sugiere valores apropiados
basándose en el contexto del formulario
```

### 3. Extracción de Datos
```
"Extrae todos los nombres y fechas de este documento"
"Obtén los montos y conceptos de esta factura"
```

### 4. Análisis de Documentos
```
Categorización automática
Detección de entidades (nombres, lugares, fechas)
Análisis de sentimiento
```

### 5. Traducción
```
Traduce documentos a múltiples idiomas
manteniendo formato y estructura
```

### 6. Resumen
```
Genera resúmenes concisos de documentos largos
en diferentes niveles de detalle
```

## 📱 Uso en Múltiples Dispositivos

### Sincronizar API Key

La key se guarda localmente, así que:

1. **Mismo dispositivo**: Se mantiene automáticamente
2. **Diferentes dispositivos**: Debes configurar en cada uno
3. **Recomendación**: Usa la misma key en todos

### Seguridad Multi-Dispositivo

- Cada dispositivo guarda la key localmente
- No hay sincronización automática (más seguro)
- Puedes usar keys diferentes si prefieres

## 💡 Tips Avanzados

### 1. Variables de Entorno (Opcional)

Para desarrolladores que quieran automatizar:

```javascript
// En lugar de guardar en localStorage
process.env.OPENAI_API_KEY = 'tu-key'
```

### 2. Múltiples Keys

Si tienes varias organizaciones en OpenAI:
- Usa keys diferentes según el proyecto
- Cambia en la app según necesites

### 3. Límites por Proyecto

En OpenAI puedes crear proyectos separados con límites individuales.

## 📞 Soporte

### Problemas con OpenAI
- Soporte OpenAI: https://help.openai.com
- Status: https://status.openai.com

### Problemas con PDF Creator Pro
- Revisa el README
- Consulta la documentación
- Reporta en GitHub

---

## ✅ Checklist de Configuración

- [ ] Cuenta de OpenAI creada
- [ ] API Key generada
- [ ] Key guardada de forma segura
- [ ] Key configurada en PDF Creator Pro
- [ ] Prueba exitosa de generación
- [ ] Límites de gasto establecidos
- [ ] Método de pago configurado (opcional)

**¡Todo listo! Ahora puedes aprovechar el poder de la IA en tus PDFs.** 🚀
