import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../images/Logo-dishub.png"; // impor logo

const AdminNavbar = () => {
  return (
    <Navbar expand="lg" className="shadow-sm" style={{ backgroundColor: "#2F5D9F"}}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={logo}
                    alt="Logo Dishub"
                    width="58"
                    height="45"
                    className="d-inline-block align-top"
                  />
                  <span style={{ color: "white" }}>Dinas Perhubungan Kota Batu</span>
          </Navbar.Brand>
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
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
