import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../css/components/footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer text-white py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            {/* Logo Section */}
            <div className="footer-logo mb-4">
              <div className="logo-circle">
                <i className="bi bi-circle"></i>
              </div>
              <h5 className="mt-2 mb-0">Dinas Perhubungan Kota Batu</h5>
            </div>

            {/* Social Media Icons */}
            <div className="social-media mb-4">
              <a href="#" className="social-icon me-3" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-icon me-3" aria-label="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="social-icon me-3" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="https://www.instagram.com/dishubkotabatu" className="social-icon" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>

            {/* Contact Info */}
            <div className="contact-info mb-4">
              <h6 className="mb-3">Hubungi Kami</h6>
              <div className="contact-details">
                <p className="mb-2">
                  <span className="contact-label">Instagram:</span>
                  <a
                    href="https://www.instagram.com/dishubkotabatu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link"
                  >
                    @dishubkotabatu
                  </a>
                  <span className="contact-separator">|</span>
                  <span className="contact-label">Email:</span>
                  <a
                    href="mailto:lalin.dishubkwb@gmail.com"
                    className="contact-link"
                  >
                    lalin.dishubkwb@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="mission-statement">
              <p className="mb-0">sarana prasarana untuk masyarakat batu gampang.</p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
