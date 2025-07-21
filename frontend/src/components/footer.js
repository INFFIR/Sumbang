import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../css/components/footer.css";
import logo from "../images/Logo-dishub.png"; // impor logo

const Footer = () => {
  return (
    <footer className="custom-footer text-white py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="footer-logo mb-4">
              <img
                          src={logo}
                          alt="Logo Dishub"
                          width="58"
                          height="45"
                          className="d-inline-block align-top"
                        />
              <h5 className="mt-2 mb-0">Dinas Perhubungan Kota Batu</h5>
            </div>

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
