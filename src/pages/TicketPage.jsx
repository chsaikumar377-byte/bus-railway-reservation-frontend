import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingService';
import { Printer, ArrowLeft, Bus, Train, AlertTriangle, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

const TicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await bookingApi.getById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Unable to retrieve ticket details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Formatting official E-Ticket for print...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '600px' }}>
        <div className="alert alert-danger">{error || 'Ticket not found'}</div>
        <button onClick={() => navigate('/my-bookings')} className="btn-secondary">
          Back to My Bookings
        </button>
      </div>
    );
  }

  const isBus = booking.schedule?.transportType === 'BUS';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/my-bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to My Bookings
        </Link>
        <button
          onClick={handlePrint}
          className="btn-primary"
          style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
        >
          <Printer size={18} />
          <span>Print Ticket / Save PDF</span>
        </button>
      </div>

      {/* Main Boarding Pass / E-Ticket */}
      <div className="print-ticket-container">
        {/* Ticket Header */}
        <div className="ticket-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 800 }}>
              {isBus ? <Bus size={24} /> : <Train size={24} />}
              <span>TravelGo {isBus ? 'Bus Express' : 'Railway'} Pass</span>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.2rem' }}>
              Electronic Boarding Reservation & Proof of Payment
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
              PNR / Reference ID
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              {booking.bookingReference}
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="ticket-disclaimer-banner">
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>COLLEGE DEMO RESERVATION TICKET:</strong> This document is generated for demonstration and academic evaluation purposes only. It is not an official commercial railway ticket or public passenger manifest.
          </span>
        </div>

        {/* Ticket Body */}
        <div className="ticket-body">
          {/* Service & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Operating Service
              </span>
              <h3 style={{ fontSize: '1.3rem', color: '#0f2b48', fontWeight: 800 }}>
                {booking.schedule?.serviceName}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Service Number: <strong>{booking.schedule?.serviceNumber}</strong> &bull; Class: <strong>{booking.schedule?.seatLayoutType}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${booking.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                STATUS: {booking.status}
              </span>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                Booked On: {booking.bookingDate?.split('T')[0]}
              </div>
            </div>
          </div>

          {/* Route & Timing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.75rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                From Origin
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f2b48' }}>
                {booking.schedule?.sourceCity}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d9488' }}>
                {booking.schedule?.departureTime}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {booking.schedule?.journeyDate}
              </div>
              <div style={{ height: '2px', backgroundColor: '#cbd5e1', margin: '0.4rem 0', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#f8fafc', padding: '0 4px', fontSize: '0.75rem', color: '#64748b' }}>
                  {booking.schedule?.formattedDuration || 'Direct'}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {booking.schedule?.distanceKm ? `${booking.schedule?.distanceKm} km` : 'Scheduled Route'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                To Destination
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f2b48' }}>
                {booking.schedule?.destinationCity}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d9488' }}>
                {booking.schedule?.arrivalTime}
              </div>
            </div>
          </div>

          {/* Passenger Details Table */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0f2b48', fontWeight: 700, marginBottom: '0.75rem' }}>
              Passenger & Seat Allocation Manifest
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '0.6rem 0.75rem' }}>#</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Passenger Name</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Age / Gender</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Assigned Seat</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers?.map((p, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{p.passengerName}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>{p.age} yrs / {p.gender}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#0d9488' }}>
                      Seat {p.seatNumber}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                      <span style={{ color: booking.status === 'CONFIRMED' ? '#059669' : '#dc2626', fontWeight: 700, fontSize: '0.8rem' }}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fare and Barcode Footer */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', borderTop: '2px solid #e2e8f0', paddingTop: '1.25rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.2rem' }}>
                Payment Method: <strong>{booking.paymentMethod}</strong> &bull; Status: <strong>{booking.paymentStatus}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Booked by: {booking.userName} ({booking.userEmail})
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                * Valid Government Photo ID must be presented upon boarding. Seat assignments are strictly non-transferable.
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Fare</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f2b48' }}>
                ₹{booking.totalAmount}
              </div>
              <div style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                ||| | ||||| || |||| ||
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
