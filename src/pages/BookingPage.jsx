import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../api/bookingService';
import { User, CreditCard, ShieldCheck, AlertCircle, CheckCircle, ArrowLeft, Bus, Train } from 'lucide-react';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const state = location.state || {};
  const { schedule, selectedSeats = [], passengerCount = 1 } = state;

  useEffect(() => {
    if (!schedule || selectedSeats.length === 0) {
      navigate('/');
    } else if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
  }, [schedule, selectedSeats, isAuthenticated, navigate, location]);

  // Passenger form inputs
  const [passengers, setPassengers] = useState(() => {
    return selectedSeats.map((seat, idx) => ({
      passengerName: idx === 0 && user?.fullName ? user.fullName : '',
      age: '',
      gender: 'Male',
      seatId: seat.id,
      seatNumber: seat.seatNumber,
    }));
  });

  const [paymentMethod, setPaymentMethod] = useState('DEMO_CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!schedule || selectedSeats.length === 0) {
    return null;
  }

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const calculateTotalFare = () => {
    return selectedSeats.reduce((sum, s) => sum + Number(s.fare || schedule.baseFare), 0);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.passengerName.trim()) {
        setError(`Please enter the name for Passenger ${i + 1} (${p.seatNumber}).`);
        return;
      }
      const ageNum = parseInt(p.age, 10);
      if (!p.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        setError(`Please enter a valid age (1-120) for Passenger ${i + 1} (${p.seatNumber}).`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        scheduleId: schedule.id,
        passengers: passengers.map((p) => ({
          passengerName: p.passengerName.trim(),
          age: parseInt(p.age, 10),
          gender: p.gender,
          seatId: p.seatId,
          seatNumber: p.seatNumber,
        })),
        paymentMethod,
      };

      const bookingResponse = await bookingApi.create(payload);
      navigate(`/booking/confirmation/${bookingResponse.id}`, {
        state: { booking: bookingResponse },
      });
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBus = schedule.transportType === 'BUS';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} /> Back to Search Results
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
        {/* Left: Passenger Forms and Payment */}
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0f2b48', fontWeight: 800, marginBottom: '0.5rem' }}>
            Passenger Details
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Enter official government ID details for all travelers.
          </p>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={20} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmitBooking}>
            {passengers.map((p, idx) => (
              <div key={p.seatId} className="card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
                  <h4 style={{ color: '#0f2b48', fontSize: '1rem', fontWeight: 700 }}>
                    Passenger {idx + 1}
                  </h4>
                  <span className="badge" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                    Assigned Seat: {p.seatNumber}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ paddingLeft: '0.85rem' }}
                      placeholder="e.g. John Doe"
                      value={p.passengerName}
                      onChange={(e) => handlePassengerChange(idx, 'passengerName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      className="input-field"
                      style={{ paddingLeft: '0.85rem' }}
                      placeholder="Age"
                      min="1"
                      max="120"
                      value={p.age}
                      onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      className="input-field"
                      style={{ paddingLeft: '0.85rem' }}
                      value={p.gender}
                      onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Demo Payment Panel */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CreditCard size={20} style={{ color: '#0d9488' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#0f2b48', fontWeight: 700 }}>
                  Demo Payment Gateway
                </h3>
              </div>

              {/* Explicit Demo Disclaimer */}
              <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <strong>DEMO SIMULATION:</strong> No actual currency will be debited. This is a local mock checkout to test transactional reservation flow.
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Select Simulated Payment Method</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', backgroundColor: paymentMethod === 'DEMO_CARD' ? '#f0fdfa' : '#fff' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="DEMO_CARD"
                      checked={paymentMethod === 'DEMO_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Demo Credit / Debit Card (Instant Simulation)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', backgroundColor: paymentMethod === 'DEMO_UPI' ? '#f0fdfa' : '#fff' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="DEMO_UPI"
                      checked={paymentMethod === 'DEMO_UPI'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Demo UPI / QR Code (Instant Simulation)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', backgroundColor: paymentMethod === 'DEMO_NET_BANKING' ? '#f0fdfa' : '#fff' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="DEMO_NET_BANKING"
                      checked={paymentMethod === 'DEMO_NET_BANKING'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Demo Net Banking (Instant Simulation)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', height: '48px', fontSize: '1.05rem' }}
              >
                {loading ? 'Confirming Reservation & Locking Seats...' : `Pay ₹${calculateTotalFare().toFixed(2)} & Confirm Reservation`}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Booking Summary Card */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f2b48', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              Trip Summary
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className={`service-badge ${isBus ? 'bus' : 'train'}`}>
                {isBus ? <Bus size={12} /> : <Train size={12} />}
                {schedule.transportType}
              </span>
              <strong style={{ color: '#0f2b48' }}>{schedule.serviceName}</strong>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Service #: {schedule.serviceNumber}
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Route:</span>
                <strong>{schedule.sourceCity} &rarr; {schedule.destinationCity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Journey Date:</span>
                <strong>{schedule.journeyDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Departure:</span>
                <strong>{schedule.departureTime}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Selected Seats:</span>
                <strong style={{ color: '#0d9488' }}>
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Base Fare ({selectedSeats.length} &times; ₹{schedule.baseFare})</span>
                <span>₹{calculateTotalFare().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Booking Convenience Fee</span>
                <span>₹0.00 (Demo Waived)</span>
              </div>
              <div style={{ borderTop: '2px solid #0f2b48', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#0f2b48' }}>
                <span>Final Payable:</span>
                <span>₹{calculateTotalFare().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
