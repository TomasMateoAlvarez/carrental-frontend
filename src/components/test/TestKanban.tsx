import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const TestKanban: React.FC = () => {
  return (
    <div>
      <Title level={4}>🎯 Test Kanban Component</Title>
      <Card title="Kanban de Vehículos" style={{ marginTop: 16 }}>
        <p>Este es un componente de prueba para verificar que los tabs funcionan.</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: 16
        }}>
          <Card title="Reservado" size="small" style={{ backgroundColor: '#fff7e6' }}>
            <p>Vehículos reservados</p>
          </Card>
          <Card title="Alquilado" size="small" style={{ backgroundColor: '#fff1f0' }}>
            <p>Vehículos alquilados</p>
          </Card>
          <Card title="Devuelto/Limpieza" size="small" style={{ backgroundColor: '#f9f0ff' }}>
            <p>Vehículos en limpieza</p>
          </Card>
          <Card title="Disponible" size="small" style={{ backgroundColor: '#f6ffed' }}>
            <p>Vehículos disponibles</p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default TestKanban;