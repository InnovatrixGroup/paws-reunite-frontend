import React, { useState } from "react";
import "../styles/NavbarNew.css";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import logo from "../pics/logo.png";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Dropdown from "./Dropdown";
import { NavLink } from "react-router-dom";
import { useFilterData, useFilterDispatch } from "../contexts/FilterContext";
import { useLocalStorage } from "react-use";
import { useNavigate } from "react-router-dom";

// NavbarNew component represents the main navigation bar of the application.
export default function NavbarNew() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  // set the backgound of the content to dark when the menu is open
  const [isDarkFilterVisible, setIsDarkFilterVisible] = useState(false);
  const filerDispath = useFilterDispatch();
  const [userAuth, setUserAuth] = useLocalStorage("pawsReuniteUserAuth");
  const navigate = useNavigate();

  // toggle the menu and the dark filter
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setIsDarkFilterVisible(!isDarkFilterVisible);
  };

  const toglleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  const handleMouseEnter = () => {
    setIsSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    setIsSubmenuOpen(false);
  };

  // reset filter data and reload the page so the selection is cleared
  const resetFilterData = () => {
    filerDispath({ type: "reset" });
    window.location.href = "/";
  };

  const handleLogout = () => {
    setUserAuth(null);
    alert("You have logged out.");
    // navigate to landing page automatically after logout
    navigate("/welcome");
  };

  return (
    <div>
      <div
        className={`dark-filter ${isDarkFilterVisible ? "active" : ""}`}
        onClick={toggleMenu}
      ></div>
      <ul className="navbar flex justify-between items-center bg-gray-200 py-2 px-6 fixed top-0 w-full max-w-7xl">
        <li>
          <NavLink className="navbar__logo" to="/" onClick={resetFilterData}>
            <img src={logo} alt="logo" className="w-10 hover:scale-110" />
          </NavLink>
        </li>

        <ul className="navbar__icons flex gap-4">
          <ul className="hidden justify-between items-center gap-6 md:flex lg:flex">
            <li className="hover:underline hover:underline-offset-4">
              <NavLink to="/" onClick={resetFilterData}>
                Home
              </NavLink>
            </li>
            <li
              className="pet__menu relative cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Pets
              {isSubmenuOpen && <Dropdown />}
            </li>
            <li className="hover:underline hover:underline-offset-4">
              <NavLink to="/petResource">Pet Resources</NavLink>
            </li>
            <li className="hover:underline hover:underline-offset-4">
              <NavLink to="/contact">Contact</NavLink>
            </li>
          </ul>
          <li>
            <NavLink className="navbar__icon cursor-pointer" to="/personalDetail">
              <PersonIcon className="hover:scale-110" />
            </NavLink>
          </li>

          <li
            className={`navbar__menu-icon ${
              isOpen ? "open" : ""
            } cursor-pointer w-5 flex flex-col justify-center md:hidden lg:hidden`}
            onClick={toggleMenu}
          >
            <span className="navbar__menu-icon-bar" />
            <span className="navbar__menu-icon-bar" />
            <span className="navbar__menu-icon-bar" />
          </li>
        </ul>
        <div className={`navbar__menu ${isOpen ? "active" : ""} text-base`}>
          <NavLink className="navbar__menu-link" to="/" onClick={toggleMenu}>
            Home
          </NavLink>
          <div className="navbar__menu-link flex" onClick={toglleSubmenu}>
            <div className="submenu-button mr-12">
              {isSubmenuOpen ? (
                <RemoveIcon style={{ fontSize: "22px" }} />
              ) : (
                <AddIcon style={{ fontSize: "22px" }} />
              )}
            </div>
            <div>Pets</div>
          </div>
          {isSubmenuOpen && (
            <div className={`navbar__submenu ${isSubmenuOpen ? "active" : ""}`}>
              <div className="navbar__submenu-link flex flex-col items-end">
                <NavLink to="/" onClick={toggleMenu}>
                  Lost Pets
                </NavLink>
                <NavLink to="/pets" onClick={toggleMenu}>
                  Found Pets
                </NavLink>
              </div>
            </div>
          )}
          <NavLink className="navbar__menu-link" to="/petResource" onClick={toggleMenu}>
            Pet Resources
          </NavLink>
          <NavLink className="navbar__menu-link" to="/contact" onClick={toggleMenu}>
            Contact
          </NavLink>
          <NavLink className="navbar__menu-link" to="/welcome" onClick={handleLogout}>
            Logout
          </NavLink>
        </div>
      </ul>
    </div>
  );
}
