import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, createMessage, deleteMessage } from '../../features/messages/messageSlice';

export default function AdminMessageBoard() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.messages || { items: [] });
  const { token, user } = useSelector((state) => state.auth);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    if (token) dispatch(fetchMessages(token));
  }, [dispatch, token]);

  const handleCreate = () => {
    if (newMsg.trim()) {
      dispatch(createMessage({ data: { content: newMsg }, token }));
      setNewMsg('');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      dispatch(deleteMessage({ id, token }));
    }
  };

  return (
    <div
      style={{
        padding: '30px 20px',
        maxWidth: '700px',
        margin: '40px auto',
        background: '#F8FAFC',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <h2
        style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#4B6CB7',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        📢 Admin Message Board
      </h2>

      {/* Input Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '25px',
        }}
      >
        <input
          type="text"
          placeholder="Write a new announcement..."
          style={{
            flexGrow: 1,
            padding: '12px 14px',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.95rem',
            transition: 'border-color 0.2s',
          }}
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = '#4B6CB7')}
          onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
        />
        <button
          onClick={handleCreate}
          style={{
            background: '#4B6CB7',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.background = '#3A56A1')}
          onMouseLeave={(e) => (e.target.style.background = '#4B6CB7')}
        >
          Post
        </button>
      </div>

      {/* Message List */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1F2937' }}>
        All Announcements
      </h3>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6B7280' }}>Loading messages...</p>
      ) : Array.isArray(items) && items.length > 0 ? (
        items.map((msg) => (
          <div
            key={msg._id}
            style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '18px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
            }}
          >
            <p
              style={{
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '6px',
                lineHeight: '1.5',
              }}
            >
              {msg.content}
            </p>
            <small style={{ color: '#64748B', display: 'block', marginBottom: '10px' }}>
              Posted by <b>{msg.sender?.name || 'Admin'}</b> on{' '}
              {new Date(msg.createdAt).toLocaleDateString()}
            </small>

            {/* Delete Button BELOW the message */}
            {user?.role === 'admin' && (
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => handleDelete(msg._id)}
                  style={{
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'background 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = '#DC2626')}
                  onMouseLeave={(e) => (e.target.style.background = '#EF4444')}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#6B7280' }}>No announcements yet.</p>
      )}
    </div>
  );
}
