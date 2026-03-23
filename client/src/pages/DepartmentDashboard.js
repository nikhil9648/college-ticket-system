import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import TicketCard from '../components/TicketCard';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const params = { limit: 50 };
        if (statusFilter) params.status = statusFilter;
        const res = await apiClient.get('/tickets', { params });
        const allTickets = res.data.tickets || [];
        const filtered = search
          ? allTickets.filter(
              (t) =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.ticketId?.toLowerCase().includes(search.toLowerCase())
            )
          : allTickets;
        setTickets(filtered);
        setStats({
          totalTickets: allTickets.length,
          openTickets: allTickets.filter((t) => t.status === 'open').length,
          inProgressTickets: allTickets.filter(
            (t) => t.status === 'in_progress'
          ).length,
          resolvedTickets: allTickets.filter((t) => t.status === 'resolved').length,
        });
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [statusFilter, search]);

  return (
    <div>
      <Dashboard
        stats={stats}
        title={`Department Dashboard${user?.department ? '' : ''}`}
      />

      <div className="card">
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', flex: 1 }}>
            Assigned Tickets
          </h2>
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ width: '200px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : tickets.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              color: '#94a3b8',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p>No tickets found</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;
