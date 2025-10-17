import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../features/messages/messageSlice';

export default function StudentMessageBoard() {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.messages || { items: [] });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) dispatch(fetchMessages(token));
    }, [dispatch, token]);

    return (
        <div style={{
            padding: '20px',
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f4f8', // light blue-gray
            borderRadius: '12px',
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            <h2 style={{ color: '#4B6CB7', marginBottom: '15px' }}>💬 Announcements</h2>
            
            {loading ? (
                <p style={{ color: '#333' }}>Loading announcements...</p>
            ) : (
                Array.isArray(items) && items.map((msg) => (
                    <div key={msg._id} style={{
                        backgroundColor: '#fff',
                        border: '1px solid #d1d5db',
                        padding: '15px',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
                        flexShrink: 0
                    }}>
                        <p style={{ fontSize: '16px', color: '#1f2937', marginBottom: '10px' }}>
                            {msg.content}
                        </p>
                        
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            Posted by: {msg.sender?.name || 'Admin'}
                        </div>
                        
                        {msg.replies?.length > 0 && (
                            <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                                <strong style={{ fontSize: '14px', color: '#4B6CB7' }}>
                                    Replies ({msg.replies.length}):
                                </strong>
                                {msg.replies.map((r, i) => (
                                    <p key={i} style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#374151', paddingLeft: '8px' }}>
                                        {r.sender?.name || 'User'}: {r.content}
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
