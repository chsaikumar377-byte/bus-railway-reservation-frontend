import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminService';
import {
  Users, Bus, Train, Calendar, Ticket, CheckCircle, XCircle, IndianRupee,
  Plus, Edit, Trash2, Ban, Eye, RefreshCw, AlertCircle, X, ShieldAlert,
  Search, Filter
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, TRANSPORTS, ROUTES, SCHEDULES, BOOKINGS, USERS
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab Data States
  const [transports, setTransports] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  // Form States
  const [transportForm, setTransportForm] = useState({
    serviceNumber: '',
    serviceName: '',
    type: 'BUS',
    totalSeats: 24,
    seatLayoutType: 'BUS_2X2',
    amenities: 'Air Conditioned, WiFi, Charging Port, Water Bottle',
  });

  const [routeForm, setRouteForm] = useState({
    sourceCity: '',
    destinationCity: '',
    distanceKm: '',
    estimatedDurationMinutes: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    transportServiceId: '',
    routeId: '',
    departureTime: '08:00',
    arrivalTime: '12:00',
    journeyDate: new Date().toISOString().split('T')[0],
    baseFare: '450.00',
  });

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDashboard();
      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab) => {
    try {
      if (tab === 'TRANSPORTS') {
        const data = await adminApi.getTransports();
        setTransports(data);
      } else if (tab === 'ROUTES') {
        const data = await adminApi.getRoutes();
        setRoutes(data);
      } else if (tab === 'SCHEDULES') {
        const [schedData, transData, routeData] = await Promise.all([
          adminApi.getSchedules(),
          adminApi.getTransports(),
          adminApi.getRoutes(),
        ]);
        setSchedules(schedData);
        setTransports(transData);
        setRoutes(routeData);
        if (transData.length > 0) setScheduleForm((prev) => ({ ...prev, transportServiceId: transData[0].id }));
        if (routeData.length > 0) setScheduleForm((prev) => ({ ...prev, routeId: routeData[0].id }));
      } else if (tab === 'BOOKINGS') {
        const data = await adminApi.getBookings();
        setBookings(data);
      } else if (tab === 'USERS') {
        const data = await adminApi.getUsers();
        setUsers(data);
      }
    } catch (err) {
      alert('Error loading ' + tab + ': ' + err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'OVERVIEW') {
      loadTabData(tab);
    } else {
      fetchDashboardData();
    }
  };

  // Handlers for Add Transport
  const handleCreateTransport = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createTransport({
        ...transportForm,
        totalSeats: parseInt(transportForm.totalSeats, 10),
      });
      alert('Transport service and seat layout generated successfully!');
      setShowTransportModal(false);
      setTransportForm({
        serviceNumber: '',
        serviceName: '',
        type: 'BUS',
        totalSeats: 24,
        seatLayoutType: 'BUS_2X2',
        amenities: 'Air Conditioned, WiFi, Charging Port, Water Bottle',
      });
      loadTabData('TRANSPORTS');
    } catch (err) {
      alert('Error creating transport: ' + err.message);
    }
  };

  // Handlers for Add Route
  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createRoute({
        ...routeForm,
        distanceKm: parseFloat(routeForm.distanceKm),
        estimatedDurationMinutes: parseInt(routeForm.estimatedDurationMinutes, 10),
      });
      alert('Route created successfully!');
      setShowRouteModal(false);
      setRouteForm({
        sourceCity: '',
        destinationCity: '',
        distanceKm: '',
        estimatedDurationMinutes: '',
      });
      loadTabData('ROUTES');
    } catch (err) {
      alert('Error creating route: ' + err.message);
    }
  };

  // Handlers for Add Schedule
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createSchedule({
        transportServiceId: parseInt(scheduleForm.transportServiceId, 10),
        routeId: parseInt(scheduleForm.routeId, 10),
        departureTime: scheduleForm.departureTime.length === 5 ? `${scheduleForm.departureTime}:00` : scheduleForm.departureTime,
        arrivalTime: scheduleForm.arrivalTime.length === 5 ? `${scheduleForm.arrivalTime}:00` : scheduleForm.arrivalTime,
        journeyDate: scheduleForm.journeyDate,
        baseFare: scheduleForm.baseFare,
      });
      alert('Schedule added successfully!');
      setShowScheduleModal(false);
      loadTabData('SCHEDULES');
    } catch (err) {
      alert('Error creating schedule: ' + err.message);
    }
  };

  const handleCancelSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled journey?')) return;
    try {
      await adminApi.cancelSchedule(id);
      loadTabData('SCHEDULES');
    } catch (err) {
      alert('Failed to cancel schedule: ' + err.message);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const updated = await adminApi.toggleUserStatus(userId);
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      alert('Failed to toggle user status: ' + err.message);
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const matchRef = b.bookingReference?.toLowerCase().includes(q);
      const matchName = b.userName?.toLowerCase().includes(q);
      const matchEmail = b.userEmail?.toLowerCase().includes(q);
      return matchRef || matchName || matchEmail;
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="nav-admin-badge">Admin Dashboard</span>
          </div>
          <h1 style={{ fontSize: '2rem', color: '#0f2b48', fontWeight: 800, marginTop: '0.2rem' }}>
            Transport & Reservation Management
          </h1>
        </div>

        <button
          onClick={() => handleTabChange(activeTab)}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'OVERVIEW', label: 'Overview Analytics' },
          { id: 'TRANSPORTS', label: 'Transport Services' },
          { id: 'ROUTES', label: 'Routes' },
          { id: 'SCHEDULES', label: 'Schedules' },
          { id: 'BOOKINGS', label: 'All Reservations' },
          { id: 'USERS', label: 'User Directory' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === tab.id ? '#0d9488' : '#64748b',
              borderBottom: activeTab === tab.id ? '3px solid #0d9488' : '3px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === 'OVERVIEW' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ display: 'inline-block', width: '35px', height: '35px', border: '3px solid #cbd5e1', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : metrics ? (
            <div>
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#0284c7' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{metrics.totalPassengers}</div>
                    <div className="stat-label">Total Passengers</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#d97706' }}>
                    <Bus size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{metrics.totalBuses}</div>
                    <div className="stat-label">Buses Operating</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#4f46e5' }}>
                    <Train size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{metrics.totalTrains}</div>
                    <div className="stat-label">Trains Operating</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#0d9488' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{metrics.totalScheduledServices}</div>
                    <div className="stat-label">Scheduled Services</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#059669' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{metrics.confirmedBookings}</div>
                    <div className="stat-label">Confirmed Bookings</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#dc2626' }}>
                    <XCircle size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{metrics.cancelledBookings}</div>
                    <div className="stat-label">Cancelled Bookings</div>
                  </div>
                </div>

                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                  <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <div className="stat-value">₹{Number(metrics.totalRevenue || 0).toFixed(2)}</div>
                    <div className="stat-label">Total System Revenue (Demo Confirmed)</div>
                  </div>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div className="card" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#0f2b48', fontWeight: 700, marginBottom: '1rem' }}>
                  Quick Management Shortcuts
                </h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => { setActiveTab('TRANSPORTS'); setShowTransportModal(true); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add Bus / Train
                  </button>
                  <button onClick={() => { setActiveTab('ROUTES'); setShowRouteModal(true); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add Transport Route
                  </button>
                  <button onClick={() => { setActiveTab('SCHEDULES'); setShowScheduleModal(true); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add Journey Schedule
                  </button>
                  <button onClick={() => handleTabChange('BOOKINGS')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Ticket size={16} /> Inspect All Bookings
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: TRANSPORTS */}
      {activeTab === 'TRANSPORTS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 700 }}>
              Transport Services & Fleet ({transports.length})
            </h3>
            <button onClick={() => setShowTransportModal(true)} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
              <Plus size={16} /> Add Transport Service
            </button>
          </div>

          <div className="data-table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Service #</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Seat Layout</th>
                    <th>Amenities</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transports.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.serviceNumber}</strong></td>
                      <td>{t.serviceName}</td>
                      <td>
                        <span className={`service-badge ${t.type === 'BUS' ? 'bus' : 'train'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td>{t.totalSeats} seats</td>
                      <td><code>{t.seatLayoutType}</code></td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '240px' }}>{t.amenities}</td>
                      <td>
                        <span className={`badge ${t.active ? 'confirmed' : 'cancelled'}`}>
                          {t.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTES */}
      {activeTab === 'ROUTES' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 700 }}>
              Network Routes ({routes.length})
            </h3>
            <button onClick={() => setShowRouteModal(true)} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
              <Plus size={16} /> Add Route
            </button>
          </div>

          <div className="data-table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Source City</th>
                    <th>Destination City</th>
                    <th>Distance (km)</th>
                    <th>Est. Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td><strong>{r.sourceCity}</strong></td>
                      <td><strong>{r.destinationCity}</strong></td>
                      <td>{r.distanceKm ? `${r.distanceKm} km` : 'N/A'}</td>
                      <td>{Math.floor(r.estimatedDurationMinutes / 60)}h {r.estimatedDurationMinutes % 60}m</td>
                      <td>
                        <span className={`badge ${r.active ? 'confirmed' : 'cancelled'}`}>
                          {r.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULES */}
      {activeTab === 'SCHEDULES' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 700 }}>
              Journey Schedules ({schedules.length})
            </h3>
            <button onClick={() => setShowScheduleModal(true)} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
              <Plus size={16} /> Add Schedule
            </button>
          </div>

          <div className="data-table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service</th>
                    <th>Route</th>
                    <th>Journey Date</th>
                    <th>Dep &rarr; Arr</th>
                    <th>Base Fare</th>
                    <th>Seats Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td>
                        <strong>{s.serviceName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.serviceNumber} ({s.transportType})</div>
                      </td>
                      <td>{s.sourceCity} &rarr; {s.destinationCity}</td>
                      <td>{s.journeyDate}</td>
                      <td>{s.departureTime} &rarr; {s.arrivalTime}</td>
                      <td><strong>₹{s.baseFare}</strong></td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.availableSeatsCount > 5 ? '#059669' : '#d97706' }}>
                          {s.availableSeatsCount} / {s.totalSeats}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'SCHEDULED' || s.status === 'ACTIVE' ? 'confirmed' : 'cancelled'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        {s.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelSchedule(s.id)}
                            className="btn-danger"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            title="Cancel Schedule"
                          >
                            <Ban size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ALL BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 700 }}>
              All System Bookings ({bookings.length})
            </h3>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="input-with-icon" style={{ width: '220px' }}>
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search ref or passenger"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  style={{ padding: '0.5rem 0.5rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                className="input-field"
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                style={{ width: '130px', padding: '0.5rem', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Status</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="data-table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Passenger / User</th>
                    <th>Service & Route</th>
                    <th>Date & Time</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.bookingReference}</strong></td>
                      <td>
                        <div>{b.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.userEmail}</div>
                      </td>
                      <td>
                        <strong>{b.schedule?.serviceName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {b.schedule?.sourceCity} &rarr; {b.schedule?.destinationCity}
                        </div>
                      </td>
                      <td>{b.schedule?.journeyDate}</td>
                      <td>
                        <strong style={{ color: '#0d9488' }}>
                          {b.seatNumbers?.join(', ')}
                        </strong>
                      </td>
                      <td><strong>₹{b.totalAmount}</strong></td>
                      <td>
                        <span className={`badge ${b.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: USER DIRECTORY */}
      {activeTab === 'USERS' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 700, marginBottom: '1.25rem' }}>
            Registered Users ({users.length})
          </h3>

          <div className="data-table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Account Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.fullName}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'confirmed' : 'confirmed'}`} style={{ backgroundColor: u.role === 'ROLE_ADMIN' ? '#fef3c7' : '#e0e7ff', color: u.role === 'ROLE_ADMIN' ? '#92400e' : '#3730a3' }}>
                          {u.role === 'ROLE_ADMIN' ? 'ADMIN' : 'PASSENGER'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.active ? 'confirmed' : 'cancelled'}`}>
                          {u.active ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'ROLE_ADMIN' && (
                          <button
                            onClick={() => handleToggleUser(u.id)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TRANSPORT SERVICE */}
      {showTransportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 800 }}>Add Transport Service</h3>
              <button onClick={() => setShowTransportModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateTransport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Transport Type *</label>
                <select
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  value={transportForm.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setTransportForm({
                      ...transportForm,
                      type: newType,
                      seatLayoutType: newType === 'BUS' ? 'BUS_2X2' : 'TRAIN_3X2',
                      totalSeats: newType === 'BUS' ? 24 : 36,
                    });
                  }}
                >
                  <option value="BUS">BUS</option>
                  <option value="TRAIN">TRAIN</option>
                </select>
              </div>

              <div className="form-group">
                <label>Service Number * (e.g. BUS-301 or TRN-12900)</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="e.g. BUS-301"
                  value={transportForm.serviceNumber}
                  onChange={(e) => setTransportForm({ ...transportForm, serviceNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="e.g. Scania Super Luxury AC"
                  value={transportForm.serviceName}
                  onChange={(e) => setTransportForm({ ...transportForm, serviceName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Total Seats *</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ paddingLeft: '0.85rem' }}
                    min="10"
                    max="100"
                    value={transportForm.totalSeats}
                    onChange={(e) => setTransportForm({ ...transportForm, totalSeats: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Layout Type</label>
                  <select
                    className="input-field"
                    style={{ paddingLeft: '0.85rem' }}
                    value={transportForm.seatLayoutType}
                    onChange={(e) => setTransportForm({ ...transportForm, seatLayoutType: e.target.value })}
                  >
                    {transportForm.type === 'BUS' ? (
                      <>
                        <option value="BUS_2X2">BUS_2X2 (Standard)</option>
                        <option value="BUS_2X1">BUS_2X1 (Sleeper)</option>
                      </>
                    ) : (
                      <>
                        <option value="TRAIN_3X2">TRAIN_3X2 (Chair Car)</option>
                        <option value="TRAIN_2X2">TRAIN_2X2 (Executive)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Amenities</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="WiFi, AC, Charging Point"
                  value={transportForm.amenities}
                  onChange={(e) => setTransportForm({ ...transportForm, amenities: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Create Transport & Generate Seats
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROUTE */}
      {showRouteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 800 }}>Create New Route</h3>
              <button onClick={() => setShowRouteModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Source City *</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="e.g. Ahmedabad"
                  value={routeForm.sourceCity}
                  onChange={(e) => setRouteForm({ ...routeForm, sourceCity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination City *</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="e.g. Surat"
                  value={routeForm.destinationCity}
                  onChange={(e) => setRouteForm({ ...routeForm, destinationCity: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Distance (km)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    style={{ paddingLeft: '0.85rem' }}
                    placeholder="e.g. 260"
                    value={routeForm.distanceKm}
                    onChange={(e) => setRouteForm({ ...routeForm, distanceKm: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ paddingLeft: '0.85rem' }}
                    placeholder="e.g. 270 (4.5 hrs)"
                    value={routeForm.estimatedDurationMinutes}
                    onChange={(e) => setRouteForm({ ...routeForm, estimatedDurationMinutes: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Create Route
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SCHEDULE */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 800 }}>Schedule Journey</h3>
              <button onClick={() => setShowScheduleModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Transport Service *</label>
                <select
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  value={scheduleForm.transportServiceId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, transportServiceId: e.target.value })}
                  required
                >
                  {transports.filter((t) => t.active).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.serviceName} ({t.serviceNumber} - {t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Route *</label>
                <select
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  value={scheduleForm.routeId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, routeId: e.target.value })}
                  required
                >
                  {routes.filter((r) => r.active).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.sourceCity} &rarr; {r.destinationCity} ({r.distanceKm} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Journey Date *</label>
                <input
                  type="date"
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduleForm.journeyDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, journeyDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Departure Time *</label>
                  <input
                    type="time"
                    className="input-field"
                    style={{ paddingLeft: '0.85rem' }}
                    value={scheduleForm.departureTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, departureTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Arrival Time *</label>
                  <input
                    type="time"
                    className="input-field"
                    style={{ paddingLeft: '0.85rem' }}
                    value={scheduleForm.arrivalTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, arrivalTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Base Fare (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  style={{ paddingLeft: '0.85rem' }}
                  value={scheduleForm.baseFare}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, baseFare: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Publish Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW BOOKING DETAILS */}
      {viewingBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Booking Reference</span>
                <h3 style={{ fontSize: '1.4rem', color: '#0f2b48', fontWeight: 800 }}>
                  {viewingBooking.bookingReference}
                </h3>
              </div>
              <button onClick={() => setViewingBooking(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <div><strong>{viewingBooking.userName}</strong> ({viewingBooking.userEmail})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Status:</span>
                <div>
                  <span className={`badge ${viewingBooking.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`}>
                    {viewingBooking.status}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Service & Route:</span>
                <div>{viewingBooking.schedule?.serviceName} ({viewingBooking.schedule?.sourceCity} &rarr; {viewingBooking.schedule?.destinationCity})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Journey Date:</span>
                <div>{viewingBooking.schedule?.journeyDate} at {viewingBooking.schedule?.departureTime}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#0f2b48', fontWeight: 700, marginBottom: '0.5rem' }}>
                Passengers & Seats ({viewingBooking.totalPassengers})
              </h4>
              {viewingBooking.passengers?.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span>{p.passengerName} ({p.age} yrs, {p.gender})</span>
                  <strong style={{ color: '#0d9488' }}>Seat {p.seatNumber}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: '#64748b' }}>Total Paid: <strong>₹{viewingBooking.totalAmount}</strong></span>
              <button onClick={() => setViewingBooking(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
