import { Response } from 'express';
import { DemandPredictionService } from '../ml/demandPredictor';
import { generateAiDemandInsights } from '../ai/geminiDemandAdvisor';
import { AuthRequest } from '../middleware/auth';

async function createForecast(date?: string, scenario = 'normal') {
  const serviceUrl = process.env.ML_SERVICE_URL?.replace(/\/$/, '');
  if (serviceUrl) {
    try {
      const params = new URLSearchParams({ scenario });
      if (date) params.set('date', date);
      const response = await fetch(`${serviceUrl}/predict/demand?${params}`, {
        signal: AbortSignal.timeout(2500)
      });
      if (response.ok) {
        const payload = await response.json() as { success?: boolean; data?: Record<string, any> };
        if (payload.success && payload.data) {
          return {
            ...payload.data,
            factorsConsidered: payload.data.factorsConsidered || ['day of week', 'recent item demand', 'menu item', 'scenario'],
            lastTrained: payload.data.lastTrained || new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.warn('ML service unavailable; using the local preview forecaster:', error instanceof Error ? error.message : error);
    }
  }
  return DemandPredictionService.runPredictionPipeline(date, scenario);
}

export async function getPredictions(req: AuthRequest, res: Response) {
  try {
    const { date, scenario = 'normal', forceRefresh } = req.query;
    const predictionResult = await createForecast(date as string, scenario as string);

    // Fetch AI insights from Gemini Advisor
    const aiInsights = await generateAiDemandInsights(
      predictionResult.date,
      predictionResult.dayOfWeek,
      predictionResult.predictions,
      predictionResult.totalExpectedPortions,
      predictionResult.totalProjectedRevenue
    );

    predictionResult.aiInsights = aiInsights;

    return res.json({
      success: true,
      data: predictionResult
    });
  } catch (error) {
    console.error('Prediction calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate demand predictions.'
    });
  }
}

export async function generateNewPredictions(req: AuthRequest, res: Response) {
  try {
    const { targetDate, scenario = 'normal' } = req.body;
    const predictionResult = await createForecast(targetDate, scenario);

    const aiInsights = await generateAiDemandInsights(
      predictionResult.date,
      predictionResult.dayOfWeek,
      predictionResult.predictions,
      predictionResult.totalExpectedPortions,
      predictionResult.totalProjectedRevenue
    );

    predictionResult.aiInsights = aiInsights;

    return res.json({
      success: true,
      message: 'Demand forecast refreshed successfully.',
      data: predictionResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh the demand forecast.'
    });
  }
}
