import { ClockCircleOutlined } from "@ant-design/icons";
import { Checkbox, Descriptions, Flex, Image, List, Modal, Space, Tag, theme, Typography } from "antd";
import { useAtom } from "jotai";
import { FaExclamation, FaQuestion, FaUtensils } from "react-icons/fa";
import { currentRecipeAtom, isModalVisibleAtom, isViewModalVisibleAtom, currentStepAtom } from "../../atom";
import { unitOptions } from "../../utils/utils";
import OverflowTags from "../OverflowTags/OverflowTags";

type RecipeViewerProps = {};

const { Title, Text } = Typography;

export default function RecipeViewer({ }: RecipeViewerProps) {
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom);
  const setIsModalVisible = useAtom(isModalVisibleAtom)[1];
  const [isViewModalVisible, setIsViewModalVisible] = useAtom(isViewModalVisibleAtom);
  const setCurrentStep = useAtom(currentStepAtom)[1];
  const {
    token: { colorSuccess, colorInfo, paddingXXS },
  } = theme.useToken();

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsViewModalVisible(false);
    setCurrentRecipe(null);
    setCurrentStep(0);
  };

  const highlightIngredients = (description: string, ingredients: string[]) => {
    const parts = description.split(new RegExp(`(${ingredients.join("|")})`, "gi"));
    return parts.map((part, index) =>
      ingredients.map((ingredient) => ingredient?.toLowerCase()).includes(part?.toLowerCase()) ? (
        <Tag key={index} style={{ margin: 0, paddingRight: paddingXXS, paddingLeft: paddingXXS }} color="geekblue">
          {part}
        </Tag>
      ) : (
        part
      )
    );
  };

  return (
    <Modal
      title={
        <Space>
          <Title style={{ margin: 0 }} level={3}>
            {currentRecipe?.name || "פרטי מתכון"}
          </Title>
          {currentRecipe?.pictureUrl && (
            <Image src={currentRecipe?.pictureUrl} style={{ borderRadius: "100%", width: 50, height: 50 }} />
          )}
        </Space>
      }
      open={isViewModalVisible}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 800 }}
    >
      <Descriptions
        column={1}
        //@ts-ignore
        items={[
          {
            children: <OverflowTags tags={currentRecipe?.tags || []} />,
          },
          currentRecipe?.prepTime
            ? {
              label: (
                <Text strong>
                  <ClockCircleOutlined /> הכנה דקות
                </Text>
              ),
              children: currentRecipe?.prepTime + " דקות",
            }
            : null,
          currentRecipe?.cookTime
            ? {
              label: (
                <Text strong>
                  <ClockCircleOutlined /> זמן בישול
                </Text>
              ),
              children: currentRecipe?.cookTime + " דקות",
            }
            : null,
          currentRecipe?.servings
            ? {
              label: (
                <Text strong>
                  <FaUtensils /> מס' מנות
                </Text>
              ),
              children: currentRecipe?.servings,
            }
            : null,
        ].filter(Boolean)}
      />
      {currentRecipe && (
        <>
          <List
            header={<Title level={4}>מרכיבים 🛒</Title>}
            dataSource={currentRecipe.ingredients.sort((a, b) => Number(a.optional ?? 0) - Number(b.optional ?? 0))}
            renderItem={({ amount, name, unit, notes, optional }) => (
              <List.Item>
                <Flex vertical>
                  <Space>
                    <Checkbox />
                    <Text>
                      {optional ? (
                        <FaQuestion style={{ color: colorInfo }} />
                      ) : (
                        <FaExclamation style={{ color: colorSuccess }} />
                      )}{" "}
                      {name} - {amount} {unitOptions[unit]}
                    </Text>
                    {notes && <Text type="secondary">הערות: {notes}</Text>}
                  </Space>
                </Flex>
              </List.Item>
            )}
          />

          <List
            header={<Title level={4}>סדר הכנה 📜</Title>}
            dataSource={currentRecipe.steps}
            renderItem={({ description }, i) => (
              <List.Item>
                <Text>
                  <Space align="start">
                    <Checkbox />
                    <Text ellipsis strong>
                      {i + 1}.{" "}
                    </Text>
                    <Text>
                      {highlightIngredients(
                        description,
                        currentRecipe.ingredients.map((ing) => ing.name)
                      )}
                    </Text>
                  </Space>
                </Text>
              </List.Item>
            )}
          />
        </>
      )}
    </Modal>
  );
}
