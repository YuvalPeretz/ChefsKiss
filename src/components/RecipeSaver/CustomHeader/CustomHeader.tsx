import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Space, theme, Typography } from "antd";
import { useAtom } from "jotai";
import { searchQueryAtom, isModalVisibleAtom, currentRecipeAtom, currentStepAtom } from "../../../atom";
import { FaSearch } from "react-icons/fa";
import useResponsive from "../../../hooks/useResponsive";
// import { useMemo } from "react";

type CustomHeaderProps = {};

const { Title } = Typography;

export default function CustomHeader({}: CustomHeaderProps) {
  // const [recipes] = useAtom(recipesAtom);
  const setSearchQuery = useAtom(searchQueryAtom)[1];
  const setIsModalVisible = useAtom(isModalVisibleAtom)[1];
  const setCurrentRecipe = useAtom(currentRecipeAtom)[1];
  const setCurrentStep = useAtom(currentStepAtom)[1];
  const {
    token: { paddingXL, magenta2, magenta6, padding },
  } = theme.useToken();
  const { isWidthBroken: isSmall } = useResponsive({ breakpoint: { width: 610 } });

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

  return (
    <Flex
      gap={padding}
      justify={isSmall ? "center" : "space-between"}
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
        {/* <Cascader
          prefix={<FaSearch />}
          placeholder="חיפוש"
          options={cascaderOptions}
          showSearch={{
            filter: (inputValue, path) =>
              path.some((option) => option.label.toLowerCase().includes(inputValue.toLowerCase())),
          }}
        /> */}
        <Input prefix={<FaSearch />} placeholder="חיפוש" onChange={(e) => handleSearch(e.target.value)} />
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          הוסף מתכון
        </Button>
      </Space>
    </Flex>
  );
}
