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
  const [tempKeterangan, setTempKeterangan] = useState(""); // For modal input
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
    let cleaned = number.replace(/\D/g, '');
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

  // Fungsi untuk refresh data dari server
  const refreshData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setKeterangan(res.data.keterangan || "");
    } catch (err) {
      console.error("Error refreshing data:", err);
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
      
      // Tambahkan keterangan jika ada
      if (tempKeterangan.trim()) {
        formData.append("keterangan", tempKeterangan.trim());
      }

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
      
      refreshData();
    } catch (err) {
      console.error("Error updating status with photo:", err);
      alert("Terjadi kesalahan saat mengupload foto dan mengubah status.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle update status dengan keterangan
  const handleUpdateStatusWithKeterangan = async (statusValue, keteranganValue = "") => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-status-with-keterangan/${id}`,
        { 
          status: statusValue,
          keterangan: keteranganValue
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setData((prev) => ({ ...prev, status: statusValue }));
      handleClose();
      
      refreshData();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Terjadi kesalahan saat mengupdate status.");
    }
  };

  // Handle update keterangan saja (untuk tombol simpan keterangan)
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
      
      refreshData();
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
    // Reset states
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setTempKeterangan("");
  };

  // Handle modal dengan keterangan
  const handleModalWithKeterangan = (statusType) => {
    setModalType(statusType);
    setTempKeterangan(""); // Reset temporary keterangan
    setShowModal(true);
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
        
        {/* FORM KETERANGAN - OPTIONAL UNTUK EDIT MANUAL */}
        <Form.Group className="mb-3">
          <Form.Label>Keterangan</Form.Label>
          <Row className="align-items-end">
            <Col>
              <Form.Control
                as="textarea"
                rows={3}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Tulis keterangan (opsional)"
              />
            </Col>
            <Col xs="auto">
              <Button
                variant="success"
                onClick={handleSaveKeterangan}
                disabled={saving}
                style={{ height: "38px" }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </Col>
          </Row>
          {/* Display current saved keterangan */}
          {data.keterangan && (
            <div className="mt-2">
              <small className="text-muted">Keterangan tersimpan: </small>
              <span className="text-dark">{data.keterangan}</span>
            </div>
          )}
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
                onClick={() => {
                  setModalType("On Hold");
                  setTempKeterangan("");
                  setShowOnHoldModal(true);
                }}
              >
                On Hold
              </Button>
              <Button
                style={{ backgroundColor: "#2980B9" }}
                onClick={() => {
                  setModalType("On Process");
                  setTempKeterangan("");
                  setShowOnProcessModal(true);
                }}
              >
                On Process
              </Button>
            </>
          )}

          {data.status === "On Process" && (
            <Button
              style={{ backgroundColor: "#191987ff" }}
              onClick={() => {
                setTempKeterangan("");
                setShowDoneModal(true);
              }}
            >
              Done
            </Button>
          )}

          {data.status === "On Hold" && (
            <Button
              style={{ backgroundColor: "#2980B9" }}
              onClick={() => {
                setModalType("On Process");
                setTempKeterangan("");
                setShowOnProcessModal(true);
              }}
            >
              On Process
            </Button>
          )}

          {["Rejected", "Approved", "On Process", "On Hold", "Done"].includes(data.status) === false && (
            <>
              <Button
                style={{ backgroundColor: "#E74C3C" }}
                onClick={() => handleModalWithKeterangan("Rejected")}
              >
                Rejected
              </Button>
              <Button
                style={{ backgroundColor: "#27AE60" }}
                onClick={() => handleModalWithKeterangan("Approved")}
              >
                Approved
              </Button>
            </>
          )}
        </div>
      </Container>

      {/* Modal Approve/Reject dengan Keterangan */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ubah Status ke {modalType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah anda yakin ingin mengubah status menjadi <strong>{modalType}</strong>?</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Keterangan (Opsional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={tempKeterangan}
              onChange={(e) => setTempKeterangan(e.target.value)}
              placeholder="Tambahkan Keterangan (Opsional)"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Batal
            </Button>
            <Button
              style={{ backgroundColor: "#27AE60", color: "#fff" }}
              onClick={() => handleUpdateStatusWithKeterangan(modalType, tempKeterangan)}
            >
              {modalType}
            </Button>
          </div>
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

      {/* Modal On Hold dengan Keterangan */}
      <Modal show={showOnHoldModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ubah Status ke On Hold</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah anda yakin ingin menandai laporan ini sebagai <strong>On Hold</strong>?</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Keterangan (Opsional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={tempKeterangan}
              onChange={(e) => setTempKeterangan(e.target.value)}
    
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Batal
            </Button>
            <Button
              style={{ backgroundColor: "#27AE60", color: "#fff" }}
              onClick={() => handleUpdateStatusWithKeterangan("On Hold", tempKeterangan)}
            >
              On Hold
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal On Process dengan Keterangan */}
      <Modal show={showOnProcessModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ubah Status ke On Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah anda yakin ingin menandai laporan ini sebagai <strong>On Process</strong>?</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Keterangan (Opsional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={tempKeterangan}
              onChange={(e) => setTempKeterangan(e.target.value)}
              
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Batal
            </Button>
            <Button
              style={{ backgroundColor: "#27AE60", color: "#fff" }}
              onClick={() => handleUpdateStatusWithKeterangan("On Process", tempKeterangan)}
            >
              On Process
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal Done dengan Keterangan dan Photo Upload */}
      <Modal show={showDoneModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Foto Penyelesaian</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Silakan upload foto sebagai bukti penyelesaian sebelum menandai laporan sebagai <strong>Done</strong>.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Pilih Foto</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Keterangan Penyelesaian (Opsional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={tempKeterangan}
              onChange={(e) => setTempKeterangan(e.target.value)}
             
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