import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Input,
  Select,
  Tag,
  Modal,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CarOutlined,
  EyeOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI } from '../../services/api';
import type { Vehicle } from '../../types';
import { VEHICLE_STATUS, VehicleStatus } from '../../types';
import VehicleForm from './VehicleForm';
import VehicleDetail from './VehicleDetail';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const VehiclesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: vehiclesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Vehículo eliminado exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar el vehículo');
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: VehicleStatus }) =>
      vehiclesAPI.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Estado del vehículo actualizado exitosamente');
    },
    onError: () => {
      message.error('Error al cambiar el estado del vehículo');
    },
  });

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleStatusChange = (id: number, status: VehicleStatus) => {
    changeStatusMutation.mutate({ id, status });
  };

  const getStatusMenuItems = (vehicle: Vehicle) => {
    const allStatuses = Object.values(VehicleStatus);
    return allStatuses
      .filter(status => status !== vehicle.status)
      .map(status => ({
        key: status,
        label: getStatusText(status),
        onClick: () => handleStatusChange(vehicle.id, status),
      }));
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case VEHICLE_STATUS.AVAILABLE: return 'green';
      case VEHICLE_STATUS.RESERVED: return 'blue';
      case VEHICLE_STATUS.RENTED: return 'orange';
      case VEHICLE_STATUS.MAINTENANCE: return 'red';
      case VEHICLE_STATUS.OUT_OF_SERVICE: return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case VEHICLE_STATUS.AVAILABLE: return 'Disponible';
      case VEHICLE_STATUS.RESERVED: return 'Reservado';
      case VEHICLE_STATUS.RENTED: return 'Alquilado';
      case VEHICLE_STATUS.MAINTENANCE: return 'Mantenimiento';
      case VEHICLE_STATUS.OUT_OF_SERVICE: return 'Fuera de Servicio';
      default: return status;
    }
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE).length,
    rented: vehicles.filter(v => v.status === VEHICLE_STATUS.RENTED).length,
    maintenance: vehicles.filter(v => v.status === VEHICLE_STATUS.MAINTENANCE).length,
  };

  const isMobileView = window.innerWidth <= 768;

  const columns = [
    {
      title: 'Matrícula',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      sorter: (a: Vehicle, b: Vehicle) => a.licensePlate.localeCompare(b.licensePlate),
      width: isMobileView ? 120 : 150,
      fixed: isMobileView ? 'left' as const : undefined,
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      width: isMobileView ? 100 : 120,
    },
    {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model',
      width: isMobileView ? 100 : 120,
    },
    ...(!isMobileView ? [{
      title: 'Año',
      dataIndex: 'year',
      key: 'year',
      width: 80,
    }] : []),
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: isMobileView ? 100 : 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: isMobileView ? '10px' : '12px' }}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    ...(!isMobileView ? [{
      title: 'Tarifa',
      dataIndex: 'dailyRate',
      key: 'dailyRate',
      width: 100,
      render: (rate: number) => `$${rate.toFixed(2)}`,
    }] : []),
    {
      title: 'Acciones',
      key: 'actions',
      width: isMobileView ? 100 : 180,
      fixed: isMobileView ? 'right' as const : undefined,
      render: (_: any, record: Vehicle) => (
        <Space size={isMobileView ? 'small' : 'middle'}>
          <Button
            type="text"
            size={isMobileView ? 'small' : 'middle'}
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            size={isMobileView ? 'small' : 'middle'}
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          {!isMobileView && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'change-status',
                    label: 'Cambiar Estado',
                    children: getStatusMenuItems(record)
                  }
                ]
              }}
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          )}
          <Popconfirm
            title="¿Eliminar?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="text"
              size={isMobileView ? 'small' : 'middle'}
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={3}>Error al cargar los vehículos</Title>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <CarOutlined style={{ marginRight: '8px' }} />
          Gestión de Vehículos
        </Title>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card><Statistic title="Total" value={stats.total} /></Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card><Statistic title="Disponibles" value={stats.available} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card><Statistic title="Alquilados" value={stats.rented} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card><Statistic title="Mantenimiento" value={stats.maintenance} valueStyle={{ color: '#d46b08' }} /></Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={16} lg={18}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={16} md={12}>
                  <Search
                    placeholder="Buscar vehículos..."
                    style={{ width: '100%' }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={8} md={8}>
                  <Select
                    placeholder="Estado"
                    style={{ width: '100%' }}
                    allowClear
                    value={statusFilter}
                    onChange={setStatusFilter}
                  >
                    {Object.values(VEHICLE_STATUS).map(status => (
                      <Option key={status} value={status}>
                        {getStatusText(status)}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={8} lg={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ width: '100%' }}
              size="large"
            >
              Agregar Vehículo
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          width: '100%'
        }}>
          <Table
            columns={columns}
            dataSource={filteredVehicles}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: isMobileView ? 5 : 10,
              showSizeChanger: !isMobileView,
              showQuickJumper: !isMobileView,
              showTotal: (total, range) =>
                isMobileView ? `${range[0]}-${range[1]} de ${total}` : `${range[0]}-${range[1]} de ${total} vehículos`,
              responsive: true,
              showLessItems: isMobileView,
              simple: isMobileView,
              size: isMobileView ? 'small' : 'default'
            }}
            scroll={{
              x: isMobileView ? 600 : 'max-content',
              y: isMobileView ? 400 : undefined
            }}
            size={isMobileView ? 'small' : 'middle'}
            style={{
              minWidth: isMobileView ? '600px' : '100%',
              width: '100%'
            }}
          />
        </div>
      </Card>

      <Modal
        title={editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={window.innerWidth <= 768 ? '95%' : 800}
        style={{
          top: window.innerWidth <= 768 ? 20 : 100,
          maxWidth: 'calc(100vw - 32px)',
        }}
        bodyStyle={{
          maxHeight: window.innerWidth <= 768 ? 'calc(100vh - 120px)' : '70vh',
          overflowY: 'auto',
          padding: window.innerWidth <= 768 ? '16px' : '24px'
        }}
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        title="Detalles del Vehículo"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={window.innerWidth <= 768 ? '95%' : 600}
        style={{
          top: window.innerWidth <= 768 ? 20 : 100,
          maxWidth: 'calc(100vw - 32px)',
        }}
        bodyStyle={{
          maxHeight: window.innerWidth <= 768 ? 'calc(100vh - 120px)' : '70vh',
          overflowY: 'auto',
          padding: window.innerWidth <= 768 ? '12px' : '24px'
        }}
      >
        {selectedVehicle && <VehicleDetail vehicle={selectedVehicle} />}
      </Modal>
    </div>
  );
};

export default VehiclesPage;