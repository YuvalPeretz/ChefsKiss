import { Recipe } from '../../utils/types';
import { SendMessageType } from '../server';

export default function RecipeEndpoints(
  sendMessage: ({ body, endpoint, props }: SendMessageType) => Promise<any>
) {
  return {
    AI: async (prompt: string): Promise<{ recipe: Recipe }> =>
      sendMessage({ body: { prompt }, endpoint: 'recipe/ai' }),
  };
}
