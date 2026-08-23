import { Response } from 'express';
import { DemandPredictionService } from '../ml/demandPredictor';
import { generateAiDemandInsights } from '../ai/geminiDemandAdvisor';
import { AuthRequest } from '../middleware/auth';

export async function getPredictions(req: AuthRequest, res: Response) {
  try {
    const { date, scenario = 'normal', forceRefresh } = req.query;
    const predictionResult = DemandPredictionService.runPredictionPipeline(
      date as string,
      scenario as string
    );

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
    const predictionResult = DemandPredictionService.runPredictionPipeline(
      targetDate,
      scenario
    );

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
      message: 'AI/ML Model re-trained and new demand predictions generated successfully!',
      data: predictionResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to re-train prediction pipeline.'
    });
  }
}
