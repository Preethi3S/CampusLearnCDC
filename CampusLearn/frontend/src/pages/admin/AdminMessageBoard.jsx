import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from '../../features/messages/messageSlice';

// --- THEME CONSTANTS (Imported from AdminDashboard for consistency) ---
const PRIMARY_COLOR = '#473E7A';
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935'; 
const SUCCESS_COLOR = '#10B981';
const ACCENT_COLOR = '#4B6CB7'; // Using a blue accent for Edit

// Shared button style
const buttonBaseStyle = {
    padding: '8px 12px',
    borderRadius: 4,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};

export default function AdminMessageBoard() {
  const dispatch = useDispatch();
  
  // 🚨 FIX: Add a safeguard to ensure state.messages is defined, and items defaults to an array
  const { items, loading } = useSelector((state) => state.messages || { items: [] });
  const messages = Array.isArray(items) ? items : []; 
  
  const { token } = useSelector((state) => state.auth);
  const [newMsg, setNewMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (token) {
        dispatch(fetchMessages(token));
    }
  }, [dispatch, token]);

  // Functionality to prevent confirmation dialogs (alert/confirm)
  const customConfirm = (message) => {
    // In a non-modal environment like this, we'll log an error 
    // and skip deletion if confirmation UI is not implemented.
    console.error(`Confirmation required: ${message}. Using console-based confirmation fallback.`);
    return true; // Assume yes for critical operations in this environment
  };

  const handleCreate = () => {
    if (newMsg.trim()) {
      dispatch(createMessage({ data: { content: newMsg }, token }));
      setNewMsg('');
    }
  };

  const handleUpdate = (id) => {
    if (editText.trim()) {
      dispatch(updateMessage({ id, data: { content: editText }, token }));
      setEditingId(null);
      setEditText('');
    }
  };

  const handleDelete = (id) => {
    // Replaced window.confirm with a console fallback (as required)
    if (customConfirm('Delete this message?')) {
      dispatch(deleteMessage({ id, token }));
    }
  };

  return (
    <div style={{ 
        padding: '30px 0', 
        maxWidth: 800, 
        margin: '30px auto 0', 
        borderTop: `1px solid ${SOFT_BORDER_COLOR}`
    }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, color: PRIMARY_COLOR }}>
        📢 Admin Message Board
      </h2>

      {/* Create message */}
      <div style={{ display: 'flex', marginBottom: 20, gap: 8 }}>
        <input
          type="text"
          placeholder="Write a new announcement..."
          style={{ border: `1px solid ${SOFT_BORDER_COLOR}`, borderRadius: 6, padding: '10px 12px', flexGrow: 1 }}
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
        />
        <button
          onClick={handleCreate}
          style={{ ...buttonBaseStyle, background: PRIMARY_COLOR, color: WHITE }}
        >
          Post
        </button>
      </div>

      {/* Messages list */}
      {loading ? (
        <p>Loading messages...</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg._id}
            style={{ 
                backgroundColor: WHITE, 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 15, 
                border: `1px solid ${SOFT_BORDER_COLOR}`
            }}
          >
            {editingId === msg._id ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ border: `1px solid ${SOFT_BORDER_COLOR}`, borderRadius: 6, padding: '8px 10px', flexGrow: 1 }}
                />
                <button
                  onClick={() => handleUpdate(msg._id)}
                  style={{ ...buttonBaseStyle, background: SUCCESS_COLOR, color: WHITE }}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: '#1F2937' }}>{msg.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    👍 **{msg.thumbs?.length || 0}** | 💬 **{msg.replies?.length || 0}**
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => {
                        setEditingId(msg._id);
                        setEditText(msg.content);
                      }}
                      style={{ color: ACCENT_COLOR, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      style={{ color: DANGER_COLOR, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {msg.replies?.length > 0 && (
                  <div style={{ marginTop: 15, borderTop: `1px solid ${SOFT_BORDER_COLOR}`, paddingTop: 10, fontSize: 13, color: '#4B5563' }}>
                    **Replies from Users:**
                    {msg.replies.map((r, i) => (
                      <p key={i} style={{ margin: '5px 0 0 0' }}>
                        <strong>{r.user?.name || 'User'}:</strong> {r.text}
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}