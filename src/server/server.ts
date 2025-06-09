import RecipeEndpoints from './Recipe/Recipe';

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
  Recipe: RecipeEndpoints(sendMessage),
};

export default Server;
