import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "450px" }}>
      {/* bg-body से यह कार्ड डार्क मोड में अपने आप डार्क हो जाएगा */}
      <div className="card shadow-sm p-4 border rounded-4 bg-body">
        <div className="text-center mb-4">
          <div className="fs-1 mb-1">🚀</div>
          <h3 className="fw-bold text-success mb-1">Create Account</h3>
          <p className="text-muted small">Join to start generating AI study notes</p>
        </div>

        {error && <div className="alert alert-danger py-2 rounded-3 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="form-control rounded-3"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="form-control rounded-3"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={8}
                className="form-control rounded-start-3"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary rounded-end-3"
                onClick={() => setShowPassword(!showPassword)}
                title="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="form-text text-muted small">Must be at least 8 characters long.</div>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-2 rounded-3 fw-semibold shadow-sm mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0 text-muted small">
          Already have an account?{" "}
          <Link to="/login" className="fw-semibold text-success text-decoration-none">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}