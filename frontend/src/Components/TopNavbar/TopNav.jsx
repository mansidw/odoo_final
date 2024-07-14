import React, { useState } from "react";
import "./TopNav.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TopNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, contextuser } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  console.log("nav - contextuser")
  console.log(contextuser)

  return (
    <div className="topnav_container">
      <div className="topnav_main_element">
        <div className="topnav_ele logo">
          <Link to="/">
            <img className="navbar_logo" src="./logo.png" alt="" />
          </Link>
        </div>
        <div className={`topnav_ele menu ${isOpen ? "open" : ""}`}>
          <Link to="/explore">
            <p className="topnav_menu_item">Explore</p>
          </Link>
          <Link to="/history">
            <p className="topnav_menu_item">History</p>
          </Link>
          <Link to="/profile">
            <p className="topnav_menu_item">Profile</p>
          </Link>
        </div>
        <div className={`topnav_ele buttons ${isOpen ? "open" : ""}`}>
          {!contextuser && <button className="top_nav_button" onClick={() => navigate("/login")}>
            Sign In
          </button>}
          {!contextuser && <button
            className="top_nav_button"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>}
          {/* <p>Hi {contextuser?.name}</p> */}
          {contextuser && <button
            className="top_nav_button"
            onClick={() => logout()}
          >
            Logout
          </button>}

          {contextuser && <p>Hi {contextuser?.name}</p>}
        </div>
        <div className="topnav_ele hamburger" onClick={toggleMenu}>
          <div className="hamburger_icon">&#9776;</div>
        </div>
      </div>
      {isOpen && (
        <div className="dropdown_menu">
          <Link to="/explore" onClick={toggleMenu}>
            <p className="topnav_menu_item">Explore</p>
          </Link>
          <Link to="/history" onClick={toggleMenu}>
            <p className="topnav_menu_item">History</p>
          </Link>
          <Link to="/profile" onClick={toggleMenu}>
            <p className="topnav_menu_item">Profile</p>
          </Link>
          <div className="topnav_collapse_button">
            <button
              className="top_nav_button"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
            <button
              className="top_nav_button"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNav;
