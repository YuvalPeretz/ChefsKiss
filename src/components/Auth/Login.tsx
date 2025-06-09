import { Button, Card, Flex, Form, Input, Space, Typography, theme } from 'antd';
import { GoogleOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const { Title, Text } = Typography;

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    token: { colorPrimary, borderRadius, paddingLG },
  } = theme.useToken();

  const { firebaseLoginWithGoogle, firebaseLoginWithPhone, firebaseLoginAnonymously, loading } =
    useAuth();

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) return;

    const confirmation = await firebaseLoginWithPhone(phoneNumber);
    if (confirmation) {
      setShowConfirmation(true);
    }
  };

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{
        minHeight: '100vh',
        padding: paddingLG,
        background: '#f5f5f5',
      }}
    >
      <Card style={{ maxWidth: 400, width: '100%', borderRadius }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Flex vertical align="center">
            <Title level={2} style={{ margin: 0 }}>
              🍴 Chef's Kiss 🎀
            </Title>
            <Text type="secondary">היכנס כדי להתחיל לבשל!</Text>
          </Flex>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              icon={<GoogleOutlined />}
              onClick={firebaseLoginWithGoogle}
              loading={loading}
              block
              size="large"
              style={{
                borderColor: colorPrimary,
                color: colorPrimary,
              }}
            >
              המשך עם Google
            </Button>

            {!showConfirmation ? (
              <Form layout="vertical" style={{ width: '100%' }}>
                <Form.Item>
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="מספר טלפון"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handlePhoneSubmit}
                    loading={loading}
                    block
                    size="large"
                  >
                    המשך עם טלפון
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <Form layout="vertical" style={{ width: '100%' }}>
                <Form.Item>
                  <Input
                    placeholder="קוד אימות"
                    value={confirmationCode}
                    onChange={e => setConfirmationCode(e.target.value)}
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" loading={loading} block size="large">
                    אמת קוד
                  </Button>
                </Form.Item>
                <Button type="link" onClick={() => setShowConfirmation(false)}>
                  חזור
                </Button>
              </Form>
            )}

            <Button
              icon={<UserOutlined />}
              onClick={firebaseLoginAnonymously}
              loading={loading}
              block
              size="large"
            >
              המשך כאורח
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Recaptcha container for phone auth */}
      <div id="recaptcha-container" />
    </Flex>
  );
}
