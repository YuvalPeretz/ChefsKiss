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
