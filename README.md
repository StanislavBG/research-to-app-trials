# Research-to-App Trials

A complex flow application built with bilko-flow that transforms research concepts into functional application prototypes using only open-source models.

## Architecture

This application demonstrates a sophisticated "flow of flows" architecture where:

- **Core Engine**: bilko-flow provides the deterministic workflow execution
- **Model Layer**: Open-source LLMs (Ollama, vLLM, TGI) handle AI tasks
- **Flow Orchestration**: Multi-step workflow transforms research → architecture → code → deployment

## Features

### 🤖 Open-Source Model Support
- **Ollama**: Local LLM serving (Llama3, CodeLlama, Mistral)
- **vLLM**: High-performance inference engine
- **TGI**: Hugging Face Text Generation Inference
- **Custom Adapters**: Extensible model integration pattern

### 🔄 Complex Workflow Stages
1. **Research Analysis**: Break down concepts into technical requirements
2. **Architecture Design**: Create system architecture and data flow
3. **Project Generation**: Generate boilerplate and structure
4. **Component Development**: Implement core TypeScript components
5. **Testing Setup**: Create comprehensive test suites
6. **Documentation**: Generate API docs and guides
7. **Deployment**: Docker/Kubernetes configuration
8. **Quality Assurance**: Review and validate outputs

### 🛡️ Deterministic Execution
- **Pure Determinism**: Same inputs → same outputs
- **Audit Trail**: Complete execution history
- **Error Recovery**: Resilient JSON parsing and retry logic
- **RBAC**: Role-based access control for production use

## Quick Start

### Prerequisites

1. **Node.js 18+**: `npm install`
2. **Ollama**: `curl -fsSL https://ollama.ai/install.sh | sh`
3. **Pull Models**: 
   ```bash
   ollama pull llama3:8b
   ollama pull codellama
   ollama pull mistral
   ```

### Installation

```bash
# Install dependencies
npm install

# Start local model services
ollama serve

# Run the workflow
npm run dev
```

## Usage

### Basic Execution

```typescript
import { main } from './src/index';

// Run with default research topic
main();

// Or customize the research topic
const customParams = {
  researchTopic: 'Your custom research idea here...',
  modelConfigs: {
    ollama: { baseUrl: 'http://localhost:11434' }
  }
};
```

### Custom Model Configuration

```typescript
import { registerLLMAdapter } from 'bilko-flow';

// Add your own model adapter
registerLLMAdapter('custom-model', async (options) => {
  // Your implementation here
  return { content: response, usage: tokenInfo };
});
```

## Open-Source Model Compatibility

| Model | Provider | Purpose | Status |
|-------|----------|---------|--------|
| Llama3 8B | Ollama | General reasoning | ✅ Tested |
| CodeLlama | Ollama | Code generation | ✅ Tested |
| Mistral | Ollama | Analysis tasks | ✅ Tested |
| Mixtral | Ollama | Complex reasoning | 🔄 Testing |
| Qwen | Ollama | Multilingual | 🔄 Testing |

## Development

### Project Structure

```
src/
├── adapters/           # Open-source model adapters
│   └── opensource-llm.ts
├── flows/              # Workflow definitions
│   └── research-to-app-trial.ts
├── models/             # Model configurations
├── index.ts           # Main entry point
└── types.ts           # TypeScript definitions
```

### Adding New Workflows

1. Create workflow definition in `src/flows/`
2. Register any custom step handlers
3. Add model configurations
4. Test with `npm run test`

### Testing

```bash
# Run unit tests
npm run test

# Run integration tests (requires running models)
npm run test:integration

# Performance benchmarks
npm run test:benchmark
```

## Production Deployment

### Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY bilko-flow/ ./bilko-flow/
CMD ["node", "dist/index.js"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: research-app-trials
spec:
  replicas: 3
  selector:
    matchLabels:
      app: research-app-trials
  template:
    spec:
      containers:
      - name: app
        image: research-app-trials:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
```

## Bilko-Flow Critique

See [OPEN_SOURCE_CRITIQUE.md](./OPEN_SOURCE_CRITIQUE.md) for detailed analysis of bilko-flow's open-source model limitations and recommended improvements.

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Add streaming response support
- [ ] Implement model fine-tuning workflows
- [ ] Add GPU resource management
- [ ] Create visual flow editor
- [ ] Support for multi-modal models
- [ ] Integration with vector databases

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: Wiki

---

Built with ❤️ using bilko-flow and open-source models.