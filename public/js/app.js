class WorkflowApp {
    constructor() {
        this.currentExecution = null;
        this.stepProgress = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkModelStatus();
        this.setupModelProviderChange();
    }

    bindEvents() {
        const form = document.getElementById('workflow-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.executeWorkflow();
            });
        }

        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    setupModelProviderChange() {
        const providerSelect = document.getElementById('model-provider');
        const modelSelect = document.getElementById('model-name');
        
        const modelOptions = {
            ollama: [
                { value: 'llama3:8b', text: 'Llama3 8B' },
                { value: 'codellama', text: 'CodeLlama' },
                { value: 'mistral', text: 'Mistral' },
                { value: 'mixtral', text: 'Mixtral' },
                { value: 'qwen:7b', text: 'Qwen 7B' },
                { value: 'phi3', text: 'Phi 3' }
            ],
            vllm: [
                { value: 'meta-llama/Llama-2-7b-chat-hf', text: 'Llama2 7B Chat' },
                { value: 'meta-llama/Llama-3-8B-Instruct', text: 'Llama3 8B Instruct' },
                { value: 'mistralai/Mistral-7B-Instruct-v0.1', text: 'Mistral 7B Instruct' },
                { value: 'codellama/CodeLlama-7b-Instruct-hf', text: 'CodeLlama 7B Instruct' }
            ],
            tgi: [
                { value: 'meta-llama/Llama-2-7b-chat-hf', text: 'Llama2 7B Chat' },
                { value: 'meta-llama/Llama-3-8B-Instruct', text: 'Llama3 8B Instruct' },
                { value: 'mistralai/Mistral-7B-Instruct-v0.1', text: 'Mistral 7B Instruct' }
            ]
        };

        providerSelect.addEventListener('change', (e) => {
            const provider = e.target.value;
            const models = modelOptions[provider] || [];
            
            modelSelect.innerHTML = '';
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.value;
                option.textContent = model.text;
                modelSelect.appendChild(option);
            });
        });
    }

    async checkModelStatus() {
        const statusContainer = document.getElementById('model-status');
        statusContainer.innerHTML = '<div class="loading"><div class="spinner"></div>Checking model availability...</div>';

        try {
            const response = await fetch('/api/models/status');
            const data = await response.json();
            
            statusContainer.innerHTML = '';
            data.services.forEach(service => {
                const card = this.createModelStatusCard(service);
                statusContainer.appendChild(card);
            });
        } catch (error) {
            statusContainer.innerHTML = '<div class="error">Failed to check model status</div>';
        }
    }

    createModelStatusCard(service) {
        const card = document.createElement('div');
        card.className = `model-status-card ${service.status}`;
        
        const indicator = document.createElement('div');
        indicator.className = `status-indicator ${service.status}`;
        
        const name = document.createElement('div');
        name.className = 'model-name';
        name.textContent = service.name;
        
        const details = document.createElement('div');
        details.className = 'model-details';
        
        if (service.status === 'online') {
            if (service.details?.models) {
                details.textContent = `${service.details.models.length} models available`;
            } else {
                details.textContent = `Connected at ${service.url}`;
            }
        } else {
            details.textContent = service.error || `Offline (${service.url})`;
        }
        
        card.appendChild(indicator);
        card.appendChild(name);
        card.appendChild(details);
        
        return card;
    }

    async executeWorkflow() {
        const form = document.getElementById('workflow-form');
        const formData = new FormData(form);
        
        const researchTopic = formData.get('researchTopic');
        const provider = formData.get('provider');
        const model = formData.get('model');
        
        if (!researchTopic) {
            alert('Please enter a research topic');
            return;
        }

        this.setLoading(true);
        this.showWorkflowProgress();
        
        const payload = {
            researchTopic,
            modelConfigs: {
                [provider]: {
                    baseUrl: this.getProviderBaseUrl(provider),
                    apiKey: 'not-required'
                }
            }
        };

        try {
            const response = await fetch('/api/workflows/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayResults(result.data);
            } else {
                this.displayError(result.error, result.step);
            }
        } catch (error) {
            this.displayError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    getProviderBaseUrl(provider) {
        const baseUrls = {
            ollama: 'http://localhost:11434',
            vllm: 'http://localhost:8000',
            tgi: 'http://localhost:8080'
        };
        return baseUrls[provider] || 'http://localhost:11434';
    }

    setLoading(loading) {
        const button = document.getElementById('execute-btn');
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        button.disabled = loading;
        btnText.style.display = loading ? 'none' : 'inline';
        btnLoading.style.display = loading ? 'inline' : 'none';
    }

    showWorkflowProgress() {
        const progressSection = document.getElementById('workflow-progress');
        progressSection.style.display = 'block';
        progressSection.classList.add('fade-in');
        
        const stepResults = document.getElementById('step-results');
        stepResults.innerHTML = '';
        
        // Simulate step progress (in real implementation, this would use WebSocket or SSE)
        this.simulateWorkflowProgress();
    }

    simulateWorkflowProgress() {
        const steps = [
            'analyze-research-topic',
            'design-architecture', 
            'generate-project-structure',
            'create-core-components',
            'setup-testing',
            'create-documentation',
            'setup-deployment',
            'quality-assurance'
        ];

        const stepNames = {
            'analyze-research-topic': '🔍 Analyzing Research Topic',
            'design-architecture': '🏗️ Designing Architecture',
            'generate-project-structure': '📁 Generating Project Structure',
            'create-core-components': '💻 Creating Core Components',
            'setup-testing': '🧪 Setting Up Testing',
            'create-documentation': '📚 Creating Documentation',
            'setup-deployment': '🚀 Setting Up Deployment',
            'quality-assurance': '✅ Quality Assurance'
        };

        let currentStep = 0;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const stepResults = document.getElementById('step-results');

        const interval = setInterval(() => {
            if (currentStep >= steps.length) {
                clearInterval(interval);
                progressText.textContent = '✅ Workflow completed!';
                progressFill.style.width = '100%';
                return;
            }

            const stepId = steps[currentStep];
            const stepName = stepNames[stepId];
            
            // Update progress bar
            const progress = ((currentStep + 1) / steps.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = stepName;
            
            // Add step result
            const stepResult = document.createElement('div');
            stepResult.className = 'step-result completed';
            stepResult.innerHTML = `
                <div class="step-name">
                    ${stepName}
                    <span class="step-status completed">✅</span>
                </div>
            `;
            stepResults.appendChild(stepResult);
            
            currentStep++;
        }, 2000); // 2 seconds per step for demo
    }

    displayResults(data) {
        const resultsSection = document.getElementById('results');
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
        
        // Update metrics
        document.getElementById('execution-time').textContent = 
            `${(data.metadata.duration / 1000).toFixed(2)}s`;
        document.getElementById('steps-completed').textContent = 
            data.metadata.stepsExecuted;
        
        // Populate tab content
        this.populateArchitectureTab(data.outputs);
        this.populateCodeTab(data.outputs);
        this.populateDocumentationTab(data.outputs);
        this.populateDeploymentTab(data.outputs);
    }

    populateArchitectureTab(outputs) {
        const architectureTab = document.getElementById('architecture-tab');
        const designOutput = outputs['design-architecture'];
        
        if (designOutput) {
            architectureTab.innerHTML = `
                <div class="code-block">
                    <pre><code class="language-json">${JSON.stringify(JSON.parse(designOutput), null, 2)}</code></pre>
                </div>
            `;
        }
    }

    populateCodeTab(outputs) {
        const codeTab = document.getElementById('code-tab');
        const componentsOutput = outputs['create-core-components'];
        const projectOutput = outputs['generate-project-structure'];
        
        let content = '';
        if (projectOutput) {
            content += '<h3>📁 Project Structure</h3>';
            content += `<div class="code-block"><pre><code>${projectOutput}</code></pre></div>`;
        }
        
        if (componentsOutput) {
            content += '<h3>💻 Core Components</h3>';
            content += `<div class="code-block"><pre><code class="language-typescript">${componentsOutput}</code></pre></div>`;
        }
        
        codeTab.innerHTML = content;
    }

    populateDocumentationTab(outputs) {
        const docTab = document.getElementById('documentation-tab');
        const docOutput = outputs['create-documentation'];
        
        if (docOutput) {
            docTab.innerHTML = `
                <div class="code-block">
                    <pre><code>${docOutput}</code></pre>
                </div>
            `;
        }
    }

    populateDeploymentTab(outputs) {
        const deployTab = document.getElementById('deployment-tab');
        const deployOutput = outputs['setup-deployment'];
        
        if (deployOutput) {
            deployTab.innerHTML = `
                <div class="code-block">
                    <pre><code class="language-yaml">${deployOutput}</code></pre>
                </div>
            `;
        }
    }

    displayError(error, step) {
        const resultsSection = document.getElementById('results');
        resultsSection.style.display = 'block';
        
        let errorMessage = `❌ Workflow execution failed: ${error}`;
        if (step) {
            errorMessage += `\n💥 Failed at step: ${step}`;
        }
        
        resultsSection.innerHTML = `
            <div class="error-message">
                <h3>❌ Execution Failed</h3>
                <pre>${errorMessage}</pre>
            </div>
        `;
    }

    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update panel visibility
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WorkflowApp();
});