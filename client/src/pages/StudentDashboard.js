import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import TicketCard from '../components/TicketCard';
import apiClient from '../services/apiClient';

const StudentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = statusFilter ? { status: statusFilter } : {};
        const res = await apiClient.get('/tickets', { params });
        const allTickets = res.data.tickets || [];
        setTickets(allTickets);
        setStats({
          totalTickets: res.data.pagination?.total || allTickets.length,
          openTickets: allTickets.filter((t) => t.status === 'open').length,
          inProgressTickets: allTickets.filter((t) => t.status === 'in_progress').length,
          resolvedTickets: allTickets.filter((t) => t.status === 'resolved').length,
        });
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter]);

  return (
    <div>
      <Dashboard stats={stats} title="Student Dashboard" />

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>My Tickets</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <Link to="/tickets/new" className="btn btn-primary btn-sm">
              ➕ New Ticket
            </Link>
          </div>
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
              No tickets found
            </p>
            <Link to="/tickets/new" className="btn btn-primary">
              Create Your First Ticket
            </Link>
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

export default StudentDashboard;
