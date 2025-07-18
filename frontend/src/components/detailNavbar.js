import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../images/Logo-dishub.png"; // impor logo

const DetailNavbar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#4e93dc" }}>
      <Container>
        {/* Bagian logo tidak diubah*/}
        <Navbar.Brand as={Link} to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={logo}
            alt="Logo Dishub"
            width="58"
            height="45"
            className="d-inline-block align-top"
          />
          {/* Menggunakan style inline untuk memastikan warna teks hitam */}
          <span style={{ color: "black" }}>Dinas Perhubungan Kota Batu</span>
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
