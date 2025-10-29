import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import studentProfileService from "../api/studentProfileApi";
import { fetchProfile } from "../features/profile/studentProfileSlice";
import { FaUserCircle } from "react-icons/fa";
import "./StudentProfileForm.css";

const StudentProfileForm = () => {
  const dispatch = useDispatch();
  const { profile, status, error } = useSelector((state) => state.studentProfile);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    collegeName: "",
    department: "",
    degree: "",
    yearOfStudy: "",
    cgpa: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    backlogs: "",
    linkedin: "",
    github: "",
    portfolio: "",
    technicalSkills: "",
    softSkills: "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        ...profile,
        technicalSkills: profile.technicalSkills?.join(", ") || "",
        softSkills: profile.softSkills?.join(", ") || "",
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (user?.token) {
      dispatch(fetchProfile(user.token));
    }
  }, [dispatch, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    if (!user?.token) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      if (profile?._id) {
        await studentProfileService.updateProfile(profile._id, data, user.token);
      } else {
        await studentProfileService.saveProfile(data, user.token);
      }

      alert("Profile saved successfully!");
      dispatch(fetchProfile(user.token));
      setIsSaved(true);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Failed to save profile. Check console for details.");
      setIsSaved(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Student Profile</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        <h3 className="section-title">Basic Info</h3>
        <div className="form-grid">
          <div className="form-field">
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Gender</label>
            <input name="gender" value={formData.gender} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob ? formData.dob.split("T")[0] : ""} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        <h3 className="section-title">Academic Info</h3>
        <div className="form-grid">
          {[
            ["collegeName", "College Name"],
            ["department", "Department"],
            ["degree", "Degree"],
            ["yearOfStudy", "Year of Study", "number"],
            ["cgpa", "CGPA", "number"],
            ["tenthPercentage", "10th %", "number"],
            ["twelfthPercentage", "12th %", "number"],
            ["backlogs", "Backlogs", "number"],
          ].map(([key, label, type = "text"]) => (
            <div key={key} className="form-field">
              <label>{label}</label>
              <input
                name={key}
                type={type}
                value={formData[key]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <h3 className="section-title">Skills</h3>
        <div className="form-field">
          <label>Technical Skills</label>
          <textarea name="technicalSkills" value={formData.technicalSkills} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Soft Skills</label>
          <textarea name="softSkills" value={formData.softSkills} onChange={handleChange} />
        </div>

        <h3 className="section-title">Links</h3>
        {[
          ["linkedin", "LinkedIn URL"],
          ["github", "GitHub URL"],
          ["portfolio", "Portfolio URL"],
        ].map(([key, label]) => (
          <div key={key} className="form-field">
            <label>{label}</label>
            <input name={key} value={formData[key]} onChange={handleChange} />
          </div>
        ))}

        <button type="submit" className="save-btn" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default StudentProfileForm;
