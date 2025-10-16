import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, addReply, addThumb } from '../../features/messages/messageSlice';

// --- THEME CONSTANTS (Imported from StudentDashboard for consistency) ---
const PRIMARY_COLOR = '#473E7A';
const ACCENT_COLOR = '#4B6CB7';
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const WHITE = '#FFFFFF';
const MUTE_GRAY = '#6B7280';

export default function StudentMessageBoard() {
  const dispatch = useDispatch();
  
  // 🚨 FIX: Use a safeguard object in case state.messages is undefined (e.g., store misconfiguration)
  const { items, loading } = useSelector((state) => state.messages || { items: [] });
  
  // Ensure messages is always an array, even if the payload was unexpected
  const messages = Array.isArray(items) ? items : []; 
  
  const auth = useSelector((state) => state.auth);
  const token = auth.token;
  const userRole = auth.user?.role; // Assuming role is available on auth.user
  const [reply, setReply] = useState({});

  // Student/User should NOT be able to reply if their role is 'student'
  const canReply = userRole !== 'student' && !!auth.token;

  useEffect(() => {
    if (token) {
      dispatch(fetchMessages(token));
    }
  }, [dispatch, token]);

  const handleReply = (id) => {
    if (reply[id]?.trim() && canReply) {
      dispatch(addReply({ id, replyData: { text: reply[id] }, token }));
      setReply((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleThumb = (id) => {
    dispatch(addThumb({ id, token }));
  };

  return (
    <div style={{ 
        padding: '30px 0', 
        maxWidth: 800, 
        margin: '30px auto 0', 
        borderTop: `1px solid ${SOFT_BORDER_COLOR}`
    }}>
      <h2 style={{ 
        fontSize: 24, 
        fontWeight: 600, 
        marginBottom: 20, 
        color: PRIMARY_COLOR 
    }}>
        💬 Announcements
    </h2>

      {loading ? (
        <p>Loading messages...</p>
      ) : (
        messages.map((msg) => ( // 👈 This line is now safe
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
            <p style={{ color: '#1F2937', marginBottom: 10 }}>{msg.content}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <div style={{ fontSize: 13, color: MUTE_GRAY }}>
                👍 **{msg.thumbs?.length || 0}** | 💬 **{msg.replies?.length || 0}**
              </div>
              <button
                onClick={() => handleThumb(msg._id)}
                disabled={!token} // Prevent unauthorized thumbs-up
                style={{ 
                    color: ACCENT_COLOR, 
                    border: 'none', 
                    background: 'none', 
                    cursor: token ? 'pointer' : 'not-allowed', // Visual feedback
                    fontSize: 14, 
                    fontWeight: 600,
                    opacity: token ? 1 : 0.5
                }}
              >
                👍 Like
              </button>
            </div>

            {/* Replies */}
            {msg.replies?.length > 0 && (
              <div style={{ 
                marginTop: 15, 
                borderTop: `1px solid ${SOFT_BORDER_COLOR}`, 
                paddingTop: 10, 
                fontSize: 13, 
                color: '#4B5563' 
              }}>
                **Replies:**
                {msg.replies.map((r, i) => (
                  <p key={i} style={{ margin: '5px 0 0 0' }}>
                    <strong>{r.user?.name || 'User'}:</strong> {r.text}
                  </p>
                ))}
              </div>
            )}

            {/* Conditional Reply input - Hidden for Students */}
            {canReply && (
                <div style={{ display: 'flex', marginTop: 15, gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Reply..."
                    style={{ 
                        border: `1px solid ${SOFT_BORDER_COLOR}`, 
                        borderRadius: 6, 
                        padding: '8px 10px', 
                        flexGrow: 1 
                    }}
                    value={reply[msg._id] || ''}
                    onChange={(e) =>
                      setReply((prev) => ({ ...prev, [msg._id]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() => handleReply(msg._id)}
                    style={{ 
                        background: ACCENT_COLOR, 
                        color: WHITE, 
                        padding: '8px 12px', 
                        borderRadius: 6, 
                        border: 'none', 
                        cursor: 'pointer' 
                    }}
                  >
                    Send
                  </button>
                </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}