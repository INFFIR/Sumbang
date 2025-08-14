import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/Logo-dishub.png";
import logo2 from "../images/Logo-pemkot-batu.png";

const MainNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className="shadow-sm" style={{ backgroundColor: "#2F5D9F" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ display: "flex", alignItems: "center", gap: "1px" }}>
          <img src={logo2} alt="Logo Pemkot Batu" width="58" height="45" className="d-inline-block align-top" />
          <img src={logo} alt="Logo Dishub" width="58" height="45" className="d-inline-block align-top" />
          <span style={{ color: "white" }}>Dinas Perhubungan Kota Batu</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" style={{ color: "white" }}>Home</Nav.Link>
            <Nav.Link as={Link} to="/pelaporan" style={{ color: "white" }}>Lapor</Nav.Link>
            <Nav.Link as={Link} to="/verifikasi" style={{ color: "white" }}>Status</Nav.Link>

            {!isLoggedIn ? (
              <Nav.Link as={Link} to="/login" style={{ color: "white" }}>Login</Nav.Link>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" style={{ color: "white", textDecoration: "none" }}>
                  Profile
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
