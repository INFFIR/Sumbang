import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../images/Logo-dishub.png"; // Impor logo

const UsersNavbar = () => {
  return (
    <Navbar bg="light" variant="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <img
            src={logo}
            alt="Logo Dishub"
            width="58"
            height="45"
            className="d-inline-block align-top"
          />
          <span style={{ color: "black" }}>Dinas Perhubungan Kota Batu</span>
        </Navbar.Brand>

        <Nav className="ms-auto">
          <NavDropdown
            title={<span style={{ color: "black" }}>Manage</span>}
            id="user-nav-dropdown"
            align="end"
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
      </Container>
    </Navbar>
  );
};

export default UsersNavbar;
