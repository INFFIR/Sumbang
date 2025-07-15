import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const UsersNavbar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#4e93dc" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: "white" }}>
          Dinas Perhubungan Kota Batu
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto"></Nav>
          <Nav>
            <NavDropdown
              title={<span style={{ color: "white" }}>Manage</span>}
              id="admin-nav-dropdown"
            >
              <NavDropdown.Item as={Link} to="/dashboard">
                Dashboard
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/logout">
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UsersNavbar;
