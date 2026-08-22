import { GoogleGenAI } from '@google/genai';
import { ItemPrediction, AiDemandInsights } from '../../src/types/index';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function getDefaultInsights(
  dayOfWeek: string,
  top3: string,
  low3: string,
  totalPortions: number,
  totalRevenue: number
): AiDemandInsights {
  return {
    executiveSummary: `ML Demand forecaster projects ~${totalPortions} total servings with ₹${totalRevenue.toLocaleString()} in gross revenue for ${dayOfWeek}. Peak consumption centers around ${top3}. Maintain standard early morning preparation buffers and prepare low-velocity items on-demand.`,
    peakRushHours: `Anticipate primary queue surges between 12:15 PM - 02:00 PM (Lunch rush) and 04:30 PM - 06:00 PM (Evening snacks). Pre-stage standard batches 20 minutes prior to these windows.`,
    perishableWasteAdvice: `Reduce morning batch production for lower-velocity items (${low3}) by 25%. Shift to cook-to-order after 02:30 PM to minimize perishable wastage.`,
    procurementRecommendation: `Maintain a +12% ingredient safety buffer on fresh bakery buns, dairy, tea leaves, and cooking oil. Reorder perishables during evening inventory audit.`
  };
}

export async function generateAiDemandInsights(
  targetDate: string,
  dayOfWeek: string,
  predictions: ItemPrediction[],
  totalPortions: number,
  totalRevenue: number
): Promise<AiDemandInsights> {
  const top3 = predictions.slice(0, 3).map(p => `${p.name} (~${p.predictedDemand} portions)`).join(', ');
  const low3 = predictions.slice(-2).map(p => `${p.name} (~${p.predictedDemand} portions)`).join(', ');

  const defaultResult = getDefaultInsights(dayOfWeek, top3, low3, totalPortions, totalRevenue);

  const ai = getAiClient();
  if (!ai) {
    return defaultResult;
  }

  const prompt = `You are CafeteriaAI's Chief Operations & Machine Learning Advisor for a college campus cafeteria.
Context:
- Target Date: ${targetDate} (${dayOfWeek})
- Total Portions Forecasted: ${totalPortions}
- Projected Daily Revenue: ₹${totalRevenue}
- Top High Demand Items: ${top3}
- Slow/Lower Demand Items: ${low3}

Provide actionable, structured advice as a JSON object with EXACTLY these four string keys:
1. "executiveSummary": High-level 2-3 sentence overview for the Cafeteria Admin and Head Chef.
2. "peakRushHours": Specific timing guidance for student rush hour surge windows and batch pre-staging.
3. "perishableWasteAdvice": Concrete guidance on reducing food waste and batch sizing for slow items.
4. "procurementRecommendation": Direct suggestions on inventory, safety buffer, and raw ingredient ordering.`;

  try {
    const aiPromise = (async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert AI operations consultant for high-volume campus food services. You ALWAYS respond with valid JSON matching the requested fields.',
          responseMimeType: 'application/json',
          temperature: 0.4,
        }
      });

      if (response.text) {
        try {
          const parsed = JSON.parse(response.text);
          if (parsed && typeof parsed.executiveSummary === 'string') {
            return {
              executiveSummary: parsed.executiveSummary || defaultResult.executiveSummary,
              peakRushHours: parsed.peakRushHours || defaultResult.peakRushHours,
              perishableWasteAdvice: parsed.perishableWasteAdvice || defaultResult.perishableWasteAdvice,
              procurementRecommendation: parsed.procurementRecommendation || defaultResult.procurementRecommendation,
              rawMarkdown: response.text
            };
          }
        } catch {
          return {
            ...defaultResult,
            executiveSummary: response.text.slice(0, 300)
          };
        }
      }
      return defaultResult;
    })();

    const timeoutPromise = new Promise<AiDemandInsights>((resolve) => {
      setTimeout(() => resolve(defaultResult), 3000);
    });

    return await Promise.race([aiPromise, timeoutPromise]);
  } catch (err: any) {
    console.warn(`[Gemini Advisor] Error generating insights (${err?.message?.slice(0, 80)}). Using operational heuristic.`);
    return defaultResult;
  }
}
