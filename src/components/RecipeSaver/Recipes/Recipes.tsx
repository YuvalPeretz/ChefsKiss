import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Empty, Flex, Image, message, Spin, theme, Typography } from 'antd';
import { useAtom } from 'jotai';
import {
  recipesAtom,
  searchQueryAtom,
  currentRecipeAtom,
  isViewModalVisibleAtom,
  isModalVisibleAtom,
  currentStepAtom,
} from '../../../atom';
import { Recipe } from '../../../utils/types';
import useRecipes from '../../../hooks/useRecipes';
import useResponsive from '../../../hooks/useResponsive';
import OverflowTags from '../../OverflowTags/OverflowTags';
import { IoFastFood } from 'react-icons/io5';

export default function Recipes() {
  const { removeRecipe, refreshRecipes } = useRecipes();
  const [recipes] = useAtom(recipesAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const setCurrentRecipe = useAtom(currentRecipeAtom)[1];
  const setIsViewModalVisible = useAtom(isViewModalVisibleAtom)[1];
  const setIsModalVisible = useAtom(isModalVisibleAtom)[1];
  const setCurrentStep = useAtom(currentStepAtom)[1];
  const {
    token: { padding },
  } = theme.useToken();
  const { isWidthBroken } = useResponsive({ breakpoint: { width: 610 } });

  const isSmall = isWidthBroken;

  const handleDelete = (id: string) => {
    removeRecipe(id).then(() => refreshRecipes().then(message.success('מתכון נמחק בהצלחה')));
  };

  const showEditModal = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setCurrentStep(0);
    setTimeout(() => {
      setIsModalVisible(true);
    }, 1);
  };

  const showViewModal = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setIsViewModalVisible(true);
  };

  const filteredRecipes = recipes?.filter(recipe =>
    searchQuery?.length
      ? recipe.name?.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        recipe.tags?.some(tag => tag.toLowerCase().includes((searchQuery || '').toLowerCase()))
      : true
  );

  return !recipes ? (
    <Spin fullscreen size="large" tip="טוען מתכונים" />
  ) : filteredRecipes?.length ? (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isSmall ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: padding,
        padding,
        backgroundColor: '#f9f9f9',
      }}
    >
      {filteredRecipes?.map(recipe => (
        <Flex
          vertical
          key={recipe.id}
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s',
            backgroundColor: '#fff',
          }}
        >
          {recipe.pictureUrl ? (
            <Image
              src={recipe.pictureUrl}
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                borderBottom: '1px solid #f0f0f0',
              }}
            />
          ) : (
            <Empty
              image={<IoFastFood style={{ width: '100%' }} />}
              description="אין תמונה"
              styles={{
                root: {
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  borderBottom: '1px solid #f0f0f0',
                },
              }}
            />
          )}
          <Flex vertical style={{ padding: 16, flex: 1 }}>
            <Typography.Title level={3} style={{ margin: 0, fontWeight: 600 }}>
              {recipe.name}
            </Typography.Title>
            <Flex style={{ marginTop: 8, flex: 1 }}>
              <OverflowTags tags={recipe.tags || []} />
            </Flex>
            <Flex vertical style={{ marginTop: 12 }}>
              <Typography.Text type="secondary">
                מצרכים: {recipe.ingredients.length}
              </Typography.Text>
              <Typography.Text type="secondary">צעדים: {recipe.steps.length}</Typography.Text>
              {recipe.prepTime && (
                <Typography.Text type="secondary">זמן הכנה: {recipe.prepTime} דקות</Typography.Text>
              )}
              {recipe.cookTime && (
                <Typography.Text type="secondary">
                  זמן בישול: {recipe.cookTime} דקות
                </Typography.Text>
              )}
            </Flex>
          </Flex>
          <Flex justify="space-between" style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => showViewModal(recipe)}
              style={{ borderRadius: 8 }}
            >
              צפה
            </Button>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => showEditModal(recipe)}
              style={{ borderRadius: 8 }}
            >
              ערוך
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: 'מחק',
                    onClick: () => handleDelete(recipe.id),
                    danger: true,
                  },
                ],
              }}
            >
              <Button icon={<MoreOutlined />} style={{ borderRadius: 8 }} />
            </Dropdown>
          </Flex>
        </Flex>
      ))}
    </div>
  ) : (
    <Empty
      style={{ padding, textAlign: 'center' }}
      description={
        <Flex vertical align="center">
          <Typography.Title level={3} style={{ fontWeight: 500, margin: 0 }}>
            אין מתכונים/סיננתם הכל
          </Typography.Title>
          <Typography.Text type="secondary">
            נסו להוסיף מתכון חדש או לשנות את החיפוש
          </Typography.Text>
        </Flex>
      }
      styles={{
        image: {
          height: 120,
        },
      }}
    />
  );
}
