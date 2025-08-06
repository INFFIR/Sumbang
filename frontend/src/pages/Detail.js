//Detail.js

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
  const [keterangan, setKeterangan] = useState("");
  const [saving, setSaving] = useState(false);
  
  // New states for photo upload
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (data?.keterangan) {
      setKeterangan(data.keterangan);
    }
  }, [data]);

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

  // Function to format WhatsApp number and create WhatsApp URL
  const formatWhatsAppNumber = (number) => {
    if (!number) return null;
    // Remove any non-numeric characters
    let cleaned = number.replace(/\D/g, '');
    // Add country code if not present (assuming Indonesia +62)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const getWhatsAppUrl = (number) => {
    const formattedNumber = formatWhatsAppNumber(number);
    return formattedNumber ? `https://wa.me/${formattedNumber}` : null;
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Done with photo upload
  const handleDoneWithPhoto = async () => {
    if (!selectedPhoto) {
      alert("Silakan pilih foto terlebih dahulu sebelum menandai sebagai Done.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("foto_selesai", selectedPhoto);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-status-with-photo/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setData((prev) => ({ ...prev, status: "Done" }));
      handleClose();
      alert("Status berhasil diubah menjadi Done dan foto telah diupload.");
    } catch (err) {
      console.error("Error updating status with photo:", err);
      alert("Terjadi kesalahan saat mengupload foto dan mengubah status.");
    } finally {
      setUploadingPhoto(false);
    }
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

  const handleSaveKeterangan = async () => {
    setSaving(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-keterangan/${id}`,
        { keterangan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData((prev) => ({ ...prev, keterangan }));
      alert("Keterangan berhasil disimpan.");
    } catch (error) {
      console.error("Gagal menyimpan keterangan:", error);
      alert("Terjadi kesalahan saat menyimpan keterangan.");
    } finally {
      setSaving(false);
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
    // Reset photo states when closing modal
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  if (!data) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
      <DetailNavbar />
      <Container className="mt-5">
        <h3 className="fw-bold">Detail Pelapor Sumbang</h3>
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
              {data.no_whatsapp && getWhatsAppUrl(data.no_whatsapp) ? (
                <div>
                  <a
                    href={getWhatsAppUrl(data.no_whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-inline-flex align-items-center px-3 py-2 rounded text-white"
                    style={{ backgroundColor: "#2F5D9F", textDecoration: "none" }}
                  >
                    <i className="fab fa-whatsapp me-2"></i>
                    Hubungi via WhatsApp
                  </a>
                </div>
              ) : (
                <p className="text-muted">Tidak tersedia</p>
              )}
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

            {/* Display completion photo if exists */}
            {data.foto_selesai && (
              <Form.Group className="mb-3">
                <Form.Label>Foto Penyelesaian</Form.Label>
                <div>
                  <img
                    src={getImageUrl(data.foto_selesai)}
                    alt="Foto Penyelesaian"
                    className="img-fluid"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              </Form.Group>
            )}
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
        
        <Form.Group className="mb-3 d-flex align-items-end gap-2">
          <div style={{ flex: 1 }}>
            <Form.Label>Keterangan</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder={keterangan ? "" : "Tulis keterangan di sini..."}
            />
          </div>
          <Button
            variant="success"
            onClick={handleSaveKeterangan}
            disabled={saving}
            style={{ height: "38px", marginBottom: "4px" }}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </Form.Group>

        {/* TOMBOL AKSI */}
        <div className="d-flex justify-content-start gap-2 mt-4 mb-4">
          <Button
            style={{ backgroundColor: "#C0392B" }}
            onClick={() => setShowDeleteModal(true)}
          >
            Hapus Data
          </Button>

          {data.status === "Approved" && (
            <>
              <Button
                style={{ backgroundColor: "#7F8C8D" }}
                onClick={() => setShowOnHoldModal(true)}
              >
                On Hold
              </Button>
              <Button
                style={{ backgroundColor: "#2980B9" }}
                onClick={() => setShowOnProcessModal(true)}
              >
                On Process
              </Button>
            </>
          )}

          {data.status === "On Process" && (
            <Button
              style={{ backgroundColor: "#191987ff" }}
              onClick={() => setShowDoneModal(true)}
            >
              Done
            </Button>
          )}

          {data.status === "On Hold" && (
            <Button
              style={{ backgroundColor: "#2980B9" }}
              onClick={() => setShowOnProcessModal(true)}
            >
              On Process
            </Button>
          )}

          {["Rejected", "Approved", "On Process", "On Hold", "Done"].includes(data.status) === false && (
            <>
              <Button
                style={{ backgroundColor: "#E74C3C" }}
                onClick={() => {
                  setModalType("Rejected");
                  setShowModal(true);
                }}
              >
                Rejected
              </Button>
              <Button
                style={{ backgroundColor: "#27AE60" }}
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
            style={{ backgroundColor: "#27AE60", color: "#fff" }}
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
          <Button
            style={{ backgroundColor: "#27AE60", color: "#fff" }}
            onClick={handleDelete}
          >
            OK
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal On Hold */}
      <Modal show={showOnHoldModal} onHide={handleClose} centered>
        <Modal.Body className="text-center">
          <p>
            Apakah anda yakin ingin menandai laporan ini sebagai{" "}
            <strong>On Hold</strong>?
          </p>
          <Button variant="secondary" onClick={handleClose} className="me-2">
            Batal
          </Button>
          <Button
            style={{ backgroundColor: "#27AE60", color: "#fff" }}
            onClick={() => handleUpdateStatus("On Hold")}
          >
            OK
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal On Process */}
      <Modal show={showOnProcessModal} onHide={handleClose} centered>
        <Modal.Body className="text-center">
          <p>
            Apakah anda yakin ingin menandai laporan ini sebagai{" "}
            <strong>On Process</strong>?
          </p>
          <Button variant="secondary" onClick={handleClose} className="me-2">
            Batal
          </Button>
          <Button
            style={{ backgroundColor: "#27AE60", color: "#fff" }}
            onClick={() => handleUpdateStatus("On Process")}
          >
            OK
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal Done with Photo Upload */}
      <Modal show={showDoneModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Foto Penyelesaian</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Silakan upload foto sebagai bukti penyelesaian sebelum menandai laporan sebagai{" "}
            <strong>Done</strong>.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Pilih Foto</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
            />
          </Form.Group>

          {photoPreview && (
            <div className="mb-3">
              <Form.Label>Preview Foto:</Form.Label>
              <div>
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="img-fluid"
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Batal
            </Button>
            <Button
              style={{ backgroundColor: "#27AE60", color: "#fff" }}
              onClick={handleDoneWithPhoto}
              disabled={!selectedPhoto || uploadingPhoto}
            >
              {uploadingPhoto ? "Mengupload..." : "Upload & Done"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Detail;
