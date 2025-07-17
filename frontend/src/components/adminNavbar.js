import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const AdminNavbar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#4e93dc" }}>
      <Container>
        <Navbar.Brand style={{ color: "white" }}>
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
              <NavDropdown.Item as={Link} to="/manage-user">
                Manage User
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/manage-content">
                Manage Content
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

export default AdminNavbar;
