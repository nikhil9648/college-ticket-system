import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [solutions, setSolutions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseForm, setResponseForm] = useState({ content: '', type: 'comment' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const [ticketRes, solutionsRes] = await Promise.all([
          apiClient.get(`/tickets/${id}`),
          apiClient.get(`/tickets/${id}/solutions`),
        ]);
        setTicket(ticketRes.data.ticket);
        setResponses(solutionsRes.data.solutions || []);
        setSolutions(solutionsRes.data.aiAnalysis);
      } catch {
        toast.error('Ticket not found');
        navigate('/tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await apiClient.put(`/tickets/${id}`, { status: newStatus });
      setTicket(res.data.ticket);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!responseForm.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post(`/departments/${ticket.department?._id}/response`, {
        ...responseForm,
        ticketId: id,
      });
      setResponses((prev) => [...prev, res.data.response]);
      setResponseForm({ content: '', type: 'comment' });
      toast.success('Response added');
      if (responseForm.type === 'solution') {
        setTicket((prev) => ({ ...prev, status: 'resolved' }));
      }
    } catch {
      toast.error('Failed to add response');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!ticket) return null;

  const canRespond =
    user?.role === 'admin' ||
    user?.role === 'department_staff';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
              {ticket.ticketId}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700' }}>{ticket.title}</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <StatusBadge status={ticket.status} />
            <StatusBadge status={ticket.priority} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            fontSize: '13px',
            color: '#64748b',
            flexWrap: 'wrap',
          }}
        >
          <span>👤 {ticket.student?.name}</span>
          {ticket.department && <span>🏢 {ticket.department.name}</span>}
          {ticket.category && <span>📂 {ticket.category}</span>}
          <span>📅 {formatDate(ticket.createdAt)}</span>
        </div>

        {(user?.role === 'admin' || user?.role === 'department_staff') && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', alignSelf: 'center' }}>
              Update Status:
            </span>
            {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className="btn btn-sm"
                style={{
                  background: ticket.status === s ? '#1e40af' : '#e2e8f0',
                  color: ticket.status === s ? 'white' : '#475569',
                }}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {['details', 'ai solutions', 'responses'].map((tab) => (
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
              borderBottom:
                activeTab === tab
                  ? '2px solid #1e40af'
                  : '2px solid transparent',
              color: activeTab === tab ? '#1e40af' : '#64748b',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="card">
          <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Description</h3>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>{ticket.description}</p>
          {ticket.tags?.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ticket.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: '#f1f5f9',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai solutions' && (
        <div>
          {!solutions || solutions.processingStatus === 'pending' ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
              <p style={{ color: '#64748b' }}>AI analysis is being processed...</p>
            </div>
          ) : solutions.processingStatus === 'failed' ? (
            <div className="card alert alert-error">
              AI analysis failed. Please contact the department directly.
            </div>
          ) : (
            <div>
              {solutions.summary && (
                <div className="card">
                  <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>AI Summary</h3>
                  <p style={{ color: '#475569' }}>{solutions.summary}</p>
                  {solutions.keywords?.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {solutions.keywords.map((k) => (
                        <span
                          key={k}
                          style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {solutions.openaiSolutions?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>
                    🤖 OpenAI Suggested Solutions
                  </h3>
                  {solutions.openaiSolutions.map((sol, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#f8fafc',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                      }}
                    >
                      <p style={{ fontWeight: '500', marginBottom: '8px' }}>
                        {sol.solution}
                      </p>
                      {sol.steps?.length > 0 && (
                        <ol style={{ paddingLeft: '20px', color: '#475569', fontSize: '14px' }}>
                          {sol.steps.map((step, j) => (
                            <li key={j}>{step}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {solutions.geminiSolutions?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>
                    ✨ Gemini Alternative Solutions
                  </h3>
                  {solutions.geminiSolutions.map((sol, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#f0fdf4',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                      }}
                    >
                      <p style={{ fontWeight: '500', marginBottom: '8px' }}>
                        {sol.solution}
                      </p>
                      {sol.steps?.length > 0 && (
                        <ol style={{ paddingLeft: '20px', color: '#475569', fontSize: '14px' }}>
                          {sol.steps.map((step, j) => (
                            <li key={j}>{step}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'responses' && (
        <div>
          {responses.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}
            >
              No responses yet
            </div>
          ) : (
            responses.map((r) => (
              <div key={r._id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <strong>{r.author?.name}</strong>
                    <span
                      style={{
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#64748b',
                        textTransform: 'capitalize',
                      }}
                    >
                      {r.type}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                <p style={{ color: '#475569' }}>{r.content}</p>
              </div>
            ))
          )}

          {canRespond && ticket.department && (
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>
                Add Response
              </h3>
              <form onSubmit={handleResponseSubmit}>
                <div className="form-group">
                  <select
                    value={responseForm.type}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="form-control"
                    style={{ marginBottom: '8px' }}
                  >
                    <option value="comment">Comment</option>
                    <option value="solution">Solution (marks ticket as resolved)</option>
                    <option value="internal_note">Internal Note</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea
                    value={responseForm.content}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={4}
                    className="form-control"
                    placeholder="Type your response..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !responseForm.content.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
