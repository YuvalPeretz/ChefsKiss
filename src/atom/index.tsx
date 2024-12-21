import { atom } from "jotai";
import { Recipe } from "../utils/types";

export const recipesAtom = atom<Recipe[] | null>(null);
export const searchQueryAtom = atom("");
export const isModalVisibleAtom = atom(false);
export const isViewModalVisibleAtom = atom(false);
export const currentRecipeAtom = atom<Recipe | null>(null);
export const currentStepAtom = atom(0);
// export const formAtom = atom(Form.useForm());
