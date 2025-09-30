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
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsAPI } from '../../services/api';
import { Client } from '../../types';
import ClientForm from './ClientForm';
import ClientDetail from './ClientDetail';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const ClientsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsAPI.getAll,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: clientsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      message.success('Cliente eliminado exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar el cliente');
    },
  });

  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedClient(null);
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      client.apellido.toLowerCase().includes(searchText.toLowerCase()) ||
      client.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (client.numeroLicencia && client.numeroLicencia.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'active' && client.activo) ||
      (statusFilter === 'inactive' && !client.activo);

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.activo).length,
    inactive: clients.filter(c => !c.activo).length,
    withLicense: clients.filter(c => c.numeroLicencia).length,
  };

  const columns = [
    {
      title: 'Nombre',
      key: 'fullName',
      render: (_, record: Client) => `${record.nombre} ${record.apellido}`,
      sorter: (a: Client, b: Client) =>
        `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: Client, b: Client) => a.email.localeCompare(b.email),
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      render: (telefono: string) => telefono || 'No especificado',
    },
    {
      title: 'Licencia',
      dataIndex: 'numeroLicencia',
      key: 'numeroLicencia',
      render: (licencia: string) => licencia || 'No especificada',
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'green' : 'red'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value: any, record: Client) => record.activo === value,
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('es-ES'),
      sorter: (a: Client, b: Client) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record: Client) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="Ver detalles"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este cliente?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Eliminar"
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
          <Title level={3}>Error al cargar los clientes</Title>
          <p>No se pudieron cargar los datos. Verifica la conexión al servidor.</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <TeamOutlined style={{ marginRight: '8px' }} />
          Gestión de Clientes
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Clientes" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Clientes Activos"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Clientes Inactivos"
              value={stats.inactive}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Con Licencia"
              value={stats.withLicense}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Search
                placeholder="Buscar por nombre, email o licencia"
                allowClear
                style={{ width: 350 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                placeholder="Filtrar por estado"
                style={{ width: 150 }}
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="active">Activos</Option>
                <Option value="inactive">Inactivos</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Agregar Cliente
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredClients.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} clientes`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingClient ? 'Editar Cliente' : 'Agregar Cliente'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        destroyOnClose
      >
        <ClientForm
          client={editingClient}
          onSuccess={handleModalClose}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detalles del Cliente"
        open={isDetailModalOpen}
        onCancel={handleDetailModalClose}
        footer={null}
        width={600}
      >
        {selectedClient && (
          <ClientDetail client={selectedClient} />
        )}
      </Modal>
    </div>
  );
};

export default ClientsPage;