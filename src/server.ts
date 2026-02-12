import express from 'express';
import cors from 'cors';
import { registerOpenSourceAdapters } from './adapters/opensource-llm';
import { researchToAppFlow } from './flows/research-to-app-trial';
import { compileWorkflow, executeWorkflow } from 'bilko-flow';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Register open-source adapters
registerOpenSourceAdapters();
const compiledWorkflow = compileWorkflow(researchToAppFlow);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/workflows', (req, res) => {
  res.json({
    workflows: [
      {
        id: 'research-to-app-trial',
        name: 'Research to App Trial',
        description: 'Transform research concept into functional application prototype',
        steps: researchToAppFlow.steps.length,
        determinismGrade: researchToAppFlow.determinismGrade
      }
    ]
  });
});

app.get('/api/models/status', async (req, res) => {
  const services = [
    { name: 'Ollama', url: 'http://localhost:11434/api/tags' },
    { name: 'vLLM', url: 'http://localhost:8000/v1/models' },
    { name: 'TGI', url: 'http://localhost:8080/info' }
  ];

  const status = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(service.url, { timeout: 5000 });
        const data = response.ok ? await response.json() : null;
        return {
          name: service.name,
          status: response.ok ? 'online' : 'offline',
          url: service.url,
          details: data
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'offline',
          url: service.url,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  res.json({ services: status });
});

app.post('/api/workflows/execute', async (req, res) => {
  try {
    const { researchTopic, modelConfigs, secrets } = req.body;

    if (!researchTopic) {
      return res.status(400).json({ error: 'researchTopic is required' });
    }

    console.log(`🚀 Starting workflow execution: ${researchTopic}`);

    const result = await executeWorkflow(compiledWorkflow, {
      researchTopic,
      modelConfigs: modelConfigs || {
        ollama: {
          baseUrl: 'http://localhost:11434',
          apiKey: 'not-required'
        }
      },
      secrets: secrets || {
        DATABASE_URL: 'postgresql://localhost:5432/research_app',
        JWT_SECRET: 'your-jwt-secret-here'
      }
    });

    res.json({
      success: true,
      data: result,
      metadata: {
        executionTime: result.metadata.duration,
        stepsExecuted: result.metadata.stepsExecuted,
        workflowId: 'research-to-app-trial'
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
});

app.post('/api/models/:provider/test', async (req, res) => {
  const { provider } = req.params;
  const { config } = req.body;

  try {
    // Simple test call to model
    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3:8b',
        prompt: 'Test response - say "OK"',
        stream: false
      })
    });

    const data = await response.json();
    res.json({
      success: response.ok,
      response: data.response,
      status: response.status
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve the main UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Research-to-App UI running at http://localhost:${PORT}`);
  console.log(`📋 API available at http://localhost:${PORT}/api`);
});

export default app;