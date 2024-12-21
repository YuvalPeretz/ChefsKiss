import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Empty, Flex, message, Spin, theme, Typography } from "antd";
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
import Storage from "../../../managers/Storage";
import useRecipes from "../../../hooks/useRecipes";
import useResponsive from "../../../hooks/useResponsive";

type RecipesProps = {};

const { Text } = Typography;

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
  const { isWidthBroken: isSmall } = useResponsive({ breakpoint: { width: 610 } });

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
    searchQuery?.length ? recipe.name && recipe.name.toLowerCase().includes((searchQuery || "").toLowerCase()) : true
  );

  return !recipes ? (
    <Spin fullscreen size="large" tip="טוען מתכונים" />
  ) : filteredRecipes?.length ? (
    <Flex wrap align="start" style={{ padding, width: "100%", height: "100%" }}>
      {filteredRecipes?.map((recipe) => (
        <Card
          key={recipe.id}
          style={{ minWidth: 300, width: isSmall ? "100%" : undefined }}
          cover={recipe.pictureUrl && <img alt={recipe.name} src={recipe.pictureUrl} />}
          actions={[
            <Button icon={<EyeOutlined />} onClick={() => showViewModal(recipe)}>
              צפה
            </Button>,
            ...(Storage.getIsAuthor()
              ? [
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
                        },
                      ],
                    }}
                  >
                    <Button icon={<MoreOutlined />} />
                  </Dropdown>,
                ]
              : []),
          ]}
        >
          <Card.Meta
            title={recipe.name}
            description={
              <>
                <Text>מצרכים: {recipe.ingredients.length}</Text>
                <br />
                <Text>צעדים: {recipe.steps.length}</Text>
                {recipe.prepTime && (
                  <>
                    <br />
                    <Text>זמן הכנה: {recipe.prepTime} דקות</Text>
                  </>
                )}
                {recipe.cookTime && (
                  <>
                    <br />
                    <Text>זמן בישול: {recipe.cookTime} דקות</Text>
                  </>
                )}
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
