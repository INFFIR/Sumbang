import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const LogoutNavbar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#4e93dc" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: "white" }}>
          Dinas Perhubungan Kota Batu
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/logout" style={{ color: "white" }}>
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default LogoutNavbar;
