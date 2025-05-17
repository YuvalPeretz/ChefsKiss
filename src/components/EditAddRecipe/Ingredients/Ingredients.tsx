import { Button, Divider, Form, Input, InputNumber, Select, Space, Switch, theme } from "antd";
import { getStepForUnit, unitOptions } from "../../../utils/utils";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useAtom } from "jotai";
import { currentRecipeAtom } from "../../../atom";
import { FormInstance } from "antd/lib";

type IngredientsProps = {
  form: FormInstance;
};

export default function Ingredients({ form }: IngredientsProps) {
  const [currentRecipe] = useAtom(currentRecipeAtom);
  const {
    token: { margin },
  } = theme.useToken();

  return (
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
                  <Form.Item name={[field.name, "notes"]}>
                    <Input placeholder="הערות" />
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
                  <Form.Item name={[field.name, "optional"]}>
                    <Switch checkedChildren="אופציונלי" unCheckedChildren="חובה" />
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
  );
}
