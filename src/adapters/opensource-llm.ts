import { registerLLMAdapter, LLMCallOptions, LLMRawResponse, LLMProvider } from 'bilko-flow';

// Ollama adapter for local open-source models
export const ollamaAdapter = async (options: LLMCallOptions): Promise<LLMRawResponse> => {
  const baseUrl = options.baseUrl || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        prompt: options.messages[0]?.content || '',
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2048,
        },
        stream: false,
        format: options.responseFormat?.type === 'json_object' ? 'json' : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.response,
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  } catch (error) {
    throw new Error(`Ollama adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// vLLM adapter for high-performance inference
export const vllmAdapter = async (options: LLMCallOptions): Promise<LLMRawResponse> => {
  const baseUrl = options.baseUrl || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${baseUrl}/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        prompt: options.messages[0]?.content || '',
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        echo: false,
        ...(options.responseFormat?.type === 'json_object' && {
          guided_json: {}, // vLLM guided decoding
        }),
      }),
    });

    if (!response.ok) {
      throw new Error(`vLLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    if (!choice) {
      throw new Error('No completion returned from vLLM');
    }

    return {
      content: choice.text,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    throw new Error(`vLLM adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Text Generation Inference (TGI) adapter
export const tgiAdapter = async (options: LLMCallOptions): Promise<LLMRawResponse> => {
  const baseUrl = options.baseUrl || 'http://localhost:8080';
  
  try {
    const response = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        inputs: options.messages[0]?.content || '',
        parameters: {
          max_new_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          return_full_text: false,
          ...(options.responseFormat?.type === 'json_object' && {
            response_format: { type: 'json_object' },
          }),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`TGI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.generated_text || data[0]?.generated_text;
    
    return {
      content: generatedText,
      usage: {
        prompt_tokens: data.details?.prompt_tokens || 0,
        completion_tokens: data.details?.generated_tokens || 0,
        total_tokens: (data.details?.prompt_tokens || 0) + (data.details?.generated_tokens || 0),
      },
    };
  } catch (error) {
    throw new Error(`TGI adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Register all open-source adapters
export function registerOpenSourceAdapters(): void {
  registerLLMAdapter('ollama' as LLMProvider, ollamaAdapter);
  registerLLMAdapter('vllm' as LLMProvider, vllmAdapter);
  registerLLMAdapter('tgi' as LLMProvider, tgiAdapter);
}

// Export supported open-source models
export const OPEN_SOURCE_MODELS = {
  ollama: [
    'llama2',
    'llama3:8b',
    'llama3:70b',
    'codellama',
    'mistral',
    'mixtral',
    'qwen:7b',
    'phi3',
  ],
  vllm: [
    'meta-llama/Llama-2-7b-chat-hf',
    'meta-llama/Llama-3-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.1',
    'codellama/CodeLlama-7b-Instruct-hf',
  ],
  tgi: [
    'meta-llama/Llama-2-7b-chat-hf',
    'meta-llama/Llama-3-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.1',
  ],
} as const;