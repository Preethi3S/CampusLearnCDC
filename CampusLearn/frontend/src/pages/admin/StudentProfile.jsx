import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import userApi from '../../api/userApi';
import { FaUserCircle, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        color: '#111827'
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        color: '#7C3AED',
        textDecoration: 'none',
        marginBottom: '24px',
        fontSize: '14px',
        fontWeight: '500'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E5E7EB'
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 16px 0'
    },
    statusActive: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        fontSize: '14px',
        fontWeight: '500'
    },
    statusInactive: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        fontSize: '14px',
        fontWeight: '500'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
        fontSize: '14px',
        fontWeight: '500',
        borderBottom: '1px solid #E5E7EB'
    },
    td: {
        padding: '16px 12px',
        borderBottom: '1px solid #E5E7EB',
        verticalAlign: 'top'
    },
    button: {
        backgroundColor: '#7C3AED',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        color: '#7C3AED',
        border: '1px solid #7C3AED',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginRight: '8px'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #E5E7EB',
        borderTop: '4px solid #7C3AED',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderLeft: '4px solid #EF4444',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
    },
    errorIcon: {
        color: '#EF4444',
        flexShrink: 0,
        marginTop: '2px'
    },
    avatar: {
        backgroundColor: '#EDE9FE',
        color: '#7C3AED',
        borderRadius: '50%',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        marginRight: '16px'
    },
    progressBar: {
        height: '8px',
        backgroundColor: '#E5E7EB',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '8px'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#7C3AED',
        borderRadius: '4px'
    }
  ,
  /* Additional layout helpers used in the profile UI */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px'
  },
  infoBox: {
    background: 'transparent'
  },
  label: { fontSize: '14px', color: '#6B7280', margin: '0 0 6px 0' },
  value: { margin: 0, fontWeight: '500', color: '#111827' },
  iconLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#7C3AED', textDecoration: 'none' }
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const { user, token: authToken } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // ✅ Ensure correct backend route
        const res = await axios.get(
          `http://localhost:3000/api/studentProfile/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching student profile:", err);

        // ✅ Handle 404 - user hasn’t updated profile
        if (err.response?.status === 404) {
          setError("User hasn’t updated the profile yet.");
        } else if (err.code === "ERR_NETWORK") {
          setError("Network error — unable to reach the server.");
        } else {
          setError(
            err.response?.data?.message || "Failed to load student profile"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.token && studentId) fetchProfile();
    // fetch enrollments for this student
    const fetchEnrollments = async () => {
      if (!authToken || !studentId) return;
      try {
        setEnrollLoading(true);
        // use api helper if available
        const data = await userApi.getStudentEnrollments(authToken || user?.token, studentId);
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setEnrollments([]);
      } finally {
        setEnrollLoading(false);
      }
    };
    fetchEnrollments();
  }, [user?.token, studentId]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading profile...</p>;

  if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</p>;

  return (
    <div style={styles.container}>
      <Link to="/admin/dashboard" style={styles.backButton}>
        ← Back to Students
      </Link>

      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <FaUserCircle size={64} color="#4B6CB7" />
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
              {profile?.name || "Unnamed Student"}
            </h1>
            <p style={{ margin: 0, color: "#6B7280" }}>{profile?.email}</p>
          </div>
        </div>
        <div>
          {user?.role === 'admin' && !editMode && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => {
                  setEditMode(true);
                  setEditForm({
                    name: profile?.name || '',
                    email: profile?.email || '',
                    phone: profile?.phone || '',
                    gender: profile?.gender || '',
                    dob: profile?.dob ? profile.dob.split('T')[0] : '',
                    address: profile?.address || '',
                    collegeName: profile?.collegeName || '',
                    department: profile?.department || '',
                    degree: profile?.degree || '',
                    yearOfStudy: profile?.yearOfStudy || '',
                    cgpa: profile?.cgpa || '',
                    tenthPercentage: profile?.tenthPercentage || '',
                    twelfthPercentage: profile?.twelfthPercentage || '',
                    backlogs: profile?.backlogs || '',
                    technicalSkills: Array.isArray(profile?.technicalSkills) ? profile.technicalSkills.join(', ') : (profile?.technicalSkills || ''),
                    softSkills: Array.isArray(profile?.softSkills) ? profile.softSkills.join(', ') : (profile?.softSkills || ''),
                    linkedin: profile?.linkedin || '',
                    github: profile?.github || '',
                    portfolio: profile?.portfolio || ''
                  });
                }}
                style={styles.button}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Basic Info */}
      <div style={styles.card}>
        {!editMode && <h2 style={styles.sectionTitle}>Basic Information</h2>}
        <div style={styles.grid}>
          {editMode ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  // send JSON body to admin update endpoint
                  await axios.patch(
                    `http://localhost:3000/api/studentProfile/${studentId}`,
                    editForm,
                    { headers: { Authorization: `Bearer ${authToken || user?.token}` } }
                  );
                  // refetch profile
                  const res = await axios.get(`http://localhost:3000/api/studentProfile/${studentId}`, { headers: { Authorization: `Bearer ${authToken || user?.token}` } });
                  setProfile(res.data);
                  setEditMode(false);
                } catch (err) {
                  console.error('Failed to update profile:', err);
                  alert(err.response?.data?.message || 'Failed to update profile');
                } finally {
                  setSaving(false);
                }
              }}>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {['name','email','phone','gender','dob','address'].map((k) => (
                    <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={styles.label}>{k === 'dob' ? 'Date of Birth' : k.charAt(0).toUpperCase() + k.slice(1)}</label>
                      <input
                        name={k}
                        value={editForm[k] || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, [k]: e.target.value }))}
                        style={{ padding: '8px', borderRadius: 6, border: '1px solid #E5E7EB' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Academic fields */}
                <h3 style={{ marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Academic Information</h3>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {[
                    ['collegeName','College Name','text'],
                    ['department','Department','text'],
                    ['degree','Degree','text'],
                    ['yearOfStudy','Year of Study','number'],
                    ['cgpa','CGPA','number'],
                    ['tenthPercentage','10th %','number'],
                    ['twelfthPercentage','12th %','number'],
                    ['backlogs','Backlogs','number']
                  ].map(([k,label,type]) => (
                    <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={styles.label}>{label}</label>
                      <input
                        name={k}
                        type={type}
                        value={editForm[k] !== undefined ? editForm[k] : ''}
                        onChange={(e) => setEditForm(f => ({ ...f, [k]: e.target.value }))}
                        style={{ padding: '8px', borderRadius: 6, border: '1px solid #E5E7EB' }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditMode(false)} style={styles.buttonOutline}>Cancel</button>
                  <button type="submit" style={styles.button}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          ) : null}
          {/* Hide displayed Basic Info while in edit mode */}
          {!editMode && (
            <>
              <div style={styles.infoBox}>
                <p style={styles.label}>Phone</p>
                <p style={styles.value}>{profile?.phone || "N/A"}</p>
              </div>
              <div style={styles.infoBox}>
                <p style={styles.label}>Gender</p>
                <p style={styles.value}>{profile?.gender || "N/A"}</p>
              </div>
              <div style={styles.infoBox}>
                <p style={styles.label}>Date of Birth</p>
                <p style={styles.value}>
                  {profile?.dob
                    ? new Date(profile.dob).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div style={styles.infoBox}>
                <p style={styles.label}>Address</p>
                <p style={styles.value}>{profile?.address || "N/A"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Academic Info (hidden while editing) */}
      {!editMode && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Academic Information</h2>
          <div style={styles.grid}>
            <div style={styles.infoBox}>
              <p style={styles.label}>College Name</p>
              <p style={styles.value}>{profile?.collegeName || "N/A"}</p>
            </div>
            <div style={styles.infoBox}>
              <p style={styles.label}>Department</p>
              <p style={styles.value}>{profile?.department || "N/A"}</p>
            </div>
            <div style={styles.infoBox}>
              <p style={styles.label}>Degree</p>
              <p style={styles.value}>{profile?.degree || "N/A"}</p>
            </div>
            <div style={styles.infoBox}>
              <p style={styles.label}>Year of Study</p>
              <p style={styles.value}>{profile?.yearOfStudy || "N/A"}</p>
            </div>
            <div style={styles.infoBox}>
              <p style={styles.label}>CGPA</p>
              <p style={styles.value}>{profile?.cgpa || "N/A"}</p>
            </div>
            <div style={styles.infoBox}>
              <p style={styles.label}>10th %</p>
              <p style={styles.value}>{profile?.tenthPercentage || "N/A"}</p>
            </div>
            <div style={styles.infoBox}>
              <p style={styles.label}>12th %</p>
              <p style={styles.value}>{profile?.twelfthPercentage || "N/A"}</p>
            </div>
            <div style={styles.infoBox}>
              <p style={styles.label}>Backlogs</p>
              <p style={styles.value}>{profile?.backlogs || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Skills */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Skills</h2>
        <div style={styles.grid}>
          <div style={styles.infoBox}>
            <p style={styles.label}>Technical Skills</p>
            <p style={styles.value}>
              {Array.isArray(profile?.technicalSkills)
                ? profile.technicalSkills.join(", ")
                : profile?.technicalSkills || "N/A"}
            </p>
          </div>
          <div style={styles.infoBox}>
            <p style={styles.label}>Soft Skills</p>
            <p style={styles.value}>
              {Array.isArray(profile?.softSkills)
                ? profile.softSkills.join(", ")
                : profile?.softSkills || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Links */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Links</h2>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {profile?.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.iconLink}
            >
              <FaLinkedin /> LinkedIn
            </a>
          )}
          {profile?.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.iconLink}
            >
              <FaGithub /> GitHub
            </a>
          )}
          {profile?.portfolio && (
            <a
              href={profile.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.iconLink}
            >
              <FaGlobe /> Portfolio
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: "transparent",
            color: "#4B6CB7",
            border: "1px solid #4B6CB7",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>
      {/* Enrollments Card */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Enrollments</h2>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>{enrollments.length} courses</span>
        </div>

        {enrollLoading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ color: '#6B7280' }}>No enrollments found for this student.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Enrollment Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id || enrollment.course?._id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500' }}>{enrollment.course?.title || 'Unknown Course'}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>
                        {enrollment.course?.code || ''}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={styles.td}>
                      <span style={enrollment.status === 'active' ? styles.statusActive : styles.statusInactive}>
                        {enrollment.status || 'inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${enrollment.progress || 0}%` }} />
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
                        {enrollment.progress || 0}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
