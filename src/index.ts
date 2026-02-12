import { registerOpenSourceAdapters, OPEN_SOURCE_MODELS } from './adapters/opensource-llm';
import { researchToAppFlow } from './flows/research-to-app-trial';
import { compileWorkflow, executeWorkflow } from 'bilko-flow';

async function main() {
  console.log('🚀 Initializing Research-to-App Trials with Open-Source Models');
  
  // Register open-source model adapters
  registerOpenSourceAdapters();
  console.log('✅ Registered open-source adapters:', Object.keys(OPEN_SOURCE_MODELS));
  
  // Compile the workflow
  console.log('📋 Compiling research-to-app trial workflow...');
  const compiledWorkflow = compileWorkflow(researchToAppFlow);
  console.log('✅ Workflow compiled successfully');
  
  // Example execution parameters
  const executionParams = {
    researchTopic: 'AI-powered code review assistant that provides real-time feedback on code quality and security vulnerabilities',
    
    // Model configurations
    modelConfigs: {
      ollama: {
        baseUrl: 'http://localhost:11434',
        apiKey: 'not-required'
      },
      vllm: {
        baseUrl: 'http://localhost:8000',
        apiKey: 'your-vllm-api-key'
      }
    },
    
    // Secret values (in production, these would come from secure storage)
    secrets: {
      DATABASE_URL: 'postgresql://localhost:5432/research_app',
      JWT_SECRET: 'your-jwt-secret-here'
    }
  };
  
  console.log('🔧 Starting workflow execution...');
  console.log(`📝 Research Topic: ${executionParams.researchTopic}`);
  
  try {
    const result = await executeWorkflow(compiledWorkflow, executionParams);
    
    console.log('\n✅ Workflow Execution Results:');
    console.log('================================');
    
    // Display results from each step
    for (const [stepId, stepResult] of Object.entries(result.outputs)) {
      console.log(`\n📋 ${stepId}:`);
      console.log('─'.repeat(50));
      if (typeof stepResult === 'string') {
        console.log(stepResult.slice(0, 500) + (stepResult.length > 500 ? '...' : ''));
      } else {
        console.log(JSON.stringify(stepResult, null, 2));
      }
    }
    
    console.log('\n🎉 Research-to-App trial completed successfully!');
    console.log(`⏱️ Total execution time: ${result.metadata.duration}ms`);
    console.log(`📊 Steps executed: ${result.metadata.stepsExecuted}`);
    
  } catch (error) {
    console.error('❌ Workflow execution failed:', error);
    
    if (error instanceof Error && 'step' in error) {
      console.error(`💥 Failed at step: ${error.step}`);
      console.error(`🔧 Suggested fix: ${error.suggestedFix}`);
    }
  }
}

// Check if required services are available
async function checkServices() {
  console.log('🔍 Checking required services...');
  
  const services = [
    { name: 'Ollama', url: 'http://localhost:11434/api/tags' },
    { name: 'vLLM', url: 'http://localhost:8000/v1/models' }
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url);
      if (response.ok) {
        console.log(`✅ ${service.name} is running`);
      } else {
        console.log(`⚠️ ${service.name} responded with ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${service.name} is not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`📖 Start ${service.name} before running the workflow`);
    }
  }
}

// Run the application
if (require.main === module) {
  checkServices()
    .then(() => main())
    .catch(console.error);
}

export { main, checkServices };