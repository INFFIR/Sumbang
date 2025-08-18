import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../css/components/footer.css";
import logo from "../images/Logo-dishub.png"; // impor logo
import logo2 from "../images/Logo-pemkot-batu.png";

const Footer = () => {
  return (
    <footer className="custom-footer text-white py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="footer-logo mb-4">
              <div className="logo-row">
                <img src={logo2} alt="Logo Pemkot Batu" width="58" height="45" />
                <img src={logo} alt="Logo Dishub" width="58" height="45" />
              </div>
              <h4 className="mb-2" style={{ letterSpacing: '0.2em', fontWeight: 'bold' }}>
                PEMERINTAH KOTA BATU
              </h4>
              <h4 className="mb-0" style={{ fontWeight: 'bold' }}>
                DINAS PERHUBUNGAN
              </h4>
            </div>
            
            <div className="address-info mb-3">
              <p className="mb-1">
                Jalan Panglima Sudirman Nomor 507 Kota Batu Kode Pos 65313
              </p>
              <p className="mb-1">
                Instagram : @sarpras_dishubkwb | E-mail : dishub@batukota.go.id
              </p>
              
            </div>
            
            <div className="mission-statement mb-3">
              <p className="mb-0" style={{ fontSize: '1rem', fontStyle: 'italic' }}>
                sarana prasarana untuk masyarakat batu gampang.
              </p>
            </div>
            <div className="copyright-year">
              <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                © 2025
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
