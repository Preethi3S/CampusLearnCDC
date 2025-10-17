import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../features/messages/messageSlice';

export default function StudentMessageBoard() {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.messages || { items: [] });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            console.log("Student Attempting to fetch messages with token:", !!token);
            dispatch(fetchMessages(token));
        }
    }, [dispatch, token]);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2>💬 Announcements</h2>
            
            {loading ? <p>Loading announcements...</p> : (
                Array.isArray(items) && items.map((msg) => (
                    <div key={msg._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
                        
                        {/* ✅ FIX: Display the main message content */}
                        <p style={{ fontSize: '16px', marginBottom: '10px' }}>{msg.content}</p>
                        
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Posted by: **{msg.sender?.name || 'Admin'}**
                        </div>
                        
                        {/* Display replies if any */}
                        {msg.replies?.length > 0 && (
                            <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                <strong>Replies ({msg.replies.length}):</strong>
                                {msg.replies.map((r, i) => (
                                    <p key={i} style={{ margin: '5px 0 0 0', fontSize: '13px' }}>
                                        {/* ✅ FIX: Access the reply sender's name and the reply content */}
                                        **{r.sender?.name || 'User'}:** {r.content}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}