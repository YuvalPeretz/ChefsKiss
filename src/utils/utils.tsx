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
