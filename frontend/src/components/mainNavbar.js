import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../images/Logo-dishub.png"; // impor logo

const MainNavbar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#4e93dc" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={logo}
            alt="Logo Dishub"
            width="58"
            height="45"
            className="d-inline-block align-top"
          />
          Dinas Perhubungan Kota Batu
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" style={{ color: "white" }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/pelaporan" style={{ color: "white" }}>
              Lapor
            </Nav.Link>
            <Nav.Link as={Link} to="/verifikasi" style={{ color: "white" }}>
              Status
            </Nav.Link>
            <Nav.Link as={Link} to="/login" style={{ color: "white" }}>
              Login
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;