import { ClockCircleOutlined } from "@ant-design/icons";
import { Descriptions, Image, List, Modal, Space, Typography } from "antd";
import { useAtom } from "jotai";
import { FaUtensils } from "react-icons/fa";
import { currentRecipeAtom, isModalVisibleAtom, isViewModalVisibleAtom, currentStepAtom } from "../../atom";
import { unitOptions } from "../../utils/utils";
import OverflowTags from "../OverflowTags/OverflowTags";

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
      title={
        <Space>
          <Title style={{ margin: 0 }} level={3}>
            {currentRecipe?.name || "פרטי מתכון"}
          </Title>
          <Image src={currentRecipe?.pictureUrl} style={{ borderRadius: "100%", width: 50, height: 50 }} />
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
            dataSource={currentRecipe.ingredients}
            renderItem={({ amount, name, unit }) => (
              <List.Item>
                <Text>
                  • {name} - {amount} {unitOptions[unit]}
                </Text>
              </List.Item>
            )}
          />

          <List
            header={<Title level={4}>סדר הכנה 📜</Title>}
            dataSource={currentRecipe.steps}
            renderItem={({ description }, i) => (
              <List.Item>
                <Text>
                  <Text strong>{i + 1}. </Text>
                  <Text>{description}</Text>
                </Text>
              </List.Item>
            )}
          />
        </>
      )}
    </Modal>
  );
}
