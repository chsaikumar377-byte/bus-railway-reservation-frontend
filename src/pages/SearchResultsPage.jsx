import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { scheduleApi } from '../api/scheduleService';
import SeatLayout from '../components/SeatLayout';
import { Bus, Train, Clock, ArrowRight, ShieldCheck, Filter, Wifi, Snowflake, Zap, Coffee, AlertCircle } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sourceCity = searchParams.get('sourceCity') || '';
  const destinationCity = searchParams.get('destinationCity') || '';
  const journeyDate = searchParams.get('journeyDate') || '';
  const transportTypeParam = searchParams.get('transportType') || '';
  const passengerCount = parseInt(searchParams.get('passengers') || '1', 10);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active expanded seat layout schedule ID
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [seatLayoutData, setSeatLayoutData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Sidebar Filters
  const [typeFilter, setTypeFilter] = useState(transportTypeParam || 'ALL');
  const [maxPrice, setMaxPrice] = useState(2000);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await scheduleApi.search({
          sourceCity,
          destinationCity,
          journeyDate,
          transportType: transportTypeParam || null,
          passengers: passengerCount,
        });
        setSchedules(results);
      } catch (err) {
        setError(err.message || 'Failed to search schedules.');
      } finally {
        setLoading(false);
      }
    };

    if (sourceCity && destinationCity && journeyDate) {
      fetchSchedules();
    }
  }, [sourceCity, destinationCity, journeyDate, transportTypeParam, passengerCount]);

  const handleToggleSeats = async (schedule) => {
    if (activeScheduleId === schedule.id) {
      setActiveScheduleId(null);
      setSeatLayoutData(null);
      setSelectedSeats([]);
      return;
    }

    setActiveScheduleId(schedule.id);
    setLayoutLoading(true);
    setSelectedSeats([]);
    try {
      const data = await scheduleApi.getSeats(schedule.id);
      setSeatLayoutData(data);
    } catch (err) {
      alert('Error fetching seat layout: ' + err.message);
      setActiveScheduleId(null);
    } finally {
      setLayoutLoading(false);
    }
  };

  const handleSeatToggle = (seat) => {
    const exists = selectedSeats.some((s) => s.id === seat.id);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleProceedToBooking = (schedule) => {
    if (selectedSeats.length !== passengerCount) {
      alert(`Please select exactly ${passengerCount} seat(s) before proceeding.`);
      return;
    }

    navigate('/booking', {
      state: {
        schedule,
        selectedSeats,
        passengerCount,
      },
    });
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    if (typeFilter !== 'ALL' && s.transportType !== typeFilter) return false;
    if (Number(s.baseFare) > maxPrice) return false;
    return true;
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header Search Info */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Search Results
          </span>
          <h2 style={{ fontSize: '1.5rem', color: '#0f2b48', fontWeight: 800 }}>
            {sourceCity} &rarr; {destinationCity}
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.2rem' }}>
            Date: <strong>{journeyDate}</strong> &bull; Passengers: <strong>{passengerCount}</strong>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          Modify Search
        </button>
      </div>

      <div className="results-container">
        {/* Left Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-title">
            <span>Filters</span>
            <Filter size={16} />
          </div>

          <div className="filter-group">
            <label className="filter-label">Transport Mode</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="typeFilter"
                  checked={typeFilter === 'ALL'}
                  onChange={() => setTypeFilter('ALL')}
                />
                All ({schedules.length})
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="typeFilter"
                  checked={typeFilter === 'BUS'}
                  onChange={() => setTypeFilter('BUS')}
                />
                Buses ({schedules.filter((s) => s.transportType === 'BUS').length})
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="typeFilter"
                  checked={typeFilter === 'TRAIN'}
                  onChange={() => setTypeFilter('TRAIN')}
                />
                Trains ({schedules.filter((s) => s.transportType === 'TRAIN').length})
              </label>
            </div>
          </div>

          <div className="filter-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="filter-label" style={{ margin: 0 }}>Max Fare</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488' }}>₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="300"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0d9488' }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#0d9488' }} />
            Prices shown are calculated securely on server with seat class adjustments.
          </div>
        </aside>

        {/* Right Schedules List */}
        <main>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Searching real-time scheduled services...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <AlertCircle size={20} />
              <div>
                <strong>Search Error: </strong>
                {error}
              </div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Clock size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#0f2b48', marginBottom: '0.5rem' }}>No Schedules Found</h3>
              <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                There are no active scheduled services between {sourceCity} and {destinationCity} matching your filters on {journeyDate}.
              </p>
              <button onClick={() => navigate('/')} className="btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
                Back to Search
              </button>
            </div>
          ) : (
            filteredSchedules.map((schedule) => {
              const isSelected = activeScheduleId === schedule.id;
              const isBus = schedule.transportType === 'BUS';

              return (
                <div key={schedule.id} className="schedule-card">
                  <div className="schedule-card-header">
                    {/* Operator & Type */}
                    <div>
                      <span className={`service-badge ${isBus ? 'bus' : 'train'}`}>
                        {isBus ? <Bus size={13} /> : <Train size={13} />}
                        {schedule.transportType}
                      </span>
                      <h3 className="service-name">{schedule.serviceName}</h3>
                      <div className="service-num">Service #: {schedule.serviceNumber}</div>
                    </div>

                    {/* Timings & Duration */}
                    <div className="journey-timing">
                      <div className="time-box">
                        <h4>{schedule.departureTime}</h4>
                        <p>{schedule.sourceCity}</p>
                      </div>

                      <div className="duration-line">
                        <span className="duration-text">{schedule.formattedDuration}</span>
                        <div className="line-decor"></div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {schedule.distanceKm ? `${schedule.distanceKm} km` : 'Direct'}
                        </span>
                      </div>

                      <div className="time-box">
                        <h4>{schedule.arrivalTime}</h4>
                        <p>{schedule.destinationCity}</p>
                      </div>
                    </div>

                    {/* Fare & Availability */}
                    <div className="fare-box">
                      <div className="fare-amount">₹{schedule.baseFare}</div>
                      <div style={{ fontSize: '0.8rem', color: schedule.availableSeatsCount > 5 ? '#059669' : '#d97706', fontWeight: 600 }}>
                        {schedule.availableSeatsCount} seats available
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      <button
                        onClick={() => handleToggleSeats(schedule)}
                        className={`btn-select-seats ${isSelected ? 'active' : ''}`}
                        style={{ backgroundColor: isSelected ? '#0f2b48' : '#0d9488' }}
                      >
                        {isSelected ? 'Hide Seats' : 'Select Seats'}
                      </button>
                    </div>
                  </div>

                  {/* Amenities bar */}
                  <div className="amenities-bar">
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Snowflake size={14} style={{ color: '#0284c7' }} /> AC
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Wifi size={14} style={{ color: '#0d9488' }} /> High-speed WiFi
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Zap size={14} style={{ color: '#f59e0b' }} /> USB Charging
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Coffee size={14} style={{ color: '#b45309' }} /> Snacks / Water
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Layout: {schedule.seatLayoutType}
                    </span>
                  </div>

                  {/* Expanded Visual Seat Picker */}
                  {isSelected && (
                    <div>
                      {layoutLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                          <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid #cbd5e1', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>Loading coach layout...</p>
                        </div>
                      ) : (
                        <SeatLayout
                          schedule={schedule}
                          seats={seatLayoutData?.seats || []}
                          layoutType={seatLayoutData?.layoutType || schedule.seatLayoutType}
                          requiredCount={passengerCount}
                          selectedSeats={selectedSeats}
                          onSeatToggle={handleSeatToggle}
                          onProceed={() => handleProceedToBooking(schedule)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResultsPage;
