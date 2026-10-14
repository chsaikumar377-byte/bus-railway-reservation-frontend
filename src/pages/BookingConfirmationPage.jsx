import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingService';
import { CheckCircle2, Printer, Ticket, Home, Bus, Train, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          const data = await bookingApi.getById(id);
          setBooking(data);
        } catch (err) {
          setError(err.message || 'Failed to load booking details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [booking, id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Retrieving confirmed reservation details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '600px' }}>
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <div>{error || 'Reservation not found.'}</div>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ width: 'auto' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const isBus = booking.schedule?.transportType === 'BUS';

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '750px' }}>
      {/* Success Banner */}
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', marginBottom: '2rem' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle2 size={42} />
        </div>

        <h2 style={{ fontSize: '1.85rem', color: '#0f2b48', fontWeight: 800, marginBottom: '0.4rem' }}>
          Booking Confirmed!
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Your seats are reserved and saved to database. A copy of your reservation reference is shown below.
        </p>

        <div style={{ display: 'inline-block', backgroundColor: '#f0fdfa', border: '2px dashed #0d9488', padding: '0.85rem 1.75rem', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#0f766e', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Booking Reference ID
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f2b48', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
            {booking.bookingReference}
          </div>
        </div>
      </div>

      {/* Ticket Details Summary Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={`service-badge ${isBus ? 'bus' : 'train'}`}>
              {isBus ? <Bus size={13} /> : <Train size={13} />}
              {booking.schedule?.transportType}
            </span>
            <h3 style={{ fontSize: '1.2rem', color: '#0f2b48', fontWeight: 700 }}>
              {booking.schedule?.serviceName}
            </h3>
          </div>
          <span className="badge confirmed">
            {booking.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Route</div>
            <strong style={{ fontSize: '1rem', color: '#0f2b48' }}>
              {booking.schedule?.sourceCity} &rarr; {booking.schedule?.destinationCity}
            </strong>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date & Departure</div>
            <strong style={{ fontSize: '1rem', color: '#0f2b48' }}>
              {booking.schedule?.journeyDate} at {booking.schedule?.departureTime}
            </strong>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned Seats</div>
            <strong style={{ fontSize: '1rem', color: '#0d9488' }}>
              {booking.seatNumbers ? booking.seatNumbers.join(', ') : 'N/A'}
            </strong>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Payment Mode</div>
            <strong style={{ fontSize: '1rem', color: '#0f2b48' }}>
              {booking.paymentMethod} ({booking.paymentStatus})
            </strong>
          </div>
        </div>

        {/* Passenger List */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#0f2b48', fontWeight: 700, marginBottom: '0.6rem' }}>
            Confirmed Travelers ({booking.totalPassengers})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
            {booking.passengers?.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < booking.passengers.length - 1 ? '1px dashed #e2e8f0' : 'none', paddingBottom: '0.3rem' }}>
                <span>{p.passengerName} ({p.age} yrs, {p.gender})</span>
                <strong style={{ color: '#0d9488' }}>Seat: {p.seatNumber}</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <span style={{ fontSize: '1rem', color: '#64748b' }}>Total Fare Paid:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b48' }}>
            ₹{booking.totalAmount}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to={`/ticket/${booking.id}`} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
          <Printer size={18} />
          <span>Print / View E-Ticket</span>
        </Link>
        <Link to="/my-bookings" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <Ticket size={18} />
          <span>Go to My Bookings</span>
        </Link>
        <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <Home size={18} />
          <span>Book Another Trip</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
