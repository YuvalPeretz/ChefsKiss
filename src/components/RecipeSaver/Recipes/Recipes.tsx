import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Dropdown, Empty, Flex, Image, message, Spin, theme } from "antd";
import { useAtom } from "jotai";
import {
  recipesAtom,
  searchQueryAtom,
  currentRecipeAtom,
  isViewModalVisibleAtom,
  isModalVisibleAtom,
  currentStepAtom,
} from "../../../atom";
import { Recipe } from "../../../utils/types";
import useRecipes from "../../../hooks/useRecipes";
import useResponsive from "../../../hooks/useResponsive";
import OverflowTags from "../../OverflowTags/OverflowTags";

type RecipesProps = {};

export default function Recipes({}: RecipesProps) {
  const { removeRecipe, refreshRecipes } = useRecipes();
  const [recipes] = useAtom(recipesAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const setCurrentRecipe = useAtom(currentRecipeAtom)[1];
  const setIsViewModalVisible = useAtom(isViewModalVisibleAtom)[1];
  const setIsModalVisible = useAtom(isModalVisibleAtom)[1];
  const setCurrentStep = useAtom(currentStepAtom)[1];
  const {
    token: { padding },
  } = theme.useToken();
  const { isWidthBroken } = useResponsive({ breakpoint: { width: 610 } });

  const isSmall = isWidthBroken;

  const handleDelete = (id: string) => {
    removeRecipe(id).then(() => refreshRecipes().then(message.success("מתכון נמחק בהצלחה")));
  };

  const showEditModal = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setCurrentStep(0);
    setTimeout(() => {
      setIsModalVisible(true);
    }, 1);
  };

  const showViewModal = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setIsViewModalVisible(true);
  };

  const filteredRecipes = recipes?.filter((recipe) =>
    searchQuery?.length
      ? recipe.name?.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes((searchQuery || "").toLowerCase()))
      : true
  );

  return !recipes ? (
    <Spin fullscreen size="large" tip="טוען מתכונים" />
  ) : filteredRecipes?.length ? (
    <Flex gap={padding} wrap align="start" justify="center" style={{ padding, width: "100%" }}>
      {filteredRecipes?.map((recipe) => (
        <Card
          key={recipe.id}
          style={{
            width: isSmall ? "100%" : 300,
            height: "100%",
            maxHeight: 250,
          }}
          actions={[
            <Button icon={<EyeOutlined />} onClick={() => showViewModal(recipe)}>
              צפה
            </Button>,
            <Button icon={<EditOutlined />} onClick={() => showEditModal(recipe)}>
              ערוך
            </Button>,
            <Dropdown
              menu={{
                items: [
                  {
                    key: "delete",
                    icon: <DeleteOutlined />,
                    label: "מחק",
                    onClick: () => handleDelete(recipe.id),
                    danger: true,
                  },
                ],
              }}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>,
          ]}
        >
          <Card.Meta
            avatar={
              recipe.pictureUrl && (
                <Image src={recipe.pictureUrl} style={{ borderRadius: "100%", width: 50, height: 50 }} />
              )
            }
            title={recipe.name}
            description={
              <>
                <OverflowTags tags={recipe.tags || []} />
                <Descriptions
                  style={{ maxWidth: 300 }}
                  column={1}
                  //@ts-ignore
                  items={[
                    recipe.ingredients.length
                      ? { style: { paddingBottom: 0 }, label: "מצרכים", children: recipe.ingredients.length }
                      : null,
                    recipe.steps.length
                      ? { style: { paddingBottom: 0 }, label: "צעדים", children: recipe.steps.length }
                      : null,
                    recipe.prepTime
                      ? { style: { paddingBottom: 0 }, label: "זמן הכנה", children: `${recipe.prepTime} דקות` }
                      : null,
                    recipe.cookTime
                      ? { style: { paddingBottom: 0 }, label: "זמן בישול", children: `${recipe.cookTime} דקות` }
                      : null,
                  ].filter(Boolean)}
                />
              </>
            }
          />
        </Card>
      ))}
    </Flex>
  ) : (
    <Empty style={{ padding }} description="אין מתכונים/סיננתם הכל" />
  );
}
