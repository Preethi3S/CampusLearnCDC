import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import studentProfileService from '../../api/studentProfileApi';
import '../../components/StudentProfileForm.css';

export default function RegisterProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const token = state.token || null;
  const initial = state.initial || {};
  const serverData = state.serverData || {};

  // flexible prefill: initial -> serverData.profile -> serverData.user -> serverData
  const pref = (key) => {
    return (
      initial[key] ||
      serverData?.profile?.[key] ||
      serverData?.user?.[key] ||
      serverData?.[key] ||
      ''
    );
  };

  const [form, setForm] = useState({
    phone: pref('phone'),
    gender: pref('gender'),
    dob: pref('dob'),
    address: pref('address'),
    collegeName: pref('collegeName'),
    department: pref('department'),
    degree: pref('degree'),
    yearOfStudy: pref('yearOfStudy'),
    cgpa: pref('cgpa'),
    tenthPercentage: pref('tenthPercentage'),
    twelfthPercentage: pref('twelfthPercentage'),
    backlogs: pref('backlogs'),
    technicalSkills: Array.isArray(serverData?.profile?.technicalSkills)
      ? serverData.profile.technicalSkills.join(', ')
      : pref('technicalSkills'),
    softSkills: Array.isArray(serverData?.profile?.softSkills)
      ? serverData.profile.softSkills.join(', ')
      : pref('softSkills'),
    linkedin: pref('linkedin'),
    github: pref('github'),
    portfolio: pref('portfolio'),
    name: pref('name'),
    email: pref('email'),
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // if no initial email/name and not redirected from register, send back
    if (!form.email && !form.name && !state.fromRegister) {
      navigate('/register');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') data.append(k, v);
      });

      if (token) {
        await studentProfileService.saveProfile(data, token);
        setMessage('Profile saved successfully.');
        // remove any pending local copy
        const pendingKey = `pendingProfile_${form.email}`;
        localStorage.removeItem(pendingKey);
      } else {
        // store pending profile locally keyed by email so we can apply it after login
        const key = `pendingProfile_${form.email}`;
        const obj = {};
        data.forEach((v, k) => { obj[k] = v; });
        localStorage.setItem(key, JSON.stringify(obj));
        setMessage('Profile saved locally. It will be applied once you sign in after approval.');
      }
      // navigate to login or student dashboard depending on token
      setTimeout(() => {
        if (token) navigate('/student/dashboard');
        else navigate('/login');
      }, 900);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setMessage(err.response?.data?.message || err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Complete your Student Profile</h2>

      <div className="card">
        <p style={{ color: '#666', marginTop: 0 }}>Provide contact and academic details to complete your profile.</p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div className="display-grid">
            <div className="display-field">
              <label>Full Name</label>
              <div className="readonly-box">{form.name || '—'}</div>
            </div>
            <div className="display-field">
              <label>Email</label>
              <div className="readonly-box">{form.email || '—'}</div>
            </div>
            <div className="display-field">
              <label>Phone</label>
              <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Gender</label>
              <input name="gender" placeholder="Gender" value={form.gender} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Date of Birth</label>
              <input name="dob" type="date" placeholder="DOB" value={form.dob} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Address</label>
              <input name="address" placeholder="Address" value={form.address} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>College Name</label>
              <input name="collegeName" placeholder="College" value={form.collegeName} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Department</label>
              <input name="department" placeholder="Department" value={form.department} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Degree</label>
              <input name="degree" placeholder="Degree" value={form.degree} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Year of Study</label>
              <input name="yearOfStudy" type="number" placeholder="Year" value={form.yearOfStudy} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>CGPA</label>
              <input name="cgpa" type="number" placeholder="CGPA" value={form.cgpa} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>10th %</label>
              <input name="tenthPercentage" type="number" placeholder="10th %" value={form.tenthPercentage} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>12th %</label>
              <input name="twelfthPercentage" type="number" placeholder="12th %" value={form.twelfthPercentage} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Backlogs</label>
              <input name="backlogs" type="number" placeholder="Backlogs" value={form.backlogs} onChange={onChange} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#6b7280' }}>Technical Skills (comma separated)</label>
            <textarea name="technicalSkills" placeholder="Technical Skills" value={form.technicalSkills} onChange={onChange} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#6b7280' }}>Soft Skills (comma separated)</label>
            <textarea name="softSkills" placeholder="Soft Skills" value={form.softSkills} onChange={onChange} />
          </div>

          <div className="display-grid">
            <div className="display-field">
              <label>LinkedIn</label>
              <input name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>GitHub</label>
              <input name="github" placeholder="GitHub URL" value={form.github} onChange={onChange} />
            </div>
            <div className="display-field">
              <label>Portfolio</label>
              <input name="portfolio" placeholder="Portfolio URL" value={form.portfolio} onChange={onChange} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="cancel-btn" onClick={() => navigate('/login')}>Skip</button>
            <button type="submit" className="save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>

          {message && <div style={{ marginTop: 8, color: '#333' }}>{message}</div>}
        </form>
      </div>
    </div>
  );
}
