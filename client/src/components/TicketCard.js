import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const TicketCard = ({ ticket }) => {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="card" style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px',
        }}
      >
        <div>
          <span
            style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}
          >
            {ticket.ticketId}
          </span>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '4px 0',
            }}
          >
            {ticket.title}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <StatusBadge status={ticket.status} />
          <StatusBadge status={ticket.priority} />
        </div>
      </div>

      <p
        style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '12px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {ticket.description}
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: '#94a3b8',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          {ticket.department && (
            <span>🏢 {ticket.department.name || ticket.department}</span>
          )}
          {ticket.category && <span>📂 {ticket.category}</span>}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>📅 {formatDate(ticket.createdAt)}</span>
          <Link
            to={`/tickets/${ticket._id}`}
            className="btn btn-primary btn-sm"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
