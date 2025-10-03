import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Space, Typography, message, Form } from 'antd';
import { CarOutlined, UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import type { RegisterRequest } from '../../types';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const handleRegister = async (values: RegisterRequest & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...registerData } = values;
      const success = await register(registerData);
      if (success) {
        message.success('¡Registro exitoso! Bienvenido/a');
        navigate('/dashboard');
      } else {
        message.error('Error al registrarse. Intenta con otros datos.');
      }
    } catch (error) {
      message.error('Error al registrarse');
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
      <Card style={{ width: 450, textAlign: 'center' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <CarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={2} style={{ margin: 0 }}>Crear Cuenta</Title>
            <Text type="secondary">Únete a CarRental SaaS</Text>
          </div>

          <Form
            form={form}
            onFinish={handleRegister}
            layout="vertical"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="username"
              label="Usuario"
              rules={[
                { required: true, message: 'Por favor ingrese un usuario' },
                { min: 3, message: 'El usuario debe tener al menos 3 caracteres' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Usuario"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Por favor ingrese su email' },
                { type: 'email', message: 'Por favor ingrese un email válido' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="email@ejemplo.com"
                size="large"
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Form.Item
                name="firstName"
                label="Nombre"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <Input placeholder="Nombre" size="large" />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Apellido"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <Input placeholder="Apellido" size="large" />
              </Form.Item>
            </div>

            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Por favor ingrese su contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmar Contraseña"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Por favor confirme su contraseña' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirmar contraseña"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                htmlType="submit"
                loading={isLoading}
                size="large"
                style={{ width: '100%' }}
              >
                Crear Cuenta
              </Button>
            </Form.Item>
          </Form>

          <div>
            <Text type="secondary">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default RegisterPage;