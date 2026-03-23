import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
  const className = `badge badge-${status}`;
  const label = status?.replace('_', ' ') || 'unknown';
  return <span className={className}>{label}</span>;
};

export default StatusBadge;
