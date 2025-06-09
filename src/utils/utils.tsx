import { Ingredient, Recipe, RecipeStep } from "./types";

export const unitOptions = {
  g: "גרמים (g)",
  kg: "קילוגרמים (kg)",
  ml: "מיליליטרים (ml)",
  l: "ליטרים (l)",
  tsp: "כפיות (tsp)",
  tbsp: "כפות (tbsp)",
  cup: "כוסות",
  pcs: "חתיכות",
} as const;

export const getStepForUnit = (unit: keyof typeof unitOptions) => {
  switch (unit) {
    case "g":
    case "ml":
      return 10;
    case "kg":
    case "l":
      return 0.1;
    case "tsp":
    case "tbsp":
      return 0.5;
    case "cup":
      return 0.25;
    case "pcs":
    default:
      return 1;
  }
};

export async function uploadImageToBB(imageData: string | ArrayBuffer | null) {
  if (!imageData) {
    throw new Error("No image data provided");
  }

  let blob;
  if (typeof imageData === "string") {
    // If it's a base64 string, convert it to a Blob
    const byteCharacters = atob(imageData.split(",")[1]); // Remove base64 prefix
    const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    blob = new Blob([byteArray], { type: "image/png" }); // Adjust type if needed
  } else if (imageData instanceof ArrayBuffer) {
    // If it's an ArrayBuffer, directly create a Blob
    blob = new Blob([imageData], { type: "image/png" }); // Adjust type if needed
  } else {
    throw new Error("Invalid image data type");
  }

  const formData = new FormData();
  formData.append("image", blob);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMG_BB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return data.data.url; // Return the uploaded image URL
}

export async function extractRecipeFromText(rawText: string): Promise<Recipe> {
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  const MODEL_NAME = "gpt-4.1-mini";

  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error("Missing VITE_OPENAI_API_KEY in environment");
  }
  const systemPrompt = `
You are RecipeGPT, a JSON extraction engine.  ⬇️

1. **Output only** a single JSON object matching exactly this TypeScript \`Recipe\`. **No** markdown, commentary, or extra fields.
2. Every keys of the object must be exactly as the types defined.
3. The rest of the values must be in Hebrew only

TypeScript definitions (replicate verbatim in the JSON):

export type Ingredient = {
  name: string;
  amount: number;
  unit: "g" | "kg" | "ml" | "l" | "tsp" | "tbsp" | "cup" | "pcs";
  optional?: boolean;
  notes?: string;
};

export type RecipeStep = {
  description: string;
};

export type Recipe = {
  id: string;
  name: string;
  tags: string[];
  pictureUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
};

### Example  
Input text: """תיאור מתכון…"""  
Output JSON:  
{
  "id": "slug-באותיות-קטנות",
  "name": "שם המתכון בעברית",
  "tags": ["תג1","תג2"],
  "pictureUrl": "https://...",
  "ingredients": [
    { "name":"מרכיב","amount":1,"unit":"pcs" }
  ],
  "steps": [
    { "description":"תיאור הצעד" }
  ],
  "prepTime":10,
  "cookTime":30,
  "servings":4
}

Now: Extract a \`Recipe\` JSON from the raw text send to you.`;

  const userPrompt = `
The raw text:
  """${rawText}"""
`;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY} `,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() },
      ],
      temperature: 0,
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err} `);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  // הצפי: choices[0].message.content הוא רק ה-JSON של Recipe
  try {
    const recipe = JSON.parse(data.choices[0].message.content) as Recipe;
    return recipe;
  } catch {
    throw new Error(
      "שגיאה בפיענוח ה-JSON מה-OpenAI – בדוק שהמודל החזיר JSON תקין בלבד"
    );
  }
}

const validUnits = Object.keys(unitOptions);

function isValidUnit(unit: unknown): unit is keyof typeof unitOptions {
  return typeof unit === 'string' && validUnits.includes(unit);
}

function sanitizeIngredient(raw: Partial<Ingredient> = {}): Ingredient | null {
  if (
    typeof raw.name !== 'string' ||
    typeof raw.amount !== 'number' ||
    !isValidUnit(raw.unit)
  ) {
    return null;
  }

  const ingredient: Ingredient = {
    name: raw.name,
    amount: raw.amount,
    unit: raw.unit,
  };

  if (typeof raw.optional === 'boolean') {
    ingredient.optional = raw.optional;
  }

  if (typeof raw.notes === 'string') {
    ingredient.notes = raw.notes;
  }

  return ingredient;
}

function sanitizeStep(raw: Partial<RecipeStep> = {}): RecipeStep | null {
  if (typeof raw.description !== 'string') return null;
  return { description: raw.description };
}

export function validateRecipe(raw: Partial<Recipe> = {}): Recipe | null {
  if (
    typeof raw !== 'object' ||
    typeof raw.id !== 'string' ||
    typeof raw.name !== 'string' ||
    !Array.isArray(raw.tags) ||
    !Array.isArray(raw.ingredients) ||
    !Array.isArray(raw.steps)
  ) {
    return null;
  }

  const ingredients = raw.ingredients
    .map(sanitizeIngredient)
    .filter((i): i is Ingredient => i !== null);

  const steps = raw.steps
    .map(sanitizeStep)
    .filter((s): s is RecipeStep => s !== null);

  const recipe: Recipe = {
    id: raw.id,
    name: raw.name,
    tags: raw.tags.filter((tag: unknown) => typeof tag === 'string'),
    ingredients,
    steps,
  };

  if (typeof raw.pictureUrl === 'string') {
    recipe.pictureUrl = raw.pictureUrl;
  }

  if (typeof raw.prepTime === 'number') {
    recipe.prepTime = raw.prepTime;
  }

  if (typeof raw.cookTime === 'number') {
    recipe.cookTime = raw.cookTime;
  }

  if (typeof raw.servings === 'number') {
    recipe.servings = raw.servings;
  }

  return recipe;
}