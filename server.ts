import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini AI endpoint for pediatric surgery census and automated alert analysis
app.post("/api/gemini/generate-report", async (req, res) => {
  try {
    const { censusData } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        report: "Clave de API Gemini no configurada en el servidor. Utilizando motor analítico local de alertas quirúrgicas.",
        isFallback: true
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `Eres un Médico Especialista en Cirugía Pediátrica Jefe de Sala.
Analiza la siguiente información de los 20 pacientes/camas de la sala de cirugía pediátrica y genera un Informe Ejecutivo Diario en español profesional y empático.

Datos del Censo Clínico:
${JSON.stringify(censusData, null, 2)}

Tu informe debe estructurarse con:
1. Resumen Ejecutivo del Censo (Ocupación y Triaje: Estables, Observación, Críticos).
2. Prioridades Quirúrgicas Inmediatas y Alertas de Pacientes Críticos/Observación.
3. Control de Estancias Prolongadas (pacientes con más días de hospitalización y plan para definir alta o estudios).
4. Checklist de Planes Pendientes Críticos para la Guardia (laboratorios, imágenes, ayunos y cirugías).
5. Mensaje de aliento para el equipo pediátrico.

Usa un tono clínico formal, claro, con viñetas y formato Markdown legible.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres un cirujano pediatra experto. Analizas censos hospitalarios de 20 camas pediátricas para optimizar el pase de visita y la seguridad del paciente.",
        temperature: 0.4
      }
    });

    return res.json({
      report: response.text || "No se pudo generar el texto del reporte.",
      isFallback: false
    });
  } catch (error: any) {
    console.error("Error generating Gemini clinical report:", error);
    return res.status(500).json({
      error: "Error al generar el reporte con IA",
      details: error?.message || "Error desconocido"
    });
  }
});

async function startServer() {
  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor PediaCirugía corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
