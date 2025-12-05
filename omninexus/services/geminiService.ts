
import { GoogleGenAI, Type } from "@google/genai";
import { DomainType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ORCHESTRATOR_SYSTEM_INSTRUCTION = `
You are the "Nexus Assistant", an advanced AI Security Operations Center (SOC) Analyst and Financial Advisor for OmniNexus.
You have access to a real-time "Data Lake" containing data from multiple tools:
1. MISP (Threat Intelligence) - Contains active campaigns, threat actors, and IOCs.
2. HELK (SIEM/Logs) - Contains raw system events, network connections, and process creations.
3. Yara-X (Pattern Matching) - Contains signatures for malware detection.
4. ACTUAL BUDGET (Finance) - Contains monthly budgets, spending, and remaining funds for categories like GAMING and TECH.
5. NEXUS LAB (AI Automation) - Contains user workflows and crawler tasks.

YOUR GOAL:
Analyze the user's prompt by CORRELATING data across these tools. 
- If the user asks about "trends" or "threats", look at MISP first, then check HELK logs.
- If the user asks about BUYING something (e.g., "Can I buy a Black Lotus?"), check the FINANCE data. Compare the item cost (if known, or estimate it) against the remaining budget for that category. WARN the user if they are over budget.
- If the user discusses Infrastructure changes, check if the TECH budget allows for it.
- If the user wants to AUTOMATE a task or SCRAPE data, suggest routing to the AI_LAB.

RESPONSE FORMAT:
Return a JSON object with:
- "response_text": A technical, concise analysis of the situation.
- "suggested_domain": The best module to handle the request (CYBER, GAMING, PRODUCTIVITY, INFRASTRUCTURE, AI_LAB).
`;

export const getOrchestratorResponse = async (userPrompt: string, contextData: any): Promise<{ text: string; domain?: DomainType }> => {
  try {
    const contextString = JSON.stringify(contextData, null, 2);
    
    // Heuristic for complexity: Trigger "Thinking" mode for deep analysis requests
    const complexityTriggers = ['analyze', 'correlate', 'investigate', 'strategy', 'plan', 'deep', 'report', 'complex', 'why', 'root cause', 'budget', 'afford'];
    const isComplex = complexityTriggers.some(t => userPrompt.toLowerCase().includes(t));

    // Default to Gemini 2.5 Flash Lite for low latency / fast responses
    let model = 'gemini-2.5-flash-lite';
    let config: any = {
        systemInstruction: ORCHESTRATOR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response_text: {
              type: Type.STRING,
              description: "The analysis and response."
            },
            suggested_domain: {
              type: Type.STRING,
              description: "The domain to navigate to.",
              enum: ["DASHBOARD", "CYBER", "GAMING", "PRODUCTIVITY", "INFRASTRUCTURE", "AI_LAB"]
            }
          },
          required: ["response_text"]
        }
    };

    // Upgrade to Gemini 3 Pro with Thinking for complex tasks
    if (isComplex) {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
        // Note: maxOutputTokens is intentionally unset to allow full thinking output
    }

    const fullPrompt = `
    CURRENT SYSTEM CONTEXT (Data Lake):
    ${contextString}

    USER QUERY:
    ${userPrompt}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
      config
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsed = JSON.parse(jsonText);
    
    let domain: DomainType | undefined = undefined;
    if (parsed.suggested_domain && parsed.suggested_domain in DomainType) {
      domain = parsed.suggested_domain as DomainType;
    }

    return {
      text: parsed.response_text,
      domain: domain
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "Nexus Neural Link Interrupted. Unable to correlate data streams.",
      domain: undefined
    };
  }
};