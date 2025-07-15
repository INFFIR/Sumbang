import React from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import logo from "../images/Logo-dishub.png";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLaporClick = () => {
    navigate("/lapor"); // arahkan ke halaman lapor
  };

  return (
    <div>
      <MainNavbar />

      {/* Section: Hero */}
      <section className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="fw-bold">Dinas Perhubungan<br />Kota Batu</h1>
              <p className="text-muted">
                Dinas Perhubungan Kota Batu adalah instansi pemerintah yang bertanggung jawab dalam mengatur dan mengelola kebijakan transportasi di Kota Batu, Jawa Timur.
              </p>
              <Button variant="secondary" onClick={handleLaporClick}>
                Lapor Sekarang
              </Button>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-center border rounded p-5" style={{ borderColor: '#c0dbfc' }}>
                <i className="bi bi-image fs-1 text-muted"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Section: Layanan */}
      <section className="py-5 text-center">
  <h4 className="mb-4 fw-semibold">Layanan</h4>
  <Container>
    <Row className="justify-content-center">
      {/* Kartu: Lapor */}
      <Col md={3} className="mx-2 mb-3">
        <Card style={{ backgroundColor: "#CBD5E1", border: "none", borderRadius: "12px" }}>
          <Card.Body>
            <h5 className="fw-bold">Lapor</h5>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Lapor adalah layanan pelaporan online untuk masyarakat Kota Batu. Anda dapat melaporkan berbagai permasalahan lalu lintas seperti kerusakan rambu, lampu jalan, marka, serta fasilitas transportasi lainnya secara mudah dan cepat.
            </p>
          </Card.Body>
        </Card>
      </Col>

      {/* Kartu: Status */}
      <Col md={3} className="mx-2 mb-3">
        <Card style={{ backgroundColor: "#CBD5E1", border: "none", borderRadius: "12px" }}>
          <Card.Body>
            <h5 className="fw-bold">Status</h5>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Melalui fitur Status, masyarakat dapat memantau perkembangan dan progres laporan yang telah dikirim.
            </p>
          </Card.Body>
        </Card>
      </Col>

      {/* Kartu: About Us */}
      <Col md={3} className="mx-2 mb-3">
        <Card style={{ backgroundColor: "#CBD5E1", border: "none", borderRadius: "12px" }}>
          <Card.Body>
            <h5 className="fw-bold">About Us</h5>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              SUMBANG adalah platform yang dirancang oleh Dinas Perhubungan Kota Batu untuk memudahkan masyarakat dalam menyampaikan laporan terkait sarana dan prasarana lalu lintas secara praktis dan efisien.
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
</section>

      <section className="bg-secondary-subtle py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-4 mb-md-0">
              <div className="bg-white rounded p-5 shadow-sm d-inline-block">
                <i className="bi bi-image fs-1 text-muted"></i>
              </div>
            </Col>
            <Col md={9}>
              <h4 className="fw-bold">Tutorial Pengisian Laporan Sumbang</h4>
              <p className="text-muted">
                Untuk mengetahui cara pengisian laporan di website SUMBANG, silakan scan kode QR di samping. Anda akan diarahkan ke video panduan singkat mengenai langkah-langkah pelaporan.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Section: Sumbang Description */}
<section className="py-5 border-top">
  <Container>
    <Row className="align-items-center">
      <Col md={7}>
        <h3 className="fw-bold">SUMBANG</h3>
        <h4 className="fw-bold">Sarana Prasarana Untuk<br />Masyarakat Batu Gampang</h4>
        <p className="text-muted mt-4">
          SUMBANG adalah sistem pelaporan daring (online) yang disediakan oleh Dinas Perhubungan Kota Batu untuk memudahkan masyarakat dalam menyampaikan aspirasi, laporan, atau permintaan perbaikan terkait fasilitas lalu lintas dan transportasi di Kota Batu.
        </p>
      </Col>
      <Col md={5} className="text-center">
        <div className="bg-light rounded-4 p-5 shadow-sm d-inline-block">
          <i className="bi bi-image fs-1 text-muted"></i>
        </div>
      </Col>
    </Row>
  </Container>
</section>

    </div>
  );
};

export default LandingPage;
