import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    logout();
    setIsNavOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom shadow-sm sticky-top bg-body">
      <div className="container py-1">

        {/* Logo */}
        <Link 
          className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 text-body" 
          to={user ? "/dashboard" : "/login"}
          onClick={() => setIsNavOpen(false)}
        >
          <span>🧠</span>
          <span>
            Edu<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Menu */}
        <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`}>
          
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            {user && (
              <li className="nav-item">
                <Link 
                  className="nav-link fw-semibold text-body" 
                  to="/dashboard"
                  onClick={() => setIsNavOpen(false)}
                >
                  📝 My Notes
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            
            {/* Theme Toggle Button (हमेशा Navbar में दिखेगा) */}
            <button
              onClick={toggleTheme}
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 me-2"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted small">
                  Hi, <strong className="text-body">{user.name}</strong>
                </span>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline-danger btn-sm px-3 shadow-sm rounded-pill"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link 
                  to="/login" 
                  className="btn btn-outline-primary px-3 rounded-pill"
                  onClick={() => setIsNavOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary px-3 rounded-pill"
                  onClick={() => setIsNavOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;