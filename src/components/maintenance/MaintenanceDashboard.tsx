import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs,
  Alert,
  Popconfirm
} from 'antd';
import {
  ToolOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CarOutlined
} from '@ant-design/icons';
import { maintenanceAPI, vehiclesAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';

// Inline types to bypass import issues
interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  vehicleLicensePlate?: string;
  maintenanceType: string;
  description: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  performedBy?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  EMERGENCY = 'EMERGENCY'
}

interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  status: string;
}
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export const MaintenanceDashboard: React.FC = () => {
  const { canManageMaintenance, isEmployeeRestricted } = usePermissions();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesNeedingMaintenance, setVehiclesNeedingMaintenance] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [form] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRecords, allVehicles, needingMaintenance] = await Promise.all([
        maintenanceAPI.getUserRecords(),
        vehiclesAPI.getAll(),
        maintenanceAPI.getVehiclesNeedingMaintenance()
      ]);
      setRecords(userRecords);
      setVehicles(allVehicles);
      setVehiclesNeedingMaintenance(needingMaintenance);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      message.error('Error al cargar los datos de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRecord = async (values: any) => {
    try {
      await maintenanceAPI.createRecord(
        values.vehicleId,
        values.maintenanceType,
        values.description,
        values.serviceProvider,
        values.reason,
        values.cost,
        values.mileageAtService
      );
      message.success('Registro de mantenimiento creado exitosamente');
      setModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      message.error('Error al crear el registro de mantenimiento');
    }
  };

  const handleScheduleRecord = async (values: any) => {
    try {
      await maintenanceAPI.scheduleRecord(
        values.vehicleId,
        values.maintenanceType,
        values.description,
        values.scheduledDate.format('YYYY-MM-DDTHH:mm:ss'),
        values.estimatedMileage
      );
      message.success('Mantenimiento programado exitosamente');
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
      await loadData();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      message.error('Error al programar el mantenimiento');
    }
  };

  const handleUpdateStatus = async (recordId: number, status: MaintenanceStatus) => {
    try {
      await maintenanceAPI.updateRecord(recordId, status);
      message.success('Estado actualizado');
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Error al actualizar el estado');
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    try {
      await maintenanceAPI.deleteRecord(recordId);
      message.success('Registro eliminado');
      await loadData();
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error('Error al eliminar el registro');
    }
  };

  const handleRunManualCheck = async () => {
    try {
      await maintenanceAPI.runManualCheck();
      message.success('Verificación manual ejecutada');
      await loadData();
    } catch (error) {
      console.error('Error running manual check:', error);
      message.error('Error al ejecutar la verificación manual');
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return 'green';
      case MaintenanceStatus.IN_PROGRESS:
        return 'blue';
      case MaintenanceStatus.SCHEDULED:
        return 'orange';
      case MaintenanceStatus.OVERDUE:
        return 'red';
      case MaintenanceStatus.CANCELLED:
        return 'gray';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return <CheckCircleOutlined />;
      case MaintenanceStatus.IN_PROGRESS:
        return <ClockCircleOutlined />;
      case MaintenanceStatus.OVERDUE:
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const filteredRecords = records.filter(record => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return record.status === MaintenanceStatus.SCHEDULED || record.status === MaintenanceStatus.IN_PROGRESS;
    if (activeTab === 'completed') return record.status === MaintenanceStatus.COMPLETED;
    if (activeTab === 'overdue') return record.status === MaintenanceStatus.OVERDUE;
    return true;
  });

  const columns = [
    {
      title: 'Vehículo',
      dataIndex: 'vehicleId',
      key: 'vehicle',
      render: (vehicleId: number) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : `ID: ${vehicleId}`;
      }
    },
    {
      title: 'Tipo',
      dataIndex: 'maintenanceType',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: MaintenanceStatus) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Fecha de Servicio',
      dataIndex: 'serviceDate',
      key: 'serviceDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Kilometraje',
      dataIndex: 'mileageAtService',
      key: 'mileage',
      render: (mileage: number) => `${mileage.toLocaleString()} km`
    },
    {
      title: 'Costo',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => cost ? `$${cost.toLocaleString()}` : '-'
    },
    {
      title: 'Proveedor',
      dataIndex: 'serviceProvider',
      key: 'provider',
      render: (provider: string) => provider || '-'
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record: MaintenanceRecord) => (
        <Space>
          {record.status === MaintenanceStatus.SCHEDULED && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, MaintenanceStatus.IN_PROGRESS)}
            >
              Iniciar
            </Button>
          )}
          {record.status === MaintenanceStatus.IN_PROGRESS && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, MaintenanceStatus.COMPLETED)}
            >
              Completar
            </Button>
          )}
          {canManageMaintenance() && !isEmployeeRestricted() && (
            <Popconfirm
              title="¿Eliminar este registro?"
              onConfirm={() => handleDeleteRecord(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const pendingCount = records.filter(r => r.status === MaintenanceStatus.SCHEDULED || r.status === MaintenanceStatus.IN_PROGRESS).length;
  const overdueCount = records.filter(r => r.status === MaintenanceStatus.OVERDUE).length;
  const completedCount = records.filter(r => r.status === MaintenanceStatus.COMPLETED).length;

  if (!canManageMaintenance()) {
    return (
      <Alert
        message="Acceso Denegado"
        description="No tienes permisos para ver el dashboard de mantenimiento."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ToolOutlined /> Dashboard de Mantenimiento
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={pendingCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Atrasados"
              value={overdueCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completados"
              value={completedCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vehículos que Necesitan Mantenimiento"
              value={vehiclesNeedingMaintenance.length}
              valueStyle={{ color: '#faad14' }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Vehicles needing maintenance alert */}
      {vehiclesNeedingMaintenance.length > 0 && (
        <Alert
          message="Vehículos que Requieren Mantenimiento"
          description={
            <div>
              Los siguientes vehículos necesitan mantenimiento:
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                {vehiclesNeedingMaintenance.map(vehicle => (
                  <li key={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) - {vehicle.mileage.toLocaleString()} km
                  </li>
                ))}
              </ul>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button
              size="small"
              type="primary"
              onClick={handleRunManualCheck}
            >
              Verificar Ahora
            </Button>
          }
        />
      )}

      {/* Action buttons */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Nuevo Registro
        </Button>
        <Button
          icon={<ClockCircleOutlined />}
          onClick={() => setScheduleModalVisible(true)}
        >
          Programar Mantenimiento
        </Button>
        <Button
          icon={<ToolOutlined />}
          onClick={handleRunManualCheck}
        >
          Verificación Manual
        </Button>
      </Space>

      {/* Records table with tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Todos (${records.length})`} key="all">
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Pendientes (${pendingCount})`} key="pending">
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Completados (${completedCount})`} key="completed">
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Atrasados (${overdueCount})`} key="overdue">
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Record Modal */}
      <Modal
        title="Nuevo Registro de Mantenimiento"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRecord}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleId"
                label="Vehículo"
                rules={[{ required: true, message: 'Selecciona un vehículo' }]}
              >
                <Select placeholder="Seleccionar vehículo">
                  {vehicles.map(vehicle => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maintenanceType"
                label="Tipo de Mantenimiento"
                rules={[{ required: true, message: 'Selecciona el tipo' }]}
              >
                <Select placeholder="Tipo de mantenimiento">
                  {Object.values(MaintenanceType).map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Ingresa una descripción' }]}
          >
            <TextArea rows={3} placeholder="Descripción del mantenimiento..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="serviceProvider"
                label="Proveedor de Servicio"
                rules={[{ required: true, message: 'Ingresa el proveedor' }]}
              >
                <Input placeholder="Nombre del proveedor..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reason"
                label="Razón"
                rules={[{ required: true, message: 'Ingresa la razón' }]}
              >
                <Input placeholder="Razón del mantenimiento..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cost"
                label="Costo"
                rules={[{ required: true, message: 'Ingresa el costo' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  prefix="$"
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mileageAtService"
                label="Kilometraje al Servicio"
                rules={[{ required: true, message: 'Ingresa el kilometraje' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  suffix="km"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Crear Registro
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Maintenance Modal */}
      <Modal
        title="Programar Mantenimiento"
        open={scheduleModalVisible}
        onCancel={() => {
          setScheduleModalVisible(false);
          scheduleForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={scheduleForm}
          layout="vertical"
          onFinish={handleScheduleRecord}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleId"
                label="Vehículo"
                rules={[{ required: true, message: 'Selecciona un vehículo' }]}
              >
                <Select placeholder="Seleccionar vehículo">
                  {vehicles.map(vehicle => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maintenanceType"
                label="Tipo de Mantenimiento"
                rules={[{ required: true, message: 'Selecciona el tipo' }]}
              >
                <Select placeholder="Tipo de mantenimiento">
                  {Object.values(MaintenanceType).map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Ingresa una descripción' }]}
          >
            <TextArea rows={3} placeholder="Descripción del mantenimiento..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledDate"
                label="Fecha Programada"
                rules={[{ required: true, message: 'Selecciona la fecha' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Seleccionar fecha y hora"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimatedMileage"
                label="Kilometraje Estimado"
                rules={[{ required: true, message: 'Ingresa el kilometraje estimado' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  suffix="km"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Programar Mantenimiento
              </Button>
              <Button onClick={() => {
                setScheduleModalVisible(false);
                scheduleForm.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};