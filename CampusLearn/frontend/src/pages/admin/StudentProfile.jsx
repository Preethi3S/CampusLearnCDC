import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaUserCircle, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    color: "#4B6CB7",
    textDecoration: "none",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: "500",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "16px",
    borderBottom: "1px solid #E5E7EB",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    padding: "24px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  infoBox: {
    background: "#F9FAFB",
    padding: "12px 16px",
    borderRadius: "8px",
  },
  label: {
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "4px",
  },
  value: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#111827",
  },
  iconLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#4B6CB7",
    textDecoration: "none",
    fontWeight: "500",
  },
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [user?.token, studentId]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading profile...</p>;

  if (error)
    return (
      <div style={styles.container}>
        <Link to="/admin/dashboard" style={styles.backButton}>
          ← Back to Students
        </Link>
        <div
          style={{
            background: "#FEF2F2",
            padding: "16px",
            borderRadius: "8px",
            color: "#991B1B",
          }}
        >
          {error}
        </div>
      </div>
    );

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
      </div>

      {/* ✅ Basic Info */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Basic Information</h2>
        <div style={styles.grid}>
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
        </div>
      </div>

      {/* ✅ Academic Info */}
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
    </div>
  );
};

export default StudentProfile;
