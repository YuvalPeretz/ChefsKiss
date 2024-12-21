import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import useDB from "./useDB";
import { Recipe } from "../utils/types";
import { message } from "antd";
import { useAtom } from "jotai";
import { recipesAtom } from "../atom";

type useRecipesProps = {};

const collectionName = "recipes";

export default function useRecipes({}: useRecipesProps = {}) {
  const db = useDB();
  const setRecipes = useAtom(recipesAtom)[1];

  async function getRecipes(): Promise<Recipe[]> {
    try {
      const recipesCollection = collection(db, collectionName);
      const recipes = await getDocs(recipesCollection);

      return recipes.docs.map((doc) => {
        const data = JSON.parse((doc.data().data as string) || "");
        return {
          id: doc.id,
          ...data,
        };
      }) as Recipe[];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async function addRecipe(recipe: Recipe) {
    try {
      const recipesCollection = collection(db, collectionName);
      await addDoc(recipesCollection, { data: JSON.stringify(recipe) });
    } catch (error) {
      message.error("העלאת מתכון נכשלה: " + error);
    }
  }

  async function removeRecipe(id: string) {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      message.error("מחיקת מתכון נכשלה: " + error);
    }
  }

  async function refreshRecipes() {
    await getRecipes().then(setRecipes);
  }

  return {
    getRecipes,
    addRecipe,
    removeRecipe,
    refreshRecipes,
  };
}
