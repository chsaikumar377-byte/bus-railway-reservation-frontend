import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/bookingService';
import { Ticket, Bus, Train, Printer, Ban, AlertCircle, CheckCircle, Calendar, Clock, X, Search } from 'lucide-react';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Filter: ALL, CONFIRMED, CANCELLED
  const [filter, setFilter] = useState('ALL');

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Personal reasons / plan change');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancelReason('Personal reasons / plan change');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      const updated = await bookingApi.cancel(cancellingBooking.id, cancelReason);
      setBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
      setCancelSuccessMsg(`Reservation ${updated.bookingReference} successfully cancelled. Seats have been released.`);
      setCancellingBooking(null);
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#0f2b48', fontWeight: 800 }}>
            My Reservations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            View ticket details, print boarding passes, or manage cancellations.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.35rem', borderRadius: '8px' }}>
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: filter === f ? '#ffffff' : 'transparent',
                color: filter === f ? '#0f2b48' : '#64748b',
                boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()} ({f === 'ALL' ? bookings.length : bookings.filter((b) => b.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {cancelSuccessMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={20} />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span>{cancelSuccessMsg}</span>
            <button onClick={() => setCancelSuccessMsg(null)} style={{ color: '#065f46' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading your reservations...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Ticket size={50} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f2b48', marginBottom: '0.5rem' }}>
            No Bookings Found
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            You have no {filter !== 'ALL' ? filter.toLowerCase() : ''} reservations registered yet.
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            Search & Book Tickets
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredBookings.map((booking) => {
            const isBus = booking.schedule?.transportType === 'BUS';
            const isConfirmed = booking.status === 'CONFIRMED';

            return (
              <div key={booking.id} className="card" style={{ padding: '1.5rem', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className={`service-badge ${isBus ? 'bus' : 'train'}`}>
                      {isBus ? <Bus size={13} /> : <Train size={13} />}
                      {booking.schedule?.transportType}
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f2b48' }}>
                      {booking.schedule?.serviceName}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      ({booking.schedule?.serviceNumber})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Ref: <strong style={{ color: '#0f2b48' }}>{booking.bookingReference}</strong>
                    </span>
                    <span className={`badge ${isConfirmed ? 'confirmed' : 'cancelled'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Route</div>
                    <div style={{ fontWeight: 700, color: '#0f2b48' }}>
                      {booking.schedule?.sourceCity} &rarr; {booking.schedule?.destinationCity}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Journey Date & Time</div>
                    <div style={{ fontWeight: 600 }}>
                      {booking.schedule?.journeyDate} at {booking.schedule?.departureTime}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Seats & Travelers</div>
                    <div style={{ fontWeight: 600, color: '#0d9488' }}>
                      {booking.seatNumbers ? booking.seatNumbers.join(', ') : 'N/A'} ({booking.totalPassengers} {booking.totalPassengers === 1 ? 'person' : 'people'})
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Amount Paid</div>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f2b48' }}>
                      ₹{booking.totalAmount}
                    </div>
                  </div>
                </div>

                {/* Cancellation Details if Cancelled */}
                {!isConfirmed && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      Cancelled Reason: <strong>{booking.cancellationReason || 'User request'}</strong>
                    </span>
                    <span>Refund Status: <strong>{booking.paymentStatus}</strong></span>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <Link
                    to={`/ticket/${booking.id}`}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Printer size={15} />
                    <span>View / Print Ticket</span>
                  </Link>

                  {isConfirmed && (
                    <button
                      onClick={() => handleOpenCancelModal(booking)}
                      className="btn-danger"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                    >
                      <Ban size={15} />
                      <span>Cancel Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#991b1b', fontWeight: 800 }}>
                Cancel Reservation
              </h3>
              <button onClick={() => setCancellingBooking(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Are you sure you want to cancel booking <strong>{cancellingBooking.bookingReference}</strong> ({cancellingBooking.schedule?.sourceCity} to {cancellingBooking.schedule?.destinationCity})?
            </p>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#b45309', marginBottom: '1.25rem' }}>
              All {cancellingBooking.totalPassengers} reserved seat(s) ({cancellingBooking.seatNumbers?.join(', ')}) will be immediately released back into available inventory for other passengers.
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Cancellation Reason</label>
              <textarea
                className="input-field"
                style={{ paddingLeft: '0.85rem', minHeight: '70px' }}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Specify reason for cancellation"
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCancellingBooking(null)}
                disabled={cancelLoading}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling & Releasing Seats...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
