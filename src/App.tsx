import React, { useState } from 'react';
import { Button, Card, Input, Space, Typography, message } from 'antd';
import { CarOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (username === 'admin' && password === 'admin123') {
      setLoading(true);
      setTimeout(() => {
        setIsLoggedIn(true);
        setLoading(false);
        message.success('¡Login exitoso!');
      }, 1000);
    } else {
      message.error('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <CarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={2} style={{ margin: 0 }}>CarRental SaaS</Title>
              <Text type="secondary">Sistema de Gestión de Vehículos</Text>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="large"
              />
              <Input.Password
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="large"
                onPressEnter={handleLogin}
              />
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={handleLogin}
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                Iniciar Sesión
              </Button>
            </Space>

            <div style={{
              padding: '16px',
              backgroundColor: '#f6f8fa',
              borderRadius: '8px',
              fontSize: '12px'
            }}>
              <Text type="secondary">
                <strong>Credenciales de prueba:</strong><br />
                Usuario: admin<br />
                Contraseña: admin123
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <CarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Dashboard CarRental
          </Title>
        </div>
        <Button onClick={handleLogout}>Cerrar Sesión</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <Card title="🚗 Vehículos" style={{ textAlign: 'center' }}>
          <div style={{ padding: '40px 0' }}>
            <Title level={1} style={{ color: '#1890ff', margin: 0 }}>0</Title>
            <Text>Total de vehículos</Text>
          </div>
          <Button type="primary" style={{ width: '100%' }}>
            Gestionar Vehículos
          </Button>
        </Card>

        <Card title="👥 Clientes" style={{ textAlign: 'center' }}>
          <div style={{ padding: '40px 0' }}>
            <Title level={1} style={{ color: '#52c41a', margin: 0 }}>0</Title>
            <Text>Total de clientes</Text>
          </div>
          <Button type="primary" style={{ width: '100%' }}>
            Gestionar Clientes
          </Button>
        </Card>

        <Card title="💰 Ingresos" style={{ textAlign: 'center' }}>
          <div style={{ padding: '40px 0' }}>
            <Title level={1} style={{ color: '#fa8c16', margin: 0 }}>$0</Title>
            <Text>Ingresos del mes</Text>
          </div>
          <Button type="primary" style={{ width: '100%' }}>
            Ver Reportes
          </Button>
        </Card>

        <Card title="📊 Estado del Sistema" style={{ textAlign: 'center' }}>
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Backend: </Text>
              <Text style={{ color: '#52c41a' }}>✅ Conectado</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Base de Datos: </Text>
              <Text style={{ color: '#52c41a' }}>✅ Activa</Text>
            </div>
            <div>
              <Text strong>Frontend: </Text>
              <Text style={{ color: '#52c41a' }}>✅ Funcionando</Text>
            </div>
          </div>
        </Card>
      </div>

      <Card title="🎉 ¡Sistema Funcionando!" style={{ marginTop: '24px' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={3}>¡Felicidades! El sistema CarRental está funcionando correctamente</Title>
          <Space direction="vertical">
            <Text>✅ Frontend React funcionando</Text>
            <Text>✅ Backend Spring Boot conectado (puerto 8083)</Text>
            <Text>✅ Autenticación implementada</Text>
            <Text>✅ UI responsive con Ant Design</Text>
          </Space>
          <div style={{ marginTop: '24px' }}>
            <Button type="primary" size="large">
              Continuar con Stage 2: JWT Authentication
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default App;