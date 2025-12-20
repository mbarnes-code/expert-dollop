
import { DomainType } from '../types';
import { getOrchestratorResponse } from './geminiService';
import { localSwarm } from './localSwarmService';

export interface NexusResponse {
    text: string;
    domain?: DomainType;
    source: 'CLOUD' | 'LOCAL';
}

export const processUserQuery = async (
    prompt: string, 
    context: any, 
    mode: 'CLOUD' | 'LOCAL'
): Promise<NexusResponse> => {
    
    if (mode === 'LOCAL') {
        console.log("Nexus switching to LOCAL SWARM mode...");
        try {
            const result = await localSwarm.processPrompt(prompt);
            return {
                text: result.text,
                domain: result.domain,
                source: 'LOCAL'
            };
        } catch (e) {
            return {
                text: "Local Swarm Connection Failed. Ensure vLLM containers are running.",
                source: 'LOCAL'
            };
        }
    } else {
        // Cloud Mode (Default)
        const result = await getOrchestratorResponse(prompt, context);
        return {
            text: result.text,
            domain: result.domain,
            source: 'CLOUD'
        };
    }
};
