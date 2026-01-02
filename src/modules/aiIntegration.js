const OpenAI = require('openai');

class AIIntegration {
    constructor() {
        // Cargar API key desde variable de entorno
        this.apiKey = process.env.OPENAI_API_KEY || '';
        this.client = new OpenAI({
            apiKey: this.apiKey
        });
    }

    async generateContent(prompt, options = {}) {
        try {
            if (!this.apiKey) {
                throw new Error('API Key de OpenAI no configurada. Por favor, configura la variable de entorno OPENAI_API_KEY en el archivo .env');
            }

            const response = await this.client.chat.completions.create({
                model: options.model || 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: options.systemPrompt || 'Eres un asistente útil especializado en documentos PDF.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000
            });

            return {
                success: true,
                content: response.choices[0].message.content,
                usage: response.usage
            };
        } catch (error) {
            console.error('Error generating content:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async extractData(text, schema) {
        const prompt = `Extrae la siguiente información del texto proporcionado según este esquema JSON: ${JSON.stringify(schema)}\n\nTexto:\n${text}`;
        
        return await this.generateContent(prompt, {
            systemPrompt: 'Eres un experto en extracción de datos estructurados. Devuelve siempre JSON válido.',
            temperature: 0.3
        });
    }

    async translateText(text, targetLanguage) {
        const prompt = `Traduce el siguiente texto a ${targetLanguage}:\n\n${text}`;
        
        return await this.generateContent(prompt, {
            systemPrompt: 'Eres un traductor profesional experto.',
            temperature: 0.3
        });
    }

    async summarizeText(text, length = 'medium') {
        const lengthInstructions = {
            short: 'en 2-3 oraciones',
            medium: 'en un párrafo',
            long: 'en varios párrafos detallados'
        };

        const prompt = `Resume el siguiente texto ${lengthInstructions[length]}:\n\n${text}`;
        
        return await this.generateContent(prompt, {
            systemPrompt: 'Eres un experto en resumir contenido preservando la información clave.',
            temperature: 0.5
        });
    }

    async analyzeDocument(text) {
        const prompt = `Analiza el siguiente documento y proporciona:
1. Tipo de documento
2. Temas principales
3. Información clave
4. Posibles problemas o inconsistencias

Texto:\n${text}`;
        
        return await this.generateContent(prompt, {
            systemPrompt: 'Eres un analista de documentos experto.',
            temperature: 0.5
        });
    }

    async autoFillForm(formFields, context) {
        const prompt = `Basándote en el siguiente contexto, sugiere valores apropiados para estos campos de formulario:
        
Contexto: ${context}

Campos: ${JSON.stringify(formFields)}

Devuelve un objeto JSON con los campos y sus valores sugeridos.`;
        
        return await this.generateContent(prompt, {
            systemPrompt: 'Eres un experto en completar formularios de manera precisa y apropiada.',
            temperature: 0.3
        });
    }

    async generateFromTemplate(templateType, data) {
        const templates = {
            invoice: 'una factura profesional',
            contract: 'un contrato legal',
            letter: 'una carta formal',
            report: 'un informe detallado'
        };

        const prompt = `Genera ${templates[templateType] || 'un documento'} con la siguiente información:\n${JSON.stringify(data, null, 2)}`;
        
        return await this.generateContent(prompt, {
            systemPrompt: 'Eres un experto en redacción de documentos profesionales.',
            temperature: 0.7,
            maxTokens: 3000
        });
    }

    async improveText(text, improvements = []) {
        const improvementsList = improvements.join(', ') || 'gramática, estilo y claridad';
        const prompt = `Mejora el siguiente texto enfocándote en: ${improvementsList}\n\nTexto original:\n${text}`;
        
        return await this.generateContent(prompt, {
            systemPrompt: 'Eres un editor profesional experto en mejorar textos.',
            temperature: 0.5
        });
    }

    async chatWithDocument(documentText, question, conversationHistory = []) {
        const messages = [
            {
                role: 'system',
                content: `Eres un asistente que responde preguntas sobre el siguiente documento:\n\n${documentText.substring(0, 4000)}`
            },
            ...conversationHistory,
            {
                role: 'user',
                content: question
            }
        ];

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            });

            return {
                success: true,
                answer: response.choices[0].message.content,
                usage: response.usage
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verificar si la API está configurada correctamente
    isConfigured() {
        return !!this.apiKey && this.apiKey.length > 0;
    }

    // Obtener información sobre el uso
    async checkUsage() {
        try {
            if (!this.apiKey) {
                return { success: false, error: 'API Key no configurada' };
            }

            // Hacer una llamada simple para verificar
            const response = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 5
            });

            return {
                success: true,
                message: 'API funcionando correctamente',
                usage: response.usage
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = AIIntegration;
