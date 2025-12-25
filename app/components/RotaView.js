'use client';

import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RotaView({ rotaData, showHours }) {
  const [selectedWeek, setSelectedWeek] = useState(0);

  if (!rotaData || rotaData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📅</div>
        <p>No rota data available yet.</p>
        <p className="text-sm text-muted mt-1">
          The rota will appear here once uploaded by admin.
        </p>
      </div>
    );
  }

  const currentRota = rotaData[selectedWeek];
  const weeks = rotaData.map((r, i) => ({
    index: i,
    label: `Week ending ${r.week_ending}`,
    weekEnding: r.week_ending,
  }));

  const { kitchen = [], drivers = [] } = currentRota?.data || {};

  const renderShiftCell = (shifts, day) => {
    const shift = shifts?.[day];
    if (!shift || (!shift.timeIn && !shift.timeOut)) {
      return <span className="shift-cell off">—</span>;
    }

    const formatTime = (time) => {
      if (!time) return '';
      // Handle various time formats
      if (typeof time === 'string') {
        // If it's like "10:00:00", extract HH:MM
        const parts = time.split(':');
        if (parts.length >= 2) {
          return `${parts[0]}:${parts[1]}`;
        }
      }
      return time;
    };

    return (
      <div className="shift-cell">
        <div>{formatTime(shift.timeIn)} - {formatTime(shift.timeOut)}</div>
        {shift.role && <span className="role-badge">{shift.role}</span>}
      </div>
    );
  };

  const renderStaffTable = (staff, title) => {
    if (!staff || staff.length === 0) return null;

    return (
      <>
        <tr>
          <td colSpan={DAYS.length + (showHours ? 2 : 1)} className="section-header">
            {title}
          </td>
        </tr>
        {staff.map((person, idx) => (
          <tr key={`${title}-${idx}`}>
            <td className="staff-name">{person.name}</td>
            {DAYS.map((day) => (
              <td key={day}>{renderShiftCell(person.shifts, day)}</td>
            ))}
            {showHours && (
              <td style={{ fontFamily: 'Space Mono, monospace', textAlign: 'right' }}>
                {person.totalHours || '—'}
              </td>
            )}
          </tr>
        ))}
      </>
    );
  };

  return (
    <div>
      {/* Week selector */}
      {weeks.length > 1 && (
        <div className="week-selector">
          {weeks.map((week) => (
            <button
              key={week.index}
              className={`week-tab ${selectedWeek === week.index ? 'active' : ''}`}
              onClick={() => setSelectedWeek(week.index)}
            >
              {week.label}
            </button>
          ))}
        </div>
      )}

      {/* Upload timestamp */}
      {currentRota?.uploaded_at && (
        <p className="text-sm text-muted mb-2">
          Last updated: {new Date(currentRota.uploaded_at).toLocaleString('en-GB')}
        </p>
      )}

      {/* Rota table */}
      <div className="rota-container">
        <table className="rota-table">
          <thead>
            <tr>
              <th style={{ minWidth: '120px' }}>Staff</th>
              {DAYS.map((day) => (
                <th key={day} className="day-header">{day}</th>
              ))}
              {showHours && <th style={{ textAlign: 'right' }}>Total</th>}
            </tr>
          </thead>
          <tbody>
            {renderStaffTable(kitchen, 'Kitchen')}
            {renderStaffTable(drivers, 'Drivers')}
          </tbody>
        </table>
      </div>

      {kitchen.length === 0 && drivers.length === 0 && (
        <div className="empty-state">
          <p>No staff data in this week's rota.</p>
        </div>
      )}
    </div>
  );
}
