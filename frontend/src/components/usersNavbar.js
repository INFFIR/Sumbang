import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../images/Logo-dishub.png"; // Impor logo

const UsersNavbar = () => {
  return (
    <Navbar expand="lg" className="shadow-sm" style={{ backgroundColor: "#2F5D9F"}}>
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
          <span style={{ color: "white" }}>Dinas Perhubungan Kota Batu</span>
        </Navbar.Brand>

        <Nav className="ms-auto">
          <NavDropdown
            title={<span style={{ color: "white" }}>Manage</span>}
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
