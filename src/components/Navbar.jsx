import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsNavOpen(false);
    navigate("/login");
  };

  const toggleNavbar = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNavbar = () => {
    setIsNavOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top">
      <div className="container py-1">

        {/* Logo */}
        <Link 
          className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" 
          to={user ? "/dashboard" : "/login"}
          onClick={closeNavbar}
        >
          <span>🧠</span>
          <span>Edu<span className="text-primary">AI</span></span>
        </Link>

        {/* Mobile Toggle Button (React State Handled) */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
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
                  className="nav-link fw-semibold text-dark" 
                  to="/dashboard"
                  onClick={closeNavbar}
                >
                  📝 My Notes
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted small">
                  Hi, <strong className="text-dark">{user.name}</strong>
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
                  onClick={closeNavbar}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary px-3 rounded-pill"
                  onClick={closeNavbar}
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