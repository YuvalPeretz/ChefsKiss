import { Button, Divider, Flex, Form, Input, Space, Tag, Typography } from "antd";
import { Ingredient } from "../../../utils/types";
import { FormInstance } from "antd/lib";
import { useAtom } from "jotai";
import { currentRecipeAtom } from "../../../atom";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

type RecipeStepsProps = {
  form: FormInstance;
};

const { Title } = Typography;

export default function RecipeSteps({ form }: RecipeStepsProps) {
  const [currentRecipe] = useAtom(currentRecipeAtom);

  return (
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
  );
}
