import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesAPI, reservationsAPI } from '../../services/api';

// Professional Dashboard Icons
const CarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2z" clipRule="evenodd" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

// Professional KPI Card Component
const KPICard = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  iconColor
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  subtitle?: string;
  iconColor: 'blue' | 'green' | 'purple' | 'orange';
}) => (
  <div className="kpi-card">
    <div className="kpi-card-header">
      <div className={`kpi-icon ${iconColor}`}>
        {icon}
      </div>
      <div>
        <div className="kpi-title">{title}</div>
      </div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="flex justify-between items-center">
      <div className="kpi-trend">{trend}</div>
      {subtitle && <div className="text-sm text-secondary">{subtitle}</div>}
    </div>
  </div>
);

// Professional Calendar Component
const ReservationCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay.setDate(firstDay.getDate() - firstDay.getDay()));

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const hasReservations = (date: Date) => {
    // Mock logic for demonstration
    return date.getDate() % 3 === 0;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h3 className="card-title">Reservation Calendar</h3>
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousMonth} className="btn btn-secondary btn-sm">
              <ChevronLeftIcon />
            </button>
            <span className="font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={goToNextMonth} className="btn btn-secondary btn-sm">
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-medium text-secondary py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((date, index) => (
            <div
              key={index}
              className={`
                text-center py-2 text-sm cursor-pointer rounded transition-colors
                ${isPastDate(date) ? 'text-gray-400' : 'text-gray-700'}
                ${isToday(date) ? 'bg-blue-600 text-white' : ''}
                ${hasReservations(date) && !isToday(date) ? 'bg-blue-100 text-blue-600' : ''}
                ${!isPastDate(date) && !isToday(date) && !hasReservations(date) ? 'hover:bg-gray-50' : ''}
              `}
            >
              {date.getDate()}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
            <span>Has Reservations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Professional Vehicle Kanban Component
const VehicleKanban = ({ vehicles }: { vehicles: any[] }) => {
  const getVehiclesByStatus = (status: string) => {
    return vehicles.filter(v => v.status?.toUpperCase() === status.toUpperCase());
  };

  const available = getVehiclesByStatus('AVAILABLE');
  const rented = getVehiclesByStatus('RENTED');
  const maintenance = getVehiclesByStatus('MAINTENANCE');

  const KanbanColumn = ({
    title,
    count,
    vehicles,
    colorClass,
    badgeColor
  }: {
    title: string;
    count: number;
    vehicles: any[];
    colorClass: string;
    badgeColor: string;
  }) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <span className={`badge ${badgeColor}`}>{count}</span>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {vehicles.slice(0, 5).map((vehicle, index) => (
          <div
            key={index}
            className={`p-3 bg-white border-l-4 ${colorClass} rounded-r border border-gray-100 shadow-sm`}
          >
            <div className="font-medium text-sm text-gray-900">
              {vehicle.make} {vehicle.model}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {vehicle.licensePlate}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {vehicle.type || 'Sedan'}
            </div>
          </div>
        ))}
        {vehicles.length > 5 && (
          <div className="text-xs text-center text-gray-400 py-2">
            +{vehicles.length - 5} more vehicles
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h3 className="card-title">Vehicle Status</h3>
          <a href="/vehicles" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </a>
        </div>
      </div>
      <div className="card-content">
        <div className="flex gap-6">
          <KanbanColumn
            title="Available"
            count={available.length}
            vehicles={available}
            colorClass="border-l-green-500"
            badgeColor="available"
          />
          <KanbanColumn
            title="Rented"
            count={rented.length}
            vehicles={rented}
            colorClass="border-l-blue-500"
            badgeColor="rented"
          />
          <KanbanColumn
            title="Maintenance"
            count={maintenance.length}
            vehicles={maintenance}
            colorClass="border-l-orange-500"
            badgeColor="maintenance"
          />
        </div>
      </div>
    </div>
  );
};

// Professional Activity Feed Component
const ActivityFeed = () => {
  const activities = [
    {
      type: 'rental',
      message: 'Toyota Camry rented by John Smith',
      timestamp: '2 minutes ago',
      icon: <CarIcon />,
      iconColor: 'bg-blue-500'
    },
    {
      type: 'payment',
      message: 'Payment received for reservation #1234',
      timestamp: '15 minutes ago',
      icon: <DollarIcon />,
      iconColor: 'bg-green-500'
    },
    {
      type: 'maintenance',
      message: 'BMW X5 scheduled for maintenance',
      timestamp: '1 hour ago',
      icon: <ClockIcon />,
      iconColor: 'bg-orange-500'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
      </div>
      <div className="card-content">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${activity.iconColor} flex items-center justify-center text-white text-sm`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  // Fetch vehicles data
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  // Fetch reservations data
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsAPI.getAll,
  });

  // Calculate KPI values
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const rentedVehicles = vehicles.filter(v => v.status === 'RENTED' || v.status === 'RESERVED').length;
  const pendingBookings = reservations.filter(r => r.status === 'PENDING').length;

  // Calculate fleet utilization
  const fleetUtilization = totalVehicles > 0 ? Math.round((rentedVehicles / totalVehicles) * 100) : 0;

  // Calculate monthly revenue (mock calculation)
  const monthlyRevenue = 18500;

  return (
    <div>
      {/* KPI Cards Section */}
      <div className="kpi-grid">
        <KPICard
          title="Active Rentals"
          value={rentedVehicles}
          icon={<CarIcon />}
          trend="+12%"
          iconColor="blue"
        />
        <KPICard
          title="Monthly Revenue"
          value={`$${(monthlyRevenue / 1000).toFixed(1)}K`}
          icon={<DollarIcon />}
          trend="+8%"
          iconColor="green"
        />
        <KPICard
          title="Fleet Utilization"
          value={`${rentedVehicles}/${totalVehicles}`}
          icon={<CarIcon />}
          trend={`${fleetUtilization}%`}
          iconColor="purple"
        />
        <KPICard
          title="Pending Bookings"
          value={pendingBookings}
          icon={<ClockIcon />}
          trend="3 pending"
          subtitle="Awaiting confirmation"
          iconColor="orange"
        />
      </div>

      {/* Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ReservationCalendar />
        <VehicleKanban vehicles={vehicles} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
};

export default DashboardPage;