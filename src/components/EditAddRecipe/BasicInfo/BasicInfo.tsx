import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Form,
  FormInstance,
  Image,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  theme,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { useAtom } from "jotai";
import { currentRecipeAtom, recipesAtom } from "../../../atom";
import { useEffect, useState } from "react";
import { uploadImageToBB } from "../../../utils/utils";

type BasicInfoProps = {
  form: FormInstance;
};

export default function BasicInfo({ form }: BasicInfoProps) {
  const [recipes] = useAtom(recipesAtom);
  const [currentRecipe] = useAtom(currentRecipeAtom);
  const {
    token: { margin },
  } = theme.useToken();
  const [isPictureUploaded, setIsPictureUploaded] = useState(false);
  const [pictureUrl, setPictureUrl] = useState(currentRecipe?.pictureUrl);

  useEffect(() => {
    setPictureUrl(currentRecipe?.pictureUrl);
  }, [currentRecipe]);

  useEffect(() => {
    if (currentRecipe) {
      setPictureUrl(currentRecipe.pictureUrl);
    } else {
      setPictureUrl(undefined);
    }
  }, [currentRecipe, form]);

  return (
    <>
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
            options={Array.from(
              new Set(
                recipes
                  ?.map(({ tags }) => tags.flat())
                  .filter(Boolean)
                  .flat()
              )
            )
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
            disabled={isPictureUploaded}
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
                      setIsPictureUploaded(true); // Disable the input and button
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
              disabled={isPictureUploaded} // Disable the upload button
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
    </>
  );
}
