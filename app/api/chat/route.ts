import { streamText, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Get messages, model, and conversationId from the body
    const { messages, model }: { messages: CoreMessage[], model: string } = await req.json();

    // Ensure required body data is present
    if (!messages || !model) {
      return new Response(JSON.stringify({ error: 'Missing required fields in body (messages, model)' }), {
         status: 400,
         headers: { 'Content-Type': 'application/json' }
      });
    }

    const [provider, modelId] = model.split('/');

    let result;

    switch (provider) {
      case 'openai':
        result = await streamText({ model: openai(modelId), messages: messages, temperature: 1 });
        return result.toDataStreamResponse(
          {
            getErrorMessage: (error) => {
              return "An error occurred";
            }
          }
        );

      case 'anthropic':
        result = await streamText({ model: anthropic(modelId), messages: messages, temperature: 1 });
        return result.toDataStreamResponse(
          {
            getErrorMessage: (error) => {
              return "An error occurred";
            }
          }
        );

      case 'google':
        result = await streamText({ model: google(modelId), messages: messages, temperature: 1 });
        return result.toDataStreamResponse(
          {
            getErrorMessage: (error) => {
              return "An error occurred";
            }
          }
        );

      default:
        return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

  } catch (error: any) {
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    const errorMessage = error.message || 'An unexpected error occurred';
    const errorStatus = error.status || error.statusCode || 500;
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: errorStatus,
        headers: { 'Content-Type': 'application/json' }
    });
  }
} 