import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import DetailNavbar from "../components/detailNavbar";
import "../css/pages/Detail.css";

const Detail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [modalType, setModalType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [showOnProcessModal, setShowOnProcessModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [id, token]);

  const getPdfUrl = (base64) => {
    if (!base64) return null;
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  const getImageUrl = (base64) => {
    return base64 ? `data:image/jpeg;base64,${base64}` : null;
  };

  const handleUpdateStatus = async (statusValue) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-status/${id}`,
        { status: statusValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData((prev) => ({ ...prev, status: statusValue }));
      handleClose();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleClose();
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setShowOnHoldModal(false);
    setShowOnProcessModal(false);
    setShowDoneModal(false);
  };

  if (!data) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
      <DetailNavbar />
      <Container className="mt-5">
        <h3 className="fw-bold">Detail Laporan Sumbang</h3>
        <p className="text-muted mb-4">
          Sarana Prasarana Untuk Masyarakat Batu Gampang
        </p>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control value={data.nama} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Alamat</Form.Label>
              <Form.Control value={data.alamat} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nomor Telpon</Form.Label>
              <Form.Control value={data.no_hp} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nomor WhatsApp</Form.Label>
              <Form.Control value={data.no_whatsapp} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Permintaan</Form.Label>
              <Form.Control value={data.permintaan} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Detail Permintaan</Form.Label>
              <Form.Control
                as="textarea"
                value={data.detail_permintaan}
                disabled
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lokasi</Form.Label>
              <Form.Control value={data.lokasi} disabled />
            </Form.Group>
            <div className="mb-3">
              <a
                href={getPdfUrl(data.surat)}
                target="_blank"
                rel="noreferrer"
                className="text-primary fw-medium"
              >
                Download Surat Pengajuan
              </a>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control value={data.status} disabled />
            </Form.Group>
          </Col>

          <Col md={4} className="d-flex align-items-start justify-content-center">
            <div className="image-frame">
              {data.foto ? (
                <img
                  src={getImageUrl(data.foto)}
                  alt="Foto Laporan"
                  className="img-fluid"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              ) : (
                <div className="text-muted">Tidak ada gambar</div>
              )}
            </div>
          </Col>
        </Row>

        {/* TOMBOL AKSI */}
        <div className="d-flex justify-content-start gap-2 mt-4">
          <Button variant="warning" onClick={() => setShowDeleteModal(true)}>
            Hapus Data
          </Button>

          {data.status === "Approved" && (
            <>
              <Button variant="secondary" onClick={() => setShowOnHoldModal(true)}>
                On Hold
              </Button>
              <Button variant="info" onClick={() => setShowOnProcessModal(true)}>
                On Process
              </Button>
            </>
          )}

          {data.status === "On Process" && (
            <Button variant="success" onClick={() => setShowDoneModal(true)}>
              Done
            </Button>
          )}

          {data.status === "On Hold" && (
            <Button variant="info" onClick={() => setShowOnProcessModal(true)}>
              On Process
            </Button>
          )}

          {["Rejected", "Approved", "On Process", "On Hold", "Done"].includes(data.status) === false && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  setModalType("Rejected");
                  setShowModal(true);
                }}
              >
                Rejected
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setModalType("Approved");
                  setShowModal(true);
                }}
              >
                Approved
              </Button>
            </>
          )}
        </div>
      </Container>

      {/* Modal Approve/Reject */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Body className="text-center">
          <p>
            Apakah anda yakin ingin mengubah status menjadi{" "}
            <strong>{modalType}</strong>?
          </p>
          <Button variant="secondary" onClick={handleClose} className="me-2">
            Batal
          </Button>
          <Button
            variant={modalType === "Approved" ? "success" : "danger"}
            onClick={() => handleUpdateStatus(modalType)}
          >
            OK
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal Delete */}
      <Modal show={showDeleteModal} onHide={handleClose} centered>
        <Modal.Body className="text-center">
          <p>Apakah anda yakin ingin menghapus data ini?</p>
          <Button variant="secondary" onClick={handleClose} className="me-2">
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            OK
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal On Hold */}
      <Modal show={showOnHoldModal} onHide={handleClose} centered>
        <Modal.Body className="text-center">
          <p>Apakah anda yakin ingin menandai laporan ini sebagai <strong>On Hold</strong>?</p>
          <Button variant="secondary" onClick={handleClose} className="me-2">Batal</Button>
          <Button variant="secondary" onClick={() => handleUpdateStatus("On Hold")}>OK</Button>
        </Modal.Body>
      </Modal>

      {/* Modal On Process */}
      <Modal show={showOnProcessModal} onHide={handleClose} centered>
        <Modal.Body className="text-center">
          <p>Apakah anda yakin ingin menandai laporan ini sebagai <strong>On Process</strong>?</p>
          <Button variant="secondary" onClick={handleClose} className="me-2">Batal</Button>
          <Button variant="info" onClick={() => handleUpdateStatus("On Process")}>OK</Button>
        </Modal.Body>
      </Modal>

      {/* Modal Done */}
      <Modal show={showDoneModal} onHide={handleClose} centered>
        <Modal.Body className="text-center">
          <p>Apakah anda yakin ingin menandai laporan ini sebagai <strong>Done</strong>?</p>
          <Button variant="secondary" onClick={handleClose} className="me-2">Batal</Button>
          <Button variant="success" onClick={() => handleUpdateStatus("Done")}>OK</Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Detail;
