import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../css/components/footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer text-white py-4">
      <Container>
        <Row>
          <Col md={6} className="text-center">
            <h4>About Us</h4>
            <p>sarana prasarana untuk masyarakat batu gampang.</p>
          </Col>
          <Col md={6} className="text-center">
            <h4>Contact</h4>
            <p>
              <i className="bi bi-envelope contact-icon"></i>
              Email:{" "}
              <a href="mailto:lalin.dishubkwb@gmail.com" className="white-link">
                lalin.dishubkwb@gmail.com
              </a>
            </p>
            <p>
              <i className="bi bi-instagram contact-icon"></i>
              Instagram:{" "}
              <a
                href="https://www.instagram.com/dishubkotabatu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="white-link"
              >
                @dishubkotabatu
              </a>
            </p>
          </Col>
        </Row>
        <Row>
          <Col className="text-center mt-0">
            <p>&copy; 2024 Dinas Perhubungan Kota Batu.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
