import { LogoutOutlined, OpenAIOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input, message, Modal, Space, theme, Typography } from 'antd';
import { useAtom } from 'jotai';
import {
  searchQueryAtom,
  isModalVisibleAtom,
  currentRecipeAtom,
  currentStepAtom,
} from '../../../atom';
import { FaSearch } from 'react-icons/fa';
import useResponsive from '../../../hooks/useResponsive';
import { useState } from 'react';
import { extractRecipeFromText, validateRecipe } from '../../../utils/utils';
import useAuth from '../../../hooks/useAuth';

type CustomHeaderProps = {};

const { Title } = Typography;

export default function CustomHeader({}: CustomHeaderProps) {
  const { firebaseLogout } = useAuth();
  const setSearchQuery = useAtom(searchQueryAtom)[1];
  const setIsModalVisible = useAtom(isModalVisibleAtom)[1];
  const setCurrentRecipe = useAtom(currentRecipeAtom)[1];
  const setCurrentStep = useAtom(currentStepAtom)[1];
  const {
    token: { paddingXL, magenta2, magenta6, padding },
  } = theme.useToken();
  const { isWidthBroken: isSmall } = useResponsive({ breakpoint: { width: 610 } });
  const [aiOpen, setAIOpen] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [recipeText, setRecipeText] = useState('');
  // const cascaderOptions = useMemo(() => {
  //   const optionsMap = new Map();

  //   recipes?.forEach((recipe) => {
  //     const { tags, name } = recipe;

  //     if (tags?.length > 0) {
  //       tags.forEach((tag) => {
  //         if (!optionsMap.has(tag)) {
  //           optionsMap.set(tag, {
  //             value: tag,
  //             label: tag,
  //             children: [],
  //           });
  //         }

  //         optionsMap.get(tag).children.push({
  //           value: name,
  //           label: name,
  //         });
  //       });
  //     } else {
  //       if (!optionsMap.has(name)) {
  //         optionsMap.set(name, {
  //           value: name,
  //           label: name,
  //           children: [],
  //         });
  //       }
  //     }
  //   });

  //   return Array.from(optionsMap.values());
  // }, [recipes]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const showModal = () => {
    setIsModalVisible(true);
    setCurrentRecipe(null);
    setCurrentStep(0);
  };

  async function handleAISubmit() {
    if (!recipeText.trim()) {
      message.warning('אנא הזן טקסט של מתכון.');
      return;
    }

    setAILoading(true);
    try {
      // const data = (await AI(recipeText)).recipe;
      const data = await extractRecipeFromText(recipeText);
      setCurrentRecipe(validateRecipe(data));
      setCurrentStep(0);
      setIsModalVisible(true);
      setAIOpen(false);
      setRecipeText('');
    } catch {
      message.error('אירעה שגיאה בעת עיבוד המתכון.');
    } finally {
      setAILoading(false);
    }
  }

  return (
    <Flex
      gap={padding}
      justify={isSmall ? 'center' : 'space-between'}
      align="center"
      style={{ padding: paddingXL, backgroundColor: magenta2 }}
      wrap={isSmall}
    >
      <Title level={3} style={{ margin: 0, color: magenta6 }}>
        <Space align="center" wrap>
          🍴 Chef's Kiss 🎀
        </Space>
      </Title>
      <Space>
        <Input
          prefix={<FaSearch />}
          placeholder="חיפוש"
          onChange={e => handleSearch(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          הוסף מתכון
        </Button>
        <Button
          variant="filled"
          color="pink"
          icon={<OpenAIOutlined style={{ fontSize: 18 }} />}
          onClick={() => setAIOpen(true)}
        />
        <Button icon={<LogoutOutlined />} onClick={firebaseLogout}>
          התנתק
        </Button>
      </Space>

      <Modal
        title="מתכון עם AI"
        open={aiOpen}
        onCancel={() => setAIOpen(false)}
        onOk={handleAISubmit}
        confirmLoading={aiLoading}
        okText="שלח ל-AI"
        cancelText="ביטול"
      >
        <Input.TextArea
          maxLength={3000}
          value={recipeText}
          onChange={e => setRecipeText(e.target.value)}
          placeholder="הדבק כאן את טקסט המתכון..."
        />
      </Modal>
    </Flex>
  );
}
