import React from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, ChevronRight, Bus, Train } from 'lucide-react';

const SeatLayout = ({
  schedule,
  seats = [],
  layoutType = 'BUS_2X2',
  requiredCount = 1,
  selectedSeats = [],
  onSeatToggle,
  onProceed,
}) => {
  // Group seats by row
  const rowsMap = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.seatRow]) {
      rowsMap[seat.seatRow] = [];
    }
    rowsMap[seat.seatRow].push(seat);
  });

  const sortedRowKeys = Object.keys(rowsMap).map(Number).sort((a, b) => a - b);

  // Group into columns with aisle
  const isBus2x1 = layoutType.includes('2X1');
  const isTrain = schedule?.transportType === 'TRAIN';
  const baseFare = Number(schedule?.baseFare || 0);

  const calculateTotalFare = () => {
    return selectedSeats.reduce((sum, s) => sum + Number(s.fare || baseFare), 0);
  };

  const isSeatSelected = (seat) => {
    return selectedSeats.some((s) => s.id === seat.id);
  };

  const handleSeatClick = (seat) => {
    if (!seat.available) return;

    const alreadySelected = isSeatSelected(seat);
    if (!alreadySelected && selectedSeats.length >= requiredCount) {
      alert(`You have already selected ${requiredCount} seat(s) as requested in search. Deselect a seat first to pick another.`);
      return;
    }
    onSeatToggle(seat);
  };

  return (
    <div className="seat-picker-panel">
      <div className="seat-layout-grid-container">
        {/* Left: Coach Layout Card */}
        <div className="seat-coach-card">
          <div className="driver-cabin-indicator">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isTrain ? <Train size={18} /> : <Bus size={18} />}
              {isTrain ? 'Coach Front / Entrance' : 'Front Cabin / Driver'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
              Layout: {layoutType}
            </span>
          </div>

          {/* Seat Status Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-box available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-box selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-box booked"></div>
              <span>Booked</span>
            </div>
          </div>

          {/* Seats Matrix */}
          <div className="seats-matrix">
            {sortedRowKeys.map((rowNum) => {
              const rowSeats = rowsMap[rowNum].sort((a, b) => a.seatColumn - b.seatColumn);

              return (
                <div key={rowNum} className="seat-row">
                  {/* Left Group */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {rowSeats
                      .filter((s) => (isBus2x1 ? s.seatColumn === 1 : isTrain ? s.seatColumn <= 3 : s.seatColumn <= 2))
                      .map((seat) => {
                        const selected = isSeatSelected(seat);
                        const seatState = !seat.available ? 'booked' : selected ? 'selected' : 'available';

                        return (
                          <div
                            key={seat.id}
                            className={`seat-item ${seatState}`}
                            onClick={() => handleSeatClick(seat)}
                            title={`Seat ${seat.seatNumber} (${seat.seatType}) - ₹${seat.fare}`}
                          >
                            <span>{seat.seatNumber}</span>
                            <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>
                              {seat.seatType === 'WINDOW' ? 'W' : ''}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {/* Aisle */}
                  <div className="seat-aisle-spacer">
                    <span>AISLE</span>
                  </div>

                  {/* Right Group */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {rowSeats
                      .filter((s) => (isBus2x1 ? s.seatColumn > 1 : isTrain ? s.seatColumn > 3 : s.seatColumn > 2))
                      .map((seat) => {
                        const selected = isSeatSelected(seat);
                        const seatState = !seat.available ? 'booked' : selected ? 'selected' : 'available';

                        return (
                          <div
                            key={seat.id}
                            className={`seat-item ${seatState}`}
                            onClick={() => handleSeatClick(seat)}
                            title={`Seat ${seat.seatNumber} (${seat.seatType}) - ₹${seat.fare}`}
                          >
                            <span>{seat.seatNumber}</span>
                            <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>
                              {seat.seatType === 'WINDOW' ? 'W' : ''}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selection Summary Sidebar */}
        <div className="seat-summary-sidebar">
          <h4 className="seat-summary-title">Booking Summary</h4>

          <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#64748b' }}>Service:</span>
              <strong style={{ color: '#0f2b48' }}>{schedule?.serviceName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#64748b' }}>Route:</span>
              <span>{schedule?.sourceCity} &rarr; {schedule?.destinationCity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#64748b' }}>Date:</span>
              <span>{schedule?.journeyDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#64748b' }}>Departure:</span>
              <span>{schedule?.departureTime}</span>
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Target Passengers:</span>
              <strong>{requiredCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Selected Seats ({selectedSeats.length}):</span>
              <strong style={{ color: '#0d9488' }}>
                {selectedSeats.length > 0 ? selectedSeats.map((s) => s.seatNumber).join(', ') : 'None'}
              </strong>
            </div>
            <div style={{ borderTop: '1px dashed #99f6e4', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
              <span>Total Fare:</span>
              <span style={{ color: '#0f2b48' }}>₹{calculateTotalFare().toFixed(2)}</span>
            </div>
          </div>

          {selectedSeats.length < requiredCount && (
            <div style={{ fontSize: '0.8rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
              Please select {requiredCount - selectedSeats.length} more seat(s) to continue.
            </div>
          )}

          <button
            className="btn-primary"
            disabled={selectedSeats.length !== requiredCount}
            onClick={onProceed}
            style={{ width: '100%' }}
          >
            <span>Proceed to Passenger Info</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
