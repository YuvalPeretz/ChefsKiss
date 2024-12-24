import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Flex,
  Form,
  Image,
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
  Upload,
} from "antd";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  currentRecipeAtom,
  isModalVisibleAtom,
  isViewModalVisibleAtom,
  currentStepAtom,
  recipesAtom,
} from "../../atom";
import { Recipe, Ingredient } from "../../utils/types";
import { unitOptions, getStepForUnit, uploadImageToBB } from "../../utils/utils";
import useRecipes from "../../hooks/useRecipes";
import ImgCrop from "antd-img-crop";

type EditAddRecipeProps = {};

const { Title } = Typography;

export default function EditAddRecipe({}: EditAddRecipeProps) {
  const { addRecipe, updateRecipe, refreshRecipes } = useRecipes();
  const [form] = Form.useForm();
  const [recipes] = useAtom(recipesAtom);
  const [currentRecipe, setCurrentRecipe] = useAtom(currentRecipeAtom);
  const [isModalVisible, setIsModalVisible] = useAtom(isModalVisibleAtom);
  const setIsViewModalVisible = useAtom(isViewModalVisibleAtom)[1];
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const {
    token: { marginSM, margin },
  } = theme.useToken();
  const [pictureUrl, setPictureUrl] = useState(currentRecipe?.pictureUrl);

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
  };

  useEffect(() => {
    setPictureUrl(currentRecipe?.pictureUrl);
  }, [currentRecipe]);

  useEffect(() => {
    if (currentRecipe) {
      form.setFieldsValue({
        ...currentRecipe,
        ingredients:
          currentRecipe.ingredients.length > 0 ? currentRecipe.ingredients : [{ unit: "g", amount: 1, name: "" }],
        steps: currentRecipe.steps.length > 0 ? currentRecipe.steps : [{ description: "" }],
      });
      setPictureUrl(currentRecipe.pictureUrl);
    } else {
      form.resetFields();
      setPictureUrl(undefined);
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
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div style={{ display: currentStep === 0 ? "block" : "none" }}>
          <Flex style={{ width: "100%" }} justify="space-between" gap={margin}>
            <Form.Item
              name="name"
              label="שם מתכון"
              rules={[{ required: true, message: "הזן שם מתכון" }]}
              style={{ width: "100%" }}
            >
              <Input style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="tags" label="תגיות" style={{ width: "100%" }}>
              <Select
                style={{ width: "100%" }}
                options={Array.from(new Set(recipes?.map(({ tags }) => tags).filter(Boolean)))
                  .flat()
                  .map((tag) => ({
                    label: tag,
                    value: tag,
                  }))}
                allowClear
                mode="tags"
              />
            </Form.Item>
          </Flex>
          <Form.Item
            name="pictureUrl"
            label={
              <Space>
                תמונה
                {pictureUrl && (
                  <Image src={pictureUrl} alt="Preview" style={{ width: 50, height: 50, borderRadius: "100%" }} />
                )}
              </Space>
            }
          >
            <Space style={{ width: "100%" }}>
              <Input
                value={pictureUrl}
                placeholder="הזן כתובת URL של תמונה"
                onChange={(e) => setPictureUrl(e.target.value)}
                onBlur={(e) => form.setFieldsValue({ pictureUrl: e.target.value })}
              />
              <ImgCrop cropShape="round">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      try {
                        if (e.target?.result) {
                          const uploadedUrl = await uploadImageToBB(e.target.result);
                          setPictureUrl(uploadedUrl);
                          form.setFieldsValue({ pictureUrl: uploadedUrl });
                          message.success("Image uploaded successfully!");
                        }
                      } catch (error) {
                        console.error("Image upload failed:", error);
                        message.error("Image upload failed. Please try again.");
                      }
                    };
                    reader.readAsDataURL(file); // Convert file to base64
                    return false; // Prevent default upload behavior
                  }}
                >
                  <Button icon={<PlusOutlined />}>העלה תמונה</Button>
                </Upload>
              </ImgCrop>
            </Space>
          </Form.Item>
          <Flex style={{ width: "100%" }} justify="space-between" gap={margin}>
            <Form.Item name="prepTime" label="זמן הכנה (בדקות)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="cookTime" label="זמן בישול (בדקות)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="servings" label="מספר מנות">
              <InputNumber min={1} />
            </Form.Item>
          </Flex>
        </div>
        <div style={{ display: currentStep === 1 ? "block" : "none" }}>
          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <>
                    <Space wrap key={`${currentRecipe?.id}-ingredients-${index}`}>
                      <Space>
                        <Form.Item name={[field.name, "name"]} rules={[{ required: true, message: "חסר שם מרכיב" }]}>
                          <Input placeholder="שם מרכיב" />
                        </Form.Item>
                        <Form.Item name={[field.name, "name"]} rules={[{ required: true, message: "חסר שם מרכיב" }]}>
                          <Input placeholder="שם מרכיב" />
                        </Form.Item>
                      </Space>
                      <Space>
                        <Form.Item name={[field.name, "unit"]} rules={[{ required: true, message: "חסר יחידות מידה" }]}>
                          <Select options={Object.entries(unitOptions).map(([value, label]) => ({ label, value }))} />
                        </Form.Item>
                        <Form.Item name={[field.name, "amount"]} rules={[{ required: true, message: "חסר כמות" }]}>
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
                    {index + 1 < fields.length && <Divider style={{ margin: 0, marginBottom: margin }} />}
                  </>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add({ unit: "g" })} block icon={<PlusOutlined />}>
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
                        key={`${currentRecipe?.id}-steps-ingredients-${index}`}
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
                  <>
                    <Space direction="vertical" key={`${currentRecipe?.id}-steps-${index}`} style={{ width: "100%" }}>
                      <Flex justify="space-between">
                        <Title level={5} style={{ margin: 0 }}>
                          צעד מס' {index + 1}:
                        </Title>
                        <Button onClick={() => remove(field.name)} icon={<DeleteOutlined />} danger type="primary" />
                      </Flex>
                      <Form.Item
                        name={[field.name, "description"]}
                        rules={[{ required: true, message: "Missing step description" }]}
                      >
                        <Input.TextArea id={`step-${field.key}`} rows={4} placeholder="הסבר את צעדי הפעולה שעושים" />
                      </Form.Item>
                    </Space>
                    {index + 1 < fields.length && <Divider style={{ margin: 0 }} />}
                  </>
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
