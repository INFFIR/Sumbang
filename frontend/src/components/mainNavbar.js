import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../images/Logo-dishub.png"; // impor logo

const MainNavbar = () => {
  return (
    <Navbar bg="light" variant="light" expand="lg" className="shadow-sm">
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
          {/* ms-auto akan mendorong menu ke sisi kanan */}
          <Nav className="ms-auto">
            {/* Mengubah item menu dan warnanya agar sesuai dengan gambar */}
            <Nav.Link as={Link} to="/" style={{ color: "black" }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/pelaporan" style={{ color: "black" }}>
              Lapor
            </Nav.Link>
            {/* Mengganti "Status" menjadi "Aktivitas" dan link ke /verifikasi */}
            <Nav.Link as={Link} to="/verifikasi" style={{ color: "black" }}>
              Status
            </Nav.Link>
            <Nav.Link as={Link} to="/login" style={{ color: "black" }}>
              Login
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;