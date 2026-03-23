import React from 'react';

const Dashboard = ({ stats = {}, title = 'Dashboard' }) => {
  const statItems = [
    { label: 'Total Tickets', value: stats.totalTickets ?? 0, icon: '🎫' },
    { label: 'Open Tickets', value: stats.openTickets ?? 0, icon: '📂' },
    { label: 'In Progress', value: stats.inProgressTickets ?? 0, icon: '⚙️' },
    { label: 'Resolved', value: stats.resolvedTickets ?? 0, icon: '✅' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
        {title}
      </h1>
      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.label} className="stat-card">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
