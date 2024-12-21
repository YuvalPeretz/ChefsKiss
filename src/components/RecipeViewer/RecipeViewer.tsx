import { ClockCircleOutlined } from "@ant-design/icons";
import { Flex, List, Modal, Typography } from "antd";
import { useAtom } from "jotai";
import { FaUtensils } from "react-icons/fa";
import { currentRecipeAtom, isModalVisibleAtom, isViewModalVisibleAtom, currentStepAtom } from "../../atom";
import { unitOptions } from "../../utils/utils";

type RecipeViewerProps = {};

const { Title, Text } = Typography;

export default function RecipeViewer({}: RecipeViewerProps) {
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom);
  const setIsModalVisible = useAtom(isModalVisibleAtom)[1];
  const [isViewModalVisible, setIsViewModalVisible] = useAtom(isViewModalVisibleAtom);
  const setCurrentStep = useAtom(currentStepAtom)[1];

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsViewModalVisible(false);
    setCurrentRecipe(null);
    setCurrentStep(0);
  };

  return (
    <Modal
      title={currentRecipe?.name || "פרטי מתכון"}
      open={isViewModalVisible}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 800 }}
    >
      {currentRecipe && (
        <div>
          {currentRecipe.pictureUrl && <img src={currentRecipe.pictureUrl} alt={currentRecipe.name} />}
          <Flex vertical>
            {currentRecipe.prepTime && (
              <Text>
                <ClockCircleOutlined /> זמן הכנה: {currentRecipe.prepTime} דקות
              </Text>
            )}
            {currentRecipe.cookTime && (
              <Text>
                <ClockCircleOutlined /> זמן בישול: {currentRecipe.cookTime} דקות
              </Text>
            )}
            {currentRecipe.servings && (
              <Text>
                <FaUtensils /> מס' מנות: {currentRecipe.servings}
              </Text>
            )}
          </Flex>
          <Title level={4}>מרכיבים 🛒</Title>
          <List
            dataSource={currentRecipe.ingredients}
            renderItem={({ amount, name, unit }) => (
              <List.Item>
                <Text>
                  • {name} - {amount} {unitOptions[unit]}
                </Text>
              </List.Item>
            )}
          />
          <Title level={4}>סדר הכנה 📜</Title>
          <List
            dataSource={currentRecipe.steps}
            renderItem={({ description }, i) => (
              <List.Item>
                <Text>
                  {i + 1}. <Text>{description}</Text>
                </Text>
              </List.Item>
            )}
          />
        </div>
      )}
    </Modal>
  );
}
