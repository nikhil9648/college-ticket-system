import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import apiClient from '../services/apiClient';

const COLORS = ['#1e40af', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          apiClient.get('/admin/dashboard'),
          apiClient.get('/admin/analytics'),
        ]);
        setStats(dashRes.data.stats);
        setAnalytics(analyticsRes.data.analytics);
      } catch {
        setStats({});
        setAnalytics({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  const tabs = ['overview', 'analytics', 'tickets'];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: '👥' },
          { label: 'Total Tickets', value: stats?.totalTickets ?? 0, icon: '🎫' },
          { label: 'Open', value: stats?.openTickets ?? 0, icon: '📂' },
          { label: 'In Progress', value: stats?.inProgressTickets ?? 0, icon: '⚙️' },
          { label: 'Resolved', value: stats?.resolvedTickets ?? 0, icon: '✅' },
          { label: 'Departments', value: stats?.departments ?? 0, icon: '🏢' },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{item.icon}</div>
            <div className="stat-value" style={{ fontSize: '28px' }}>
              {item.value}
            </div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize',
              borderBottom: activeTab === tab ? '2px solid #1e40af' : '2px solid transparent',
              color: activeTab === tab ? '#1e40af' : '#64748b',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/admin/users" className="btn btn-primary">
              👥 Manage Users
            </Link>
            <Link to="/admin/departments" className="btn btn-secondary">
              🏢 Manage Departments
            </Link>
            <Link to="/admin/analytics" className="btn btn-secondary">
              📊 View Analytics
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>
              Tickets by Status
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={analytics.ticketsByStatus?.map((d) => ({
                    name: d._id,
                    value: d.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(analytics.ticketsByStatus || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>
              Tickets by Priority
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={analytics.ticketsByPriority?.map((d) => ({
                  name: d._id,
                  count: d.count,
                }))}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>
              Daily Ticket Volume (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={analytics.dailyTickets?.map((d) => ({
                  date: d._id,
                  count: d.count,
                }))}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="card">
          <p style={{ color: '#64748b' }}>
            Use the sidebar to navigate to specific ticket views.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
