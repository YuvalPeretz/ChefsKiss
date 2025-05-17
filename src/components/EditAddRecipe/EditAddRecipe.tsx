import { Button, Flex, Form, message, Modal, Space, Steps, theme } from "antd";
import { useAtom } from "jotai";
import { currentRecipeAtom, isModalVisibleAtom, isViewModalVisibleAtom, currentStepAtom } from "../../atom";
import { Recipe } from "../../utils/types";
import useRecipes from "../../hooks/useRecipes";
import BasicInfo from "./BasicInfo/BasicInfo";
import Ingredients from "./Ingredients/Ingredients";
import RecipeSteps from "./RecipeSteps/RecipeSteps";
import { useEffect, useState } from "react";

type EditAddRecipeProps = {};

export default function EditAddRecipe({ }: EditAddRecipeProps) {
  const { addRecipe, updateRecipe, refreshRecipes } = useRecipes();
  const [form] = Form.useForm();
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom);
  const [isModalVisible, setIsModalVisible] = useAtom(isModalVisibleAtom);
  const setIsViewModalVisible = useAtom(isViewModalVisibleAtom)[1];
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const {
    token: { marginSM },
  } = theme.useToken();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        direction: "rtl",
        title: "שינויים לא נשמרו",
        content: "האם אתה בטוח שברצונך לצאת בלי לשמור את השינויים?",
        okText: "כן",
        cancelText: "לא",
        onOk: () => {
          setIsModalVisible(false);
          setIsViewModalVisible(false);
          setCurrentRecipe(null);
          setCurrentStep(0);
          form.resetFields();
          setHasUnsavedChanges(false);
        },
      });
    } else {
      setIsModalVisible(false);
      setIsViewModalVisible(false);
      setCurrentRecipe(null);
      setCurrentStep(0);
      form.resetFields();
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const newRecipe: Recipe = {
          id: currentRecipe ? currentRecipe.id : undefined,
          ...values,
          ingredients: values.ingredients || [],
          steps: values.steps || [],
        };

        if (currentRecipe) {
          // Edit existing recipe
          updateRecipe(currentRecipe.id, newRecipe).then(() =>
            refreshRecipes().then(message.success("מתכון עודכן בהצלחה"))
          );
        } else {
          // Add new recipe
          addRecipe(newRecipe).then(() => refreshRecipes().then(message.success("מתכון נוסף בהצלחה")));
        }
        setIsModalVisible(false);
        form.resetFields();
        setCurrentStep(0);
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });

    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    if (currentRecipe) {
      form.setFieldsValue({
        ...currentRecipe,
        ingredients:
          currentRecipe.ingredients.length > 0 ? currentRecipe.ingredients : [{ unit: "g", amount: 1, name: "" }],
        steps: currentRecipe.steps.length > 0 ? currentRecipe.steps : [{ description: "" }],
      });
    } else {
      form.resetFields();
      // Optionally set default values for adding a new recipe
      form.setFieldsValue({
        ingredients: [{ unit: "g", amount: 1, name: "" }],
        steps: [{ description: "" }],
      });
    }
  }, [currentRecipe, form]);

  return (
    <Modal
      destroyOnClose
      title={
        <Space>
          {currentRecipe ? "ערוך מתכון" : "הוסף מתכון"}
          {currentRecipe && (
            <Button type="primary" onClick={() => form.submit()}>
              עדכן
            </Button>
          )}
        </Space>
      }
      open={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 800 }}
    >
      <Steps
        style={{ marginBottom: marginSM }}
        current={currentStep}
        items={[
          {
            title: "מידע בסיסי 📝",
            onClick: () => setCurrentStep(0),
            style: { cursor: "pointer" },
          },
          {
            title: "מרכיבים 🛒",
            onClick: () => setCurrentStep(1),
            style: { cursor: "pointer" },
          },
          {
            title: "סדר הכנה 📜",
            onClick: () => setCurrentStep(2),
            style: { cursor: "pointer" },
          },
        ]}
      />
      <Form form={form} onFinish={handleSubmit} layout="vertical" onValuesChange={() => setHasUnsavedChanges(true)}>
        <div style={{ display: currentStep === 0 ? "block" : "none" }}>
          <BasicInfo form={form} />
        </div>
        <div style={{ display: currentStep === 1 ? "block" : "none" }}>
          <Ingredients form={form} />
        </div>
        <div style={{ display: currentStep === 2 ? "block" : "none" }}>
          <RecipeSteps form={form} />
        </div>
        <Form.Item>
          <Flex justify="space-between">
            <Button onClick={prevStep} disabled={currentStep === 0}>
              אחורה
            </Button>
            {currentStep < 2 && (
              <Button type="primary" onClick={nextStep}>
                הבא
              </Button>
            )}
            {currentStep === 2 && (
              <Button type="primary" onClick={handleSubmit}>
                {currentRecipe ? "עדכן מתכון" : "הוסף מתכון"}
              </Button>
            )}
          </Flex>
        </Form.Item>
      </Form>
    </Modal>
  );
}
