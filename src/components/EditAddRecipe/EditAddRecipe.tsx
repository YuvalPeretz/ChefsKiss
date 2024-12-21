import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Steps,
  Tag,
  theme,
  Typography,
} from "antd";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { currentRecipeAtom, isModalVisibleAtom, isViewModalVisibleAtom, currentStepAtom } from "../../atom";
import { Recipe, Ingredient } from "../../utils/types";
import { unitOptions, getStepForUnit } from "../../utils/utils";
import useRecipes from "../../hooks/useRecipes";

type EditAddRecipeProps = {};

const { Title } = Typography;

export default function EditAddRecipe({}: EditAddRecipeProps) {
  const { addRecipe, removeRecipe, refreshRecipes } = useRecipes();
  const [form] = Form.useForm();
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom);
  const [isModalVisible, setIsModalVisible] = useAtom(isModalVisibleAtom);
  const setIsViewModalVisible = useAtom(isViewModalVisibleAtom)[1];
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const {
    token: { marginSM },
  } = theme.useToken();
  const initialValues = useMemo(() => currentRecipe || {}, [currentRecipe, isModalVisible]);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsViewModalVisible(false);
    setCurrentRecipe(null);
    setCurrentStep(0);
    form.resetFields();
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
          removeRecipe(currentRecipe.id).then(() =>
            addRecipe(newRecipe).then(() => refreshRecipes().then(message.success("מתכון עודכן בהצלחה")))
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
  };

  return (
    <Modal
      title={currentRecipe ? "ערוך מתכון" : "הוסף מתכון"}
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
          },
          {
            title: "מרכיבים 🛒",
          },
          {
            title: "סדר הכנה 📜",
          },
        ]}
      />
      <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={initialValues}>
        <div style={{ display: currentStep === 0 ? "block" : "none" }}>
          <Form.Item name="name" label="שם מתכון" rules={[{ required: true, message: "הזן שם מתכון" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="pictureUrl" label="קישור לתמונה">
            <Input />
          </Form.Item>
          <Form.Item name="prepTime" label="זמן הכנה (בדקות)">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="cookTime" label="זמן בישול (בדקות)">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="servings" label="מספר מנות">
            <InputNumber min={1} />
          </Form.Item>
        </div>
        <div style={{ display: currentStep === 1 ? "block" : "none" }}>
          <Form.List name="ingredients" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} style={{ width: "100%" }}>
                    <Form.Item
                      {...field}
                      name={[field.name, "name"]}
                      rules={[{ required: true, message: "חסר שם מרכיב" }]}
                    >
                      <Input placeholder="שם מרכיב" style={{ width: "100%" }} />
                    </Form.Item>
                    <Space>
                      <Form.Item
                        {...field}
                        name={[field.name, "unit"]}
                        rules={[{ required: true, message: "חסר יחידות מידה" }]}
                      >
                        <Select
                          defaultValue={"g"}
                          style={{ width: "100%" }}
                          options={Object.entries(unitOptions).map(([value, label]) => ({ label, value }))}
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, "amount"]}
                        rules={[{ required: true, message: "חסר כמות" }]}
                      >
                        <InputNumber
                          min={0}
                          step={getStepForUnit(form.getFieldValue(["ingredients", field.name, "unit"]) || "pcs")}
                          style={{ width: "100%", maxWidth: 75 }}
                        />
                      </Form.Item>
                    </Space>
                    <Form.Item>
                      <Button onClick={() => remove(field.name)} icon={<DeleteOutlined />} danger type="primary" />
                    </Form.Item>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    הוסף מרכיב
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
        <div style={{ display: currentStep === 2 ? "block" : "none" }}>
          <Form.List name="steps" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Flex vertical>
                  <Title level={4}>מרכיבים:</Title>
                  <Space wrap>
                    {form.getFieldValue("ingredients")?.map((ing: Ingredient, index: number) => (
                      <Tag
                        key={index}
                        onClick={() => {
                          const textarea = document.getElementById(`step-${fields[0].key}`) as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText = text.substring(0, start) + ing.name + text.substring(end);
                            form.setFieldsValue({ steps: [{ description: newText }] });
                            textarea.focus();
                            textarea.setSelectionRange(start + ing.name.length, start + ing.name.length);
                          }
                        }}
                      >
                        {ing.name}
                      </Tag>
                    ))}
                  </Space>
                </Flex>
                {fields.map((field, index) => (
                  <Space direction="vertical" key={field.key} style={{ width: "100%" }}>
                    <Flex justify="space-between">
                      <Title level={5} style={{ margin: 0 }}>
                        צעד מס' {index + 1}:
                      </Title>
                      <Button onClick={() => remove(field.name)} icon={<DeleteOutlined />} danger type="primary" />
                    </Flex>
                    <Form.Item
                      {...field}
                      name={[field.name, "description"]}
                      rules={[{ required: true, message: "Missing step description" }]}
                    >
                      <Input.TextArea id={`step-${field.key}`} rows={4} placeholder="הסבר את צעדי הפעולה שעושים" />
                    </Form.Item>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    הוסף פעולה
                  </Button>
                </Form.Item>
              </Space>
            )}
          </Form.List>
        </div>
        <Form.Item>
          <Flex justify="space-between">
            {currentStep > 0 && <Button onClick={prevStep}>אחורה</Button>}
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
