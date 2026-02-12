import { WorkflowDefinition } from 'bilko-flow';

export const researchToAppFlow: WorkflowDefinition = {
  name: 'research-to-app-trial',
  description: 'Transform research concept into functional application prototype',
  version: '1.0.0',
  determinismGrade: 'pure',
  
  steps: [
    {
      id: 'analyze-research-topic',
      type: 'ai.generate-text',
      config: {
        provider: 'ollama',
        model: 'llama3:8b',
        prompt: `Analyze this research topic and break it down into actionable development tasks:
        
        Research Topic: "{{researchTopic}}"
        
        Provide:
        1. Technical complexity assessment (1-10)
        2. Key technical challenges
        3. Recommended technology stack (open-source only)
        4. Development phases with estimated effort
        5. Risk assessment and mitigation strategies
        
        Format as JSON with keys: complexity, challenges, techStack, phases, risks`,
        responseFormat: { type: 'json_object' },
        maxTokens: 2000,
        temperature: 0.3
      },
      dependencies: []
    },
    
    {
      id: 'design-architecture',
      type: 'ai.generate-text',
      config: {
        provider: 'ollama',
        model: 'llama3:8b',
        prompt: `Design the application architecture based on the research analysis:
        
        Analysis: "{{analyze-research-topic.output}}"
        
        Create a detailed architecture plan:
        1. System components and their relationships
        2. Data flow diagram (text description)
        3. API structure and endpoints
        4. Database schema design
        5. Security considerations
        
        Format as JSON with keys: components, dataFlow, api, database, security`,
        responseFormat: { type: 'json_object' },
        maxTokens: 3000,
        temperature: 0.2
      },
      dependencies: ['analyze-research-topic']
    },
    
    {
      id: 'generate-project-structure',
      type: 'ai.generate-text',
      config: {
        provider: 'ollama',
        model: 'codellama',
        prompt: `Generate the complete project structure and boilerplate code:
        
        Architecture: "{{design-architecture.output}}"
        
        Create:
        1. Directory structure (tree format)
        2. Package.json with open-source dependencies only
        3. Configuration files (typescript, eslint, etc.)
        4. Docker setup for development
        5. CI/CD pipeline using GitHub Actions
        
        Provide as executable code blocks and configuration files.`,
        maxTokens: 4000,
        temperature: 0.1
      },
      dependencies: ['design-architecture']
    },
    
    {
      id: 'create-core-components',
      type: 'ai.generate-text',
      config: {
        provider: 'ollama',
        model: 'codellama',
        prompt: `Implement the core application components:
        
        Architecture: "{{design-architecture.output}}"
        Project Structure: "{{generate-project-structure.output}}"
        
        Generate TypeScript code for:
        1. Main application entry point
        2. Core service classes
        3. Data models and interfaces
        4. API route handlers
        5. Database connection and utilities
        
        Follow the architecture and use only open-source libraries.`,
        maxTokens: 5000,
        temperature: 0.1
      },
      dependencies: ['design-architecture', 'generate-project-structure']
    },
    
    {
      id: 'setup-testing',
      type: 'ai.generate-text',
      config: {
        provider: 'ollama',
        model: 'codellama',
        prompt: `Create comprehensive testing setup:
        
        Architecture: "{{design-architecture.output}}"
        Components: "{{create-core-components.output}}"
        
        Generate:
        1. Unit tests for core functions
        2. Integration tests for API endpoints
        3. E2E test scenarios
        4. Test utilities and mocks
        5. Performance test setup
        
        Use Vitest and Testing Library (open-source).`,
        maxTokens: 4000,
        temperature: 0.1
      },
      dependencies: ['create-core-components']
    },
    
    {
      id: 'create-documentation',
      type: 'ai.generate-text',
      config: {
        provider: 'ollama',
        model: 'llama3:8b',
        prompt: `Generate comprehensive documentation:
        
        Architecture: "{{design-architecture.output}}"
        Implementation: "{{create-core-components.output}}"
        
        Create:
        1. README.md with setup instructions
        2. API documentation (OpenAPI specification)
        3. Developer onboarding guide
        4. Deployment documentation
        5. Contributing guidelines`,
        maxTokens: 3000,
        temperature: 0.2
      },
      dependencies: ['create-core-components']
    },
    
    {
      id: 'setup-deployment',
      type: 'ai.generate-text',
      config: {
        provider: 'ollama',
        model: 'codellama',
        prompt: `Create deployment configuration:
        
        Project: "{{generate-project-structure.output}}"
        Documentation: "{{create-documentation.output}}"
        
        Generate:
        1. Docker Compose for local development
        2. Kubernetes deployment manifests
        3. Nginx configuration
        4. Environment variable templates
        5. Health check endpoints
        
        Focus on self-hosted, open-source solutions.`,
        maxTokens: 3000,
        temperature: 0.1
      },
      dependencies: ['generate-project-structure', 'create-documentation']
    },
    
    {
      id: 'quality-assurance',
      type: 'ai.generate-text',
      config: {
        provider: 'vllm',
        model: 'mistralai/Mistral-7B-Instruct-v0.1',
        prompt: `Perform quality assurance review of the generated application:
        
        Architecture: "{{design-architecture.output}}"
        Code: "{{create-core-components.output}}"
        Tests: "{{setup-testing.output}}"
        Documentation: "{{create-documentation.output}}"
        Deployment: "{{setup-deployment.output}}"
        
        Analyze and report on:
        1. Code quality and best practices
        2. Security vulnerabilities
        3. Performance bottlenecks
        4. Documentation completeness
        5. Deployment readiness
        
        Provide specific recommendations and improvements needed.`,
        maxTokens: 2500,
        temperature: 0.3
      },
      dependencies: ['create-core-components', 'setup-testing', 'create-documentation', 'setup-deployment']
    }
  ],
  
  secrets: [
    {
      name: 'DATABASE_URL',
      description: 'Database connection string'
    },
    {
      name: 'JWT_SECRET',
      description: 'JWT signing secret'
    }
  ],
  
  policies: {
    timeout: 3600, // 1 hour
    retryPolicy: {
      maxRetries: 2,
      backoffStrategy: 'exponential'
    }
  },
  
  notifications: {
    onSuccess: [
      {
        type: 'webhook',
        url: 'https://hooks.slack.com/your-webhook-url',
        payload: { message: 'Research to app trial completed successfully!' }
      }
    ],
    onFailure: [
      {
        type: 'webhook',
        url: 'https://hooks.slack.com/your-webhook-url',
        payload: { message: 'Research to app trial failed!' }
      }
    ]
  }
};