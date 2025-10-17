import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import AdminMessageBoard from './AdminMessageBoard'; // Assuming this is the correct path

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BG = '#F4F7F9'; // Lighter, modern background
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935'; 
const ACCENT_COLOR = '#0EA5E9'; // A bright accent for links/active states

// --- STYLES ---

const baseButtonStyle = {
    padding: '10px 16px',
    borderRadius: 6,
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
};

const buttonPrimaryStyle = {
    ...baseButtonStyle,
    background: PRIMARY_COLOR,
    color: WHITE,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const buttonLogoutStyle = {
    ...baseButtonStyle,
    background: DANGER_COLOR,
    color: WHITE,
};

const inputStyle = {
    padding: '8px 12px',
    borderRadius: 6,
    border: `1px solid ${SOFT_BORDER_COLOR}`,
    outline: 'none',
    minWidth: '200px',
};

const statCardStyle = {
    padding: '15px 20px',
    background: WHITE,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    minWidth: 120,
    textAlign: 'center',
};

const sidebarStyle = {
    position: 'sticky',
    top: '20px', // Distance from the top of the viewport
    width: '350px', // Fixed width for the sidebar
    minHeight: 'calc(100vh - 40px)', // To stretch the background
    padding: '20px',
    background: WHITE,
    borderRadius: '10px',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.08)',
};

export default function Dashboard() {

    const dispatch = useDispatch();
    const { items, loading, error } = useSelector(s => s.courses);
    const auth = useSelector(s => s.auth);
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [showPublishedOnly, setShowPublishedOnly] = useState(false);
    

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    // Memoized filtering logic
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = items || [];
        if (showPublishedOnly) list = list.filter(c => c.isPublished);
        if (!q) return list;
        return list.filter(c => (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
    }, [items, query, showPublishedOnly]);

    // Memoized statistics calculation
    const stats = useMemo(() => ({
        total: items.length || 0,
        published: items.filter(c => c.isPublished).length || 0,
        unpublished: items.filter(c => !c.isPublished).length || 0
    }), [items]);

    const handleDelete = (id) => {
        // Replaced window.confirm with console fallback
        if (window.confirm('Are you sure you want to delete this course?')) {
            dispatch(deleteCourse(id));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div style={{ background: SOFT_BG, minHeight: '100vh' }}>
            <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                
                {/* --- Main Content Area (Left) --- */}
                <div style={{ flexGrow: 1, marginRight: '30px' }}>
                    
                    {/* --- Header Section --- */}
                    <header style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 30, 
                        paddingBottom: 15,
                        borderBottom: `1px solid ${SOFT_BORDER_COLOR}`,
                    }}>
                        <h1 style={{ color: PRIMARY_COLOR, margin: 0, fontSize: '28px' }}>
                            🚀 Course Admin Dashboard
                        </h1>
                        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                            <Link to="/admin/create-course" style={{ textDecoration: 'none' }}>
                                <button style={buttonPrimaryStyle}>+ Create New Course</button>
                            </Link>
                            <button
                                style={buttonLogoutStyle} 
                                onClick={handleLogout}
                            >
                                <span role="img" aria-label="logout">🚪</span> Logout
                            </button>
                        </div>
                    </header>
                    
                    {/* --- Controls, Stats, and Filter Section --- */}
                    <div style={{ marginBottom: 30 }}>
                        <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>Overview & Controls</h2>
                        
                        {/* Stats */}
                        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
                            <div style={statCardStyle}>
                                <div style={{ fontSize: 13, color: '#6B7280' }}>Total Courses</div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY_COLOR }}>{stats.total}</div>
                            </div>
                            <div style={statCardStyle}>
                                <div style={{ fontSize: 13, color: '#6B7280' }}>Published</div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#0EA5E9' }}>{stats.published}</div>
                            </div>
                            <div style={statCardStyle}>
                                <div style={{ fontSize: 13, color: '#6B7280' }}>Unpublished</div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#F97316' }}>{stats.unpublished}</div>
                            </div>
                        </div>

                        {/* Search, Filter, and Refresh */}
                        <div style={{ display: 'flex', gap: 15, alignItems: 'center', padding: '15px', background: WHITE, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <input 
                                placeholder="Search courses by title or description..." 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)} 
                                style={inputStyle} 
                            />
                            <label style={{ fontSize: 14, color: '#475569', display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={showPublishedOnly} 
                                    onChange={() => setShowPublishedOnly(v => !v)} 
                                /> 
                                Show Published Only
                            </label>
                            <button 
                                onClick={() => dispatch(fetchCourses())} 
                                style={{ 
                                    ...baseButtonStyle, 
                                    background: ACCENT_COLOR, 
                                    color: WHITE,
                                    marginLeft: 'auto'
                                }}>
                                Refresh List
                            </button>
                        </div>
                    </div>

                    {/* --- Course List Section --- */}
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>Course Inventory</h2>
                    {loading && <p>Loading courses...</p>}
                    {error && <p style={{ color: DANGER_COLOR }}>Error: {error}</p>}

                    <div style={{ display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                        {filtered.length === 0 && !loading && <p>No courses found matching your criteria.</p>}
                        {filtered.map(c => (
                            <CourseCard 
                                key={c._id} 
                                course={c} 
                                onDelete={handleDelete} 
                                onUpdated={() => dispatch(fetchCourses())}
                            />
                        ))}
                    </div>
                </div>

                {/* --- Admin Message Board Sidebar (Right) --- */}
                <aside style={sidebarStyle}>
                    <AdminMessageBoard /> 
                </aside>
            </div>
        </div>
    );
}