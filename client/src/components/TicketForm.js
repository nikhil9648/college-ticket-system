import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const TicketForm = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    department: '',
    tags: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    apiClient
      .get('/departments')
      .then((res) => setDepartments(res.data.departments || []))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.title.length > 200) e.title = 'Title cannot exceed 200 characters';
    if (form.description.length > 5000)
      e.description = 'Description cannot exceed 5000 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        department: form.department || undefined,
      };
      const res = await apiClient.post('/tickets', payload);
      toast.success('Ticket created successfully! AI is analyzing your issue...');
      navigate(`/tickets/${res.data.ticket._id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to create ticket. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
          Create New Ticket
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="Brief summary of your issue"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className={`form-control ${errors.description ? 'error' : ''}`}
              placeholder="Describe your issue in detail..."
            />
            {errors.description && (
              <p className="form-error">{errors.description}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="form-control"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department (Optional)</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Let AI decide</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. urgent, library, wifi"
            />
          </div>

          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#1e40af',
            }}
          >
            🤖 <strong>AI-Powered:</strong> Your ticket will be automatically
            analyzed, categorized, and routed to the appropriate department.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/tickets')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
