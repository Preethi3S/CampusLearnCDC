import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { logout } from "../../features/auth/authSlice";
import courseApi from "../../api/courseApi";
import progressApi from "../../api/progressApi";
import StudentMessageBoard from "./StudentMessageBoard";
import { fetchProfile } from "../../features/profile/studentProfileSlice";
import StudentProfileForm from "../../components/studentProfileForm";

const COLORS = {
  primary: "#473E7A",
  accent: "#4B6CB7",
  success: "#10B981",
  border: "#EBEBEB",
  bg: "#F8F8F8",
  white: "#FFFFFF",
  danger: "#E53935",
  gray: "#6B7280",
};

const buttonBase = {
  padding: "10px 18px",
  borderRadius: 6,
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.2s",
  marginRight: "10px",
};

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const { profile } = useSelector((s) => s.studentProfile);

  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyEnrolled, setOnlyEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    dispatch(fetchProfile(token));
  }, [dispatch, token]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const allCourses = await courseApi.getCourses(token, true);
      const enrolledProgresses = await progressApi.getMyCourses(token);
      const enrolledIds = enrolledProgresses
        .filter((p) => p.course?._id)
        .map((p) => String(p.course._id));
      setCourses(allCourses);
      setEnrolledCourseIds(enrolledIds);
    } catch (err) {
      console.error(err);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const handleEnroll = async (courseId) => {
    try {
      await progressApi.enrollCourse(courseId, token);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to enroll");
    }
  };

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = courses;
    if (onlyEnrolled) list = list.filter((c) => enrolledCourseIds.includes(String(c._id)));
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [courses, query, onlyEnrolled, enrolledCourseIds]);

  if (loading) return <p>Loading courses...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
      {/* --- SIDEBAR --- */}
      <div
        style={{
          width: 220,
          background: COLORS.white,
          borderRight: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          padding: 20,
          gap: 20,
        }}
      >
        <h3 style={{ color: COLORS.primary, marginBottom: 20 }}>Dashboard</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => setActiveTab("courses")}
            style={{
              padding: "10px 12px",
              background: activeTab === "courses" ? COLORS.accent : "transparent",
              color: activeTab === "courses" ? COLORS.white : COLORS.primary,
              borderRadius: 6,
              border: "none",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            Courses
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "10px 12px",
              background: activeTab === "profile" ? COLORS.accent : "transparent",
              color: activeTab === "profile" ? COLORS.white : COLORS.primary,
              borderRadius: 6,
              border: "none",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            Profile
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            style={{
              padding: "10px 12px",
              background: activeTab === "messages" ? COLORS.accent : "transparent",
              color: activeTab === "messages" ? COLORS.white : COLORS.primary,
              borderRadius: 6,
              border: "none",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            Messages
          </button>
        </div>

        <div style={{ marginTop: "auto" }}>
          <button
            onClick={() => dispatch(logout())}
            style={{ ...buttonBase, background: COLORS.danger, color: COLORS.white, width: "100%" }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, padding: 30, display: "flex", flexDirection: "column", gap: 20 }}>
        {activeTab === "courses" && (
          <>
            <h2
              style={{
                color: COLORS.primary,
                borderBottom: `2px solid ${COLORS.border}`,
                paddingBottom: 10,
                marginBottom: 15,
              }}
            >
              Courses
            </h2>

            <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }}>
              <input
                placeholder="Search courses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e6e6e6",
                }}
              />
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={onlyEnrolled}
                  onChange={() => setOnlyEnrolled((v) => !v)}
                />
                Only enrolled
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              }}
            >
              {filteredCourses.map((c) => {
                const isEnrolled = enrolledCourseIds.includes(String(c._id));
                return (
                  <div
                    key={c._id}
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      padding: 20,
                      borderRadius: 8,
                      background: COLORS.white,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.04)",
                      borderLeft: isEnrolled
                        ? `6px solid ${COLORS.accent}`
                        : "6px solid transparent",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          gap: 12,
                        }}
                      >
                        <h4 style={{ color: COLORS.primary, margin: 0 }}>{c.title}</h4>
                        {isEnrolled && (
                          <div
                            style={{
                              fontSize: 12,
                              color: COLORS.white,
                              background: COLORS.accent,
                              padding: "6px 8px",
                              borderRadius: 6,
                            }}
                          >
                            Enrolled
                          </div>
                        )}
                      </div>
                      <p style={{ color: COLORS.gray, fontSize: "0.95em", minHeight: 42 }}>
                        {c.description || "No description"}
                      </p>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                      {isEnrolled ? (
                        <Link to={`/student/course/${c._id}`} style={{ textDecoration: "none" }}>
                          <button
                            style={{ ...buttonBase, background: COLORS.accent, color: COLORS.white }}
                          >
                            Go to Course
                          </button>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(c._id)}
                          style={{ ...buttonBase, background: COLORS.success, color: COLORS.white }}
                        >
                          Enroll
                        </button>
                      )}
                      <Link
                        to={`/student/course/${c._id}`}
                        style={{
                          alignSelf: "center",
                          color: COLORS.gray,
                          textDecoration: "none",
                          fontSize: 13,
                        }}
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "messages" && <StudentMessageBoard />}

        {activeTab === "profile" && (
          <div style={{ padding: 10 }}>
            <StudentProfileForm />
          </div>
        )}
      </div>
    </div>
  );
}
