import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, CarOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values: LoginForm) => {
    try {
      const success = await login({
        username: values.username,
        password: values.password
      });
      if (success) {
        message.success('¡Inicio de sesión exitoso!');
        navigate('/dashboard');
      } else {
        message.error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
      }
    } catch (error) {
      message.error('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <CarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#1f1f1f' }}>
            CarRental SaaS
          </Title>
          <Text type="secondary">Sistema de Gestión de Alquiler de Vehículos</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Usuario"
            rules={[
              { required: true, message: 'Por favor ingresa tu usuario' },
              { min: 3, message: 'El usuario debe tener al menos 3 caracteres' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%', height: '44px' }}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? <Spin size="small" /> : 'Iniciar Sesión'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f6f8fa',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Credenciales de prueba:</strong><br />
            Usuario: admin<br />
            Contraseña: admin123
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;