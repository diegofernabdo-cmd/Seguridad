import { GoogleGenAI } from "@google/genai";
import { Guard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRoster = async (guards: Guard[]): Promise<string> => {
  try {
    const guardsData = JSON.stringify(guards.map(g => ({
      nombre: g.name,
      puesto: g.position,
      estado: g.status,
      ubicacion: g.location
    })));

    const prompt = `
      Actúa como un Jefe de Seguridad experto de 'ZONA SUR'.
      Analiza la siguiente lista de vigilantes (en formato JSON) y genera un reporte breve y profesional (máximo 150 palabras) en formato Markdown.
      
      El reporte debe incluir:
      1. Un resumen de la cobertura actual.
      2. Una recomendación estratégica breve sobre la distribución del personal o posibles vulnerabilidades basadas en los puestos vacíos o estados.
      
      Datos:
      ${guardsData}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast response
      }
    });

    return response.text || "No se pudo generar el reporte.";
  } catch (error) {
    console.error("Error generating AI report:", error);
    return "Error al conectar con el Analista Virtual. Por favor verifica tu conexión o clave API.";
  }
};