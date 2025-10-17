import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, saveProfile } from '../../../features/profile/studentProfileSlice';
import './StudentProfilePopup.css';

export default function StudentProfilePopup({ isOpen, onClose, token }) {
  const dispatch = useDispatch();
  const { profile } = useSelector(s => s.studentProfile);
  const [formData, setFormData] = useState({
    name: '', age: '', department: '', address: '', dob: '', phone: '', cgpa: '',
    hasArrear: false, arrearsHistory: '', tenthPercentage: '', twelfthPercentage: '',
    cutoff: '', certificates: null, resume: null, profilePhoto: null,
    codingLinks: '', projects: 'No Projects', achievements: 'No Achievements'
  });

  useEffect(() => {
    if (isOpen) dispatch(fetchProfile(token));
  }, [isOpen]);

  useEffect(() => {
    if (profile) setFormData({ ...formData, ...profile });
  }, [profile]);

  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') setFormData(f => ({ ...f, [name]: checked }));
    else if (type === 'file') setFormData(f => ({ ...f, [name]: files[0] }));
    else setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    await dispatch(saveProfile({ formData: data, token }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-backdrop">
      <div className="popup-container">
        <h2>Student Profile</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
          <input name="cgpa" type="number" step="0.01" placeholder="CGPA" value={formData.cgpa} onChange={handleChange} required />
          <label><input type="checkbox" name="hasArrear" checked={formData.hasArrear} onChange={handleChange}/> Has Arrear</label>
          {formData.hasArrear && <textarea name="arrearsHistory" placeholder="Arrears History" value={formData.arrearsHistory} onChange={handleChange}/>}
          <input name="tenthPercentage" type="number" step="0.01" placeholder="10th %" value={formData.tenthPercentage} onChange={handleChange} required />
          <input name="twelfthPercentage" type="number" step="0.01" placeholder="12th %" value={formData.twelfthPercentage} onChange={handleChange} required />
          <input name="cutoff" type="number" step="0.01" placeholder="Cutoff" value={formData.cutoff} onChange={handleChange} required />
          <input name="codingLinks" placeholder="Coding Links" value={formData.codingLinks} onChange={handleChange} required />
          <label>Certificates <input type="file" name="certificates" onChange={handleChange} /></label>
          <label>Resume <input type="file" name="resume" onChange={handleChange} required /></label>
          <label>Profile Photo <input type="file" name="profilePhoto" onChange={handleChange} /></label>
          <textarea name="projects" placeholder="Projects" value={formData.projects} onChange={handleChange}/>
          <textarea name="achievements" placeholder="Achievements" value={formData.achievements} onChange={handleChange}/>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Close</button>
        </form>
      </div>
    </div>
  );
}
