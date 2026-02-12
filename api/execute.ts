import { VercelRequest, VercelResponse } from '@vercel/node';
import { registerOpenSourceAdapters } from '../src/adapters/opensource-llm';
import { researchToAppFlow } from '../src/flows/research-to-app-trial';
import { compileWorkflow, executeWorkflow } from 'bilko-flow';

// Register adapters on startup
registerOpenSourceAdapters();
const compiledWorkflow = compileWorkflow(researchToAppFlow);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { researchTopic, modelConfigs } = req.body;

    if (!researchTopic) {
      return res.status(400).json({ error: 'researchTopic is required' });
    }

    console.log(`🚀 Starting workflow for: ${researchTopic}`);

    const result = await executeWorkflow(compiledWorkflow, {
      researchTopic,
      modelConfigs: modelConfigs || {
        ollama: {
          baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
          apiKey: 'not-required'
        }
      },
      secrets: {
        DATABASE_URL: process.env.DATABASE_URL || '',
        JWT_SECRET: process.env.JWT_SECRET || ''
      }
    });

    res.status(200).json({
      success: true,
      data: result,
      metadata: {
        executionTime: result.metadata.duration,
        stepsExecuted: result.metadata.stepsExecuted
      }
    });

  } catch (error) {
    console.error('Workflow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: error instanceof Error && 'step' in error ? error.step : undefined
    });
  }
}