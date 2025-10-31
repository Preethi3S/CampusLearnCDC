import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import studentProfileService from "../api/studentProfileApi";
import { fetchProfile } from "../features/profile/studentProfileSlice";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";
import "./StudentProfileForm.css";

const StudentProfileForm = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.studentProfile);
  const { user, token: authToken } = useSelector((state) => state.auth);

  const [isSaved, setIsSaved] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillFields, setSkillFields] = useState({
    technicalSkills: "",
    softSkills: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  useEffect(() => {
    const token = authToken || user?.token;
    if (token) dispatch(fetchProfile(token));
  }, [dispatch, user, authToken]);

  useEffect(() => {
    if (profile) {
      setSkillFields({
        technicalSkills: profile.technicalSkills?.join(", ") || "",
        softSkills: profile.softSkills?.join(", ") || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        portfolio: profile.portfolio || "",
      });
    }
  }, [profile]);

  const handleSaveSkills = async () => {
    const token = authToken || user?.token;
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const data = new FormData();
      data.append("technicalSkills", skillFields.technicalSkills);
      data.append("softSkills", skillFields.softSkills);
      data.append("linkedin", skillFields.linkedin);
      data.append("github", skillFields.github);
      data.append("portfolio", skillFields.portfolio);

      if (profile?._id) {
        await studentProfileService.updateProfile(profile._id, data, token);
      } else {
        await studentProfileService.saveProfile(data, token);
      }

      setEditingSkills(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      dispatch(fetchProfile(token));
    } catch (error) {
      console.error("Error saving skills:", error);
      alert("Failed to save skills");
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Student Profile</h2>

      {/* BASIC INFO */}
      <div className="card">
        <h3 className="section-title">Basic Information</h3>
        <div className="display-grid">
          <div className="display-field">
            <label>Full Name</label>
            <div className="readonly-box">{profile?.name || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Email</label>
            <div className="readonly-box">{profile?.email || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Phone</label>
            <div className="readonly-box">{profile?.phone || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Gender</label>
            <div className="readonly-box">{profile?.gender || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Date of Birth</label>
            <div className="readonly-box">
              {profile?.dob ? new Date(profile.dob).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div className="display-field">
            <label>Address</label>
            <div className="readonly-box">{profile?.address || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* ACADEMIC INFO */}
      <div className="card">
        <h3 className="section-title">Academic Information</h3>
        <div className="display-grid">
          <div className="display-field">
            <label>College Name</label>
            <div className="readonly-box">{profile?.collegeName || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Department</label>
            <div className="readonly-box">{profile?.department || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Degree</label>
            <div className="readonly-box">{profile?.degree || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Year of Study</label>
            <div className="readonly-box">{profile?.yearOfStudy || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>CGPA</label>
            <div className="readonly-box">{profile?.cgpa || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>10th %</label>
            <div className="readonly-box">{profile?.tenthPercentage || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>12th %</label>
            <div className="readonly-box">{profile?.twelfthPercentage || "N/A"}</div>
          </div>
          <div className="display-field">
            <label>Backlogs</label>
            <div className="readonly-box">{profile?.backlogs || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* SKILLS SECTION */}
      <div className="card">
        <h3 className="section-title">Skills</h3>
        <div className="display-grid">
          {!editingSkills ? (
            <>
              <div className="display-field">
                <label>Technical Skills</label>
                <div className="readonly-box">
                  {Array.isArray(profile?.technicalSkills)
                    ? profile.technicalSkills.join(", ")
                    : profile?.technicalSkills || "N/A"}
                </div>
              </div>
              <div className="display-field">
                <label>Soft Skills</label>
                <div className="readonly-box">
                  {Array.isArray(profile?.softSkills)
                    ? profile.softSkills.join(", ")
                    : profile?.softSkills || "N/A"}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="display-field">
                <label>Technical Skills</label>
                <textarea
                  name="technicalSkills"
                  value={skillFields.technicalSkills}
                  onChange={(e) =>
                    setSkillFields((f) => ({ ...f, technicalSkills: e.target.value }))
                  }
                />
              </div>
              <div className="display-field">
                <label>Soft Skills</label>
                <textarea
                  name="softSkills"
                  value={skillFields.softSkills}
                  onChange={(e) =>
                    setSkillFields((f) => ({ ...f, softSkills: e.target.value }))
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* LINKS SECTION */}
      <div className="card">
        <h3 className="section-title">Links</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {profile?.linkedin ? (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="icon-link">
              <FaLinkedin /> LinkedIn
            </a>
          ) : (
            <div className="display-field">
              <label>LinkedIn</label>
              <div className="readonly-box">N/A</div>
            </div>
          )}

          {profile?.github ? (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="icon-link">
              <FaGithub /> GitHub
            </a>
          ) : (
            <div className="display-field">
              <label>GitHub</label>
              <div className="readonly-box">N/A</div>
            </div>
          )}

          {profile?.portfolio ? (
            <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="icon-link">
              <FaGlobe /> Portfolio
            </a>
          ) : (
            <div className="display-field">
              <label>Portfolio</label>
              <div className="readonly-box">N/A</div>
            </div>
          )}
        </div>

        {editingSkills ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <button type="button" className="save-btn" onClick={handleSaveSkills}>
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditingSkills(false);
                setSkillFields({
                  technicalSkills: profile?.technicalSkills?.join(", ") || "",
                  softSkills: profile?.softSkills?.join(", ") || "",
                  linkedin: profile?.linkedin || "",
                  github: profile?.github || "",
                  portfolio: profile?.portfolio || "",
                });
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="edit-btn" onClick={() => setEditingSkills(true)}>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileForm;