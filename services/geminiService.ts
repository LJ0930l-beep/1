import { GoogleGenAI } from "@google/genai";
import { Session, Host } from "../types";

// Initialize the client
// Note: In a real production app, ensure error handling if API_KEY is missing
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzePerformance = async (sessions: Session[], hosts: Host[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Prepare comprehensive context data
    // We send the full dataset (mapped to essential fields) to allow the AI to analyze historical trends.
    const simplifiedSessions = sessions.map(s => ({
      date: s.date,
      host: s.hostName,
      account: s.accountName,
      duration: s.durationMinutes,
      revenueUSD: Math.round(s.revenueUSD), // Round for cleaner tokens
      revenuePHP: Math.round(s.revenue)
    }));

    // Calculate some basic aggregates to help the model focus on high-level metrics immediately
    const totalRevenueUSD = sessions.reduce((sum, s) => sum + s.revenueUSD, 0);
    const totalSessions = sessions.length;
    
    const dataSummary = {
      meta: {
        totalSessions,
        totalRevenueUSD: Math.round(totalRevenueUSD),
        hostNames: hosts.map(h => h.name),
        analysisDate: new Date().toISOString().split('T')[0]
      },
      // Pass full historical data for trend analysis
      // Gemini 2.5 Flash has a large context window, handling hundreds of session records is efficient.
      historicalData: simplifiedSessions
    };

    const prompt = `
      Act as a Senior Data Analyst for an E-commerce Live Streaming agency.
      
      I am providing you with the FULL historical dataset of our live streaming sessions.
      
      Data: ${JSON.stringify(dataSummary)}

      Please provide a comprehensive performance analysis report in Chinese (Markdown format).
      
      Your analysis should cover:
      1. **Long-term Performance Trends**: Analyze the data over the entire period. Identify growth trends, stagnation points, or volatility in revenue and duration. Compare recent months to previous months.
      2. **Host Performance Matrix**: Compare hosts based on their historical consistency, total contribution, and recent trajectory. Who are the pillars of the team? Who is improving or declining?
      3. **Account Analysis**: Provide specific insights on the performance of different accounts (e.g., 'anta_globalstore' vs 'keepmovingofficial').
      4. **Actionable Strategy**: Based on the historical patterns (e.g., best days of week, optimal duration, best host-account pairing), provide 3 specific strategic recommendations for the upcoming month to maximize GMV.
      
      Tone: Professional, analytical, and growth-oriented. Use bolding for key insights.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "无法生成分析报告，请稍后再试。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "分析服务暂时不可用。请检查 API Key 设置或网络连接。";
  }
};
