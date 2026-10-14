import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transportApi } from '../api/transportService';
import { Bus, Train, Calendar, Users, ArrowRightLeft, Search, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [transportType, setTransportType] = useState('ALL'); // ALL, BUS, TRAIN
  const [sourceCity, setSourceCity] = useState('Mumbai');
  const [destinationCity, setDestinationCity] = useState('Pune');
  const [journeyDate, setJourneyDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);

  const [availableCities, setAvailableCities] = useState({
    sourceCities: ['Mumbai', 'Pune', 'Delhi', 'Jaipur', 'Bangalore', 'Chennai', 'Hyderabad'],
    destinationCities: ['Pune', 'Mumbai', 'Jaipur', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad'],
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await transportApi.getCities();
        if (data.sourceCities?.length && data.destinationCities?.length) {
          setAvailableCities(data);
          if (data.sourceCities.length > 0) setSourceCity(data.sourceCities[0]);
          if (data.destinationCities.length > 1) setDestinationCity(data.destinationCities[1]);
        }
      } catch (err) {
        console.warn('Using default city list for offline/local fallback');
      }
    };
    fetchCities();
  }, []);

  const handleSwapCities = () => {
    const temp = sourceCity;
    setSourceCity(destinationCity);
    setDestinationCity(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (sourceCity === destinationCity) {
      alert('Source and Destination cities cannot be the same. Please select different cities.');
      return;
    }

    const queryParams = new URLSearchParams({
      sourceCity,
      destinationCity,
      journeyDate,
      passengers: passengers.toString(),
    });

    if (transportType !== 'ALL') {
      queryParams.append('transportType', transportType);
    }

    navigate(`/search?${queryParams.toString()}`);
  };

  const popularRoutes = [
    { src: 'Mumbai', dst: 'Pune', type: 'BUS & TRAIN', duration: '3h 00m', fare: '₹450' },
    { src: 'Delhi', dst: 'Jaipur', type: 'BUS & TRAIN', duration: '5h 00m', fare: '₹550' },
    { src: 'Bangalore', dst: 'Chennai', type: 'TRAIN', duration: '5h 30m', fare: '₹600' },
    { src: 'Hyderabad', dst: 'Bangalore', type: 'BUS', duration: '9h 00m', fare: '₹750' },
  ];

  const handleQuickRouteClick = (src, dst) => {
    setSourceCity(src);
    setDestinationCity(dst);
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container">
          <h1 className="hero-title">
            Travel Smarter with <span>TravelGo</span>
          </h1>
          <p className="hero-subtitle">
            Seamlessly search, check live seat layouts, and reserve tickets across modern high-speed buses and premier trains.
          </p>
        </div>
      </section>

      {/* Interactive Search Panel Card */}
      <div className="container search-panel-wrapper">
        <div className="search-card">
          {/* Transport Tabs */}
          <div className="transport-type-tabs">
            <button
              type="button"
              className={`transport-tab ${transportType === 'ALL' ? 'active' : ''}`}
              onClick={() => setTransportType('ALL')}
            >
              <Sparkles size={18} />
              <span>All Transports</span>
            </button>
            <button
              type="button"
              className={`transport-tab ${transportType === 'BUS' ? 'active' : ''}`}
              onClick={() => setTransportType('BUS')}
            >
              <Bus size={18} />
              <span>Buses</span>
            </button>
            <button
              type="button"
              className={`transport-tab ${transportType === 'TRAIN' ? 'active' : ''}`}
              onClick={() => setTransportType('TRAIN')}
            >
              <Train size={18} />
              <span>Trains</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form-grid">
            {/* Source City */}
            <div className="form-group">
              <label>From City</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <select
                  className="input-field"
                  value={sourceCity}
                  onChange={(e) => setSourceCity(e.target.value)}
                  required
                >
                  {availableCities.sourceCities.map((city) => (
                    <option key={`src-${city}`} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="swap-btn"
                onClick={handleSwapCities}
                title="Swap source and destination"
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* Destination City */}
            <div className="form-group">
              <label>To City</label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" />
                <select
                  className="input-field"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  required
                >
                  {availableCities.destinationCities.map((city) => (
                    <option key={`dst-${city}`} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Journey Date */}
            <div className="form-group">
              <label>Journey Date</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  type="date"
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Passenger Count */}
            <div className="form-group">
              <label>Passengers</label>
              <div className="input-with-icon">
                <Users size={18} className="input-icon" />
                <select
                  className="input-field"
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div>
              <button type="submit" className="btn-search">
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Popular Routes Section */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <h2 className="section-title">Popular Routes & Quick Fares</h2>
        <p className="section-subtitle">
          Explore frequently traveled bus and rail routes across major urban corridors.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {popularRoutes.map((route, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                padding: '1.25rem',
              }}
              onClick={() => handleQuickRouteClick(route.src, route.dst)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  {route.type}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{route.duration}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f2b48', fontWeight: 700, marginBottom: '0.4rem' }}>
                {route.src} &rarr; {route.dst}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Starting from</span>
                <strong style={{ fontSize: '1.2rem', color: '#0d9488' }}>{route.fare}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key System Features */}
      <section className="container">
        <h2 className="section-title">Why Reserve with TravelGo?</h2>
        <p className="section-subtitle">
          Engineered for reliability, concurrency safety, and effortless travel planning.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={28} />
            </div>
            <h3 className="feature-title">Pessimistic Concurrency Locking</h3>
            <p className="feature-desc">
              Transactions are protected with database-level row locking and active seat unique constraints to prevent double-booking.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Bus size={28} />
            </div>
            <h3 className="feature-title">Interactive Visual Seat Maps</h3>
            <p className="feature-desc">
              View live coach configurations for 2x2 buses and 3x2 trains. Select window or aisle seats with instant price recalculation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Clock size={28} />
            </div>
            <h3 className="feature-title">Instant Ticket Generation</h3>
            <p className="feature-desc">
              Download and print professional boarding pass tickets with verified booking references and simulated demo payment confirmation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <ArrowRightLeft size={28} />
            </div>
            <h3 className="feature-title">Seamless One-Click Cancellation</h3>
            <p className="feature-desc">
              Cancel active reservations according to system rules. Locked seats are instantly released back into inventory for other passengers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
