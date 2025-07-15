import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const MainNavbar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#4e93dc" }}>
      <Container>
        <Navbar.Brand style={{ color: "white" }}>
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
          </Nav>
          <Nav>
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
