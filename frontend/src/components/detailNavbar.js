import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const DetailNavbar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#4e93dc" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: "white" }}>
          Dinas Perhubungan Kota Batu
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/dashboard" style={{ color: "white" }}>
              Dashboard
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DetailNavbar;
