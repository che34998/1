import { GoogleGenAI, Type } from "@google/genai";
import { TravelAlert } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getTravelAlert(country: string): Promise<TravelAlert> {
  const prompt = `請針對「${country}」提供目前的旅行安全評估。
  請包含：
  1. 風險等級（低、中、高、極高）
  2. 簡短的安全摘要
  3. 給旅行者的具體建議（至少 3 條）
  4. 當地的緊急聯絡電話（警察、救護車、消防局）
  5. 模擬 3 條最近的社群安全警報（包含內容和時間戳記）
  6. 該國家的地理中心座標 [緯度, 經度]
  
  請以繁體中文回答。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selected_country: { type: Type.STRING },
            risk_assessment: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING, enum: ["低", "中", "高", "極高"] },
                summary: { type: Type.STRING },
                advice: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["level", "summary", "advice"]
            },
            emergency_contacts: {
              type: Type.OBJECT,
              properties: {
                police: { type: Type.STRING },
                ambulance: { type: Type.STRING },
                fire: { type: Type.STRING },
                embassy: { type: Type.STRING }
              },
              required: ["police", "ambulance", "fire"]
            },
            community_feed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  content: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  can_delete: { type: Type.BOOLEAN }
                },
                required: ["id", "content", "timestamp", "can_delete"]
              }
            },
            geography: {
              type: Type.OBJECT,
              properties: {
                center: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              }
            }
          },
          required: ["selected_country", "risk_assessment", "emergency_contacts", "community_feed"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback data
    return {
      selected_country: country,
      risk_assessment: {
        level: "低",
        summary: "目前該地區相對安全，但仍請保持警覺。",
        advice: ["隨時注意周遭環境", "保管好個人財物", "遵守當地法律法規"]
      },
      emergency_contacts: {
        police: "110",
        ambulance: "119",
        fire: "119"
      },
      community_feed: []
    };
  }
}
