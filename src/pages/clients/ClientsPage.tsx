import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '../../services/api';
import ClientForm from './ClientForm';
import ClientDetail from './ClientDetail';
import { Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, CheckCircleOutlined, SafetyCertificateOutlined, CrownOutlined } from '@ant-design/icons';

// Professional SaaS Icons
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const BadgeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

// Inline type definitions
interface CustomerResponse {
  id: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  status: CustomerStatus;
  segment: CustomerSegment;
  preferredLanguage?: string;
  licenseNumber: string;
  licenseIssuedDate?: string;
  licenseExpiryDate?: string;
  licenseIssuingCountry?: string;
  licenseClass?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  totalReservations: number;
  totalSpent: number;
  averageRentalDays: number;
  lastRentalDate?: string;
  customerLifetimeValue: number;
  createdAt: string;
  updatedAt: string;
  lastActivityDate?: string;
  notes?: string;
  preferredPickupLocation?: string;
  isLicenseExpiringSoon?: boolean;
  daysSinceLastActivity?: number;
  engagementScore?: number;
}

enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

enum CustomerSegment {
  NEW = 'NEW',
  REGULAR = 'REGULAR',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
  CORPORATE = 'CORPORATE'
}

const CUSTOMER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION'
} as const;

const CUSTOMER_SEGMENT = {
  NEW: 'NEW',
  REGULAR: 'REGULAR',
  PREMIUM: 'PREMIUM',
  VIP: 'VIP',
  CORPORATE: 'CORPORATE'
} as const;

// Professional Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case CUSTOMER_STATUS.ACTIVE:
        return { color: 'available', text: 'Activo' };
      case CUSTOMER_STATUS.INACTIVE:
        return { color: 'maintenance', text: 'Inactivo' };
      case CUSTOMER_STATUS.SUSPENDED:
        return { color: 'warning', text: 'Suspendido' };
      case CUSTOMER_STATUS.BLOCKED:
        return { color: 'danger', text: 'Bloqueado' };
      case CUSTOMER_STATUS.PENDING_VERIFICATION:
        return { color: 'pending', text: 'Pendiente' };
      default:
        return { color: 'default', text: status };
    }
  };

  const config = getStatusConfig(status);
  return <span className={`badge ${config.color}`}>{config.text}</span>;
};

const SegmentBadge = ({ segment }: { segment: string }) => {
  const getSegmentConfig = (segment: string) => {
    switch (segment) {
      case CUSTOMER_SEGMENT.NEW:
        return { color: 'info', text: 'Nuevo' };
      case CUSTOMER_SEGMENT.REGULAR:
        return { color: 'available', text: 'Regular' };
      case CUSTOMER_SEGMENT.PREMIUM:
        return { color: 'warning', text: 'Premium' };
      case CUSTOMER_SEGMENT.VIP:
        return { color: 'premium', text: 'VIP' };
      case CUSTOMER_SEGMENT.CORPORATE:
        return { color: 'success', text: 'Corporativo' };
      default:
        return { color: 'default', text: segment };
    }
  };

  const config = getSegmentConfig(segment);
  return <span className={`badge ${config.color}`}>{config.text}</span>;
};

const ClientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CustomerResponse | null>(null);
  const [selectedClient, setSelectedClient] = useState<CustomerResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerAPI.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: customerAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      // Show success notification here
    },
    onError: () => {
      // Show error notification here
    },
  });

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = searchQuery === '' ||
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === '' || customer.status === statusFilter;
    const matchesSegment = segmentFilter === '' || customer.segment === segmentFilter;

    return matchesSearch && matchesStatus && matchesSegment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleEdit = (client: CustomerResponse) => {
    setEditingClient(client);
    setIsFormModalOpen(true);
  };

  const handleView = (client: CustomerResponse) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingClient(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedClient(null);
  };

  // Calculate statistics
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === CUSTOMER_STATUS.ACTIVE).length,
    withLicense: customers.filter(c => c.licenseNumber && c.licenseNumber.trim() !== '').length,
    premium: customers.filter(c => c.segment === CUSTOMER_SEGMENT.PREMIUM || c.segment === CUSTOMER_SEGMENT.VIP).length,
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Professional Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Management</h1>
          <p className="page-subtitle">Manage your customer database efficiently</p>
        </div>
        <button onClick={handleAddNew} className="btn btn-primary">
          <PlusIcon />
          New Customer
        </button>
      </div>

      {/* Professional Customer Status Cards - Exact Maintenance Design */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Customers"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Licensed Drivers"
              value={stats.withLicense}
              valueStyle={{ color: '#faad14' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Premium/VIP"
              value={stats.premium}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Professional Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="search-filter-container">
            <div className="search-input-container">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by name, email, code, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <div className="filter-select-container">
                <FilterIcon />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value={CUSTOMER_STATUS.ACTIVE}>Active</option>
                  <option value={CUSTOMER_STATUS.INACTIVE}>Inactive</option>
                  <option value={CUSTOMER_STATUS.SUSPENDED}>Suspended</option>
                  <option value={CUSTOMER_STATUS.BLOCKED}>Blocked</option>
                  <option value={CUSTOMER_STATUS.PENDING_VERIFICATION}>Pending</option>
                </select>
              </div>

              <div className="filter-select-container">
                <FilterIcon />
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Segments</option>
                  <option value={CUSTOMER_SEGMENT.NEW}>New</option>
                  <option value={CUSTOMER_SEGMENT.REGULAR}>Regular</option>
                  <option value={CUSTOMER_SEGMENT.PREMIUM}>Premium</option>
                  <option value={CUSTOMER_SEGMENT.VIP}>VIP</option>
                  <option value={CUSTOMER_SEGMENT.CORPORATE}>Corporate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results summary */}
          {(searchQuery || statusFilter || segmentFilter) && (
            <div className="search-results-summary">
              Showing {filteredCustomers.length} of {customers.length} customers
              {searchQuery && <span className="filter-tag">Search: "{searchQuery}"</span>}
              {statusFilter && <span className="filter-tag">Status: {statusFilter}</span>}
              {segmentFilter && <span className="filter-tag">Segment: {segmentFilter}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Modern Horizontal Client Cards */}
      <div className="client-cards-grid">
        {paginatedCustomers.length > 0 ? (
          <>
            {paginatedCustomers.map((customer) => (
              <div key={customer.id} className="client-card">
                {/* Client Avatar and Header */}
                <div className="client-avatar">
                  <div className="avatar-placeholder">
                    <UserIcon />
                  </div>
                  <div className="client-badges">
                    <SegmentBadge segment={customer.segment} />
                  </div>
                </div>

                {/* Main Client Content */}
                <div className="client-content">
                  <div className="client-header">
                    <div className="client-identity">
                      <h3 className="client-name">{customer.fullName}</h3>
                      <p className="client-code">{customer.customerCode}</p>
                      <div className="client-status-row">
                        <StatusBadge status={customer.status} />
                        {customer.dateOfBirth && (
                          <span className="client-age">
                            Born: {new Date(customer.dateOfBirth).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="client-stats">
                      <div className="stat-item">
                        <span className="stat-value">{customer.totalReservations}</span>
                        <span className="stat-label">Reservations</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">${customer.totalSpent.toFixed(2)}</span>
                        <span className="stat-label">Total Spent</span>
                      </div>
                      {customer.customerLifetimeValue > 0 && (
                        <div className="stat-item">
                          <span className="stat-value">${customer.customerLifetimeValue.toFixed(2)}</span>
                          <span className="stat-label">LTV</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client Details Row */}
                  <div className="client-details">
                    <div className="detail-section contact-section">
                      <div className="detail-icon">
                        <SearchIcon />
                      </div>
                      <div className="detail-content">
                        <h4 className="detail-title">Contact</h4>
                        <a href={`mailto:${customer.email}`} className="contact-link">
                          {customer.email}
                        </a>
                        {customer.phoneNumber ? (
                          <a href={`tel:${customer.phoneNumber}`} className="contact-link">
                            {customer.phoneNumber}
                          </a>
                        ) : (
                          <span className="contact-missing">Phone not provided</span>
                        )}
                      </div>
                    </div>

                    <div className="detail-section license-section">
                      <div className="detail-icon">
                        <BadgeIcon />
                      </div>
                      <div className="detail-content">
                        <h4 className="detail-title">License</h4>
                        {customer.licenseNumber ? (
                          <>
                            <p className="license-number">{customer.licenseNumber}</p>
                            {customer.licenseExpiryDate && (
                              <p className="license-expiry">
                                Expires: {new Date(customer.licenseExpiryDate).toLocaleDateString()}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="license-missing">License not provided</span>
                        )}
                      </div>
                    </div>

                    {customer.averageRentalDays > 0 && (
                      <div className="detail-section behavior-section">
                        <div className="detail-icon">
                          <UsersIcon />
                        </div>
                        <div className="detail-content">
                          <h4 className="detail-title">Behavior</h4>
                          <p className="avg-rental">Avg: {customer.averageRentalDays} days/rental</p>
                          {customer.lastRentalDate && (
                            <p className="last-rental">
                              Last: {new Date(customer.lastRentalDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {(customer.city || customer.country) && (
                      <div className="detail-section location-section">
                        <div className="detail-icon">
                          <FilterIcon />
                        </div>
                        <div className="detail-content">
                          <h4 className="detail-title">Location</h4>
                          <p className="location-info">
                            {customer.city && customer.country
                              ? `${customer.city}, ${customer.country}`
                              : customer.city || customer.country}
                          </p>
                          {customer.nationality && (
                            <p className="nationality">Nationality: {customer.nationality}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="client-actions">
                    <button
                      onClick={() => handleView(customer)}
                      className="btn btn-secondary btn-sm"
                      title="View Details"
                    >
                      <EyeIcon />
                      View Details
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="btn btn-primary btn-sm"
                      title="Edit Customer"
                    >
                      <EditIcon />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete Customer"
                    >
                      <TrashIcon />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="empty-state-full">
            <div className="empty-icon">
              <UsersIcon />
            </div>
            <h3>No customers found</h3>
            <p>
              {searchQuery || segmentFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filters'
                : 'Start by adding your first customer to the system'}
            </p>
          </div>
        )}

        {/* Professional Pagination */}
        {totalPages > 1 && paginatedCustomers.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Professional Modals */}
      {isFormModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingClient ? 'Edit Customer' : 'New Customer'}</h3>
              <button onClick={closeFormModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-content">
              <ClientForm
                client={editingClient}
                onSuccess={closeFormModal}
              />
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedClient && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button onClick={closeDetailModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-content">
              <ClientDetail client={selectedClient} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;