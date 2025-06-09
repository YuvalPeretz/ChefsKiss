import { Recipe } from '../utils/types';

export type SendMessageType = { body?: unknown; endpoint: string; props?: RequestInit };

async function sendMessage({ body, endpoint, props }: SendMessageType) {
  return (
    await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      ...props,
    })
  ).json();
}

const Server = {
  Recipe: {
    AI: (prompt: string): Promise<{ recipe: Recipe }> =>
      sendMessage({ body: { prompt }, endpoint: 'recipe/ai' }),
  },
};

export default Server;
