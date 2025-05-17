import { Layout } from "antd";
import CustomHeader from "./CustomHeader/CustomHeader";
import Recipes from "./Recipes/Recipes";
import EditAddRecipe from "../EditAddRecipe/EditAddRecipe";
import RecipeViewer from "../RecipeViewer/RecipeViewer";

type RecipeSaverProps = {};

const { Content } = Layout;

export default function RecipeSaver({ }: RecipeSaverProps) {
  return (
    <Layout style={{ height: "100vh", maxHeight: "100vh", width: "100%" }}>
      <CustomHeader />
      <Content style={{ overflowY: "auto", height: "100%" }}>
        <Recipes />
      </Content>
      <EditAddRecipe />
      <RecipeViewer />
    </Layout>
  );
}
