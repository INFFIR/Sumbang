import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";

const formatWhatsappNumber = (number) => {
  const cleaned = ("" + number).replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    return `https://wa.me/${cleaned.replace(/^0/, "62")}`;
  }

  if (cleaned.startsWith("62")) {
    return `https://wa.me/${cleaned}`;
  }

  if (cleaned.startsWith("628")) {
    return `https://wa.me/${cleaned}`;
  }

  return `https://wa.me/${cleaned}`;
};

const Pelaporan = () => {
  const [validated, setValidated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    noHp: "",
    noWhatsapp: "",
    permintaan: "",
    detailPermintaan: "",
    lokasi: "",
    fileSurat: null,
    foto: null,
  });

  const handleShowConfirm = () => setShowConfirm(true);
  const handleCloseConfirm = () => setShowConfirm(false);
  const handleShowSuccess = () => setShowSuccess(true);
  const handleCloseSuccess = () => setShowSuccess(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (formElement.checkValidity() === false) {
      event.stopPropagation();
    } else {
      handleShowConfirm();
    }
    setValidated(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const formattedNoWhatsapp = formatWhatsappNumber(form.noWhatsapp);
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "noWhatsapp") {
          formData.append(key, formattedNoWhatsapp);
        } else if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      handleCloseConfirm();
      handleShowSuccess();

      setTimeout(() => {
        window.location.reload();
        window.scrollTo(0, 0);
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <MainNavbar />
      <Container className="mt-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Formulir Pelaporan Sumbang</h2>
          <p className="text-muted">Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
        </div>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formNama">
                <Form.Label>Nama Lengkap</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">
                  Nama harus diisi.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formAlamat">
                <Form.Label>Alamat</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Masukkan alamat"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">
                  Alamat harus diisi.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formNoHp">
                <Form.Label>No HP</Form.Label>
                <Form.Control
                  required
                  type="number"
                  placeholder="Masukkan nomor HP (contoh 08xx...)"
                  min="0"
                  step="1"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">
                  No HP harus diisi dan hanya berupa angka.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formNoWhatsapp">
                <Form.Label>No Whatsapp</Form.Label>
                <Form.Control
                  required
                  type="number"
                  placeholder="Masukkan nomor Whatsapp"
                  value={form.noWhatsapp}
                  onChange={(e) =>
                    setForm({ ...form, noWhatsapp: e.target.value })
                  }
                />
                <Form.Control.Feedback type="invalid">
                  No Whatsapp harus diisi dan hanya berupa angka.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="formPermintaan">
            <Form.Label>Permintaan</Form.Label>
            <Form.Control
              as="select"
              required
              value={form.permintaan}
              onChange={(e) => setForm({ ...form, permintaan: e.target.value })}
            >
              <option value="">Pilih Permintaan</option>
              <option value="Pengadaan">Pengadaan</option>
              <option value="Perbaikan">Perbaikan</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Permintaan harus dipilih.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formDetailPermintaan">
            <Form.Label>Detail Permintaan</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={3}
              placeholder="Masukkan detail permintaan"
              value={form.detailPermintaan}
              onChange={(e) =>
                setForm({ ...form, detailPermintaan: e.target.value })
              }
            />
            <Form.Control.Feedback type="invalid">
              Detail permintaan harus diisi.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formLokasi">
            <Form.Label>Lokasi</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Masukkan alamat lokasi"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
            />
            <Form.Control.Feedback type="invalid">
              Lokasi harus diisi.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formFileSurat">
            <Form.Label>File Surat Pengajuan</Form.Label>
            <Form.Control
              required
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setForm({ ...form, fileSurat: e.target.files[0] })
              }
            />
            <Form.Control.Feedback type="invalid">
              File surat pengajuan harus berupa PDF.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formFoto">
            <Form.Label>Foto</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
            />
            <Form.Control.Feedback type="invalid">
              Foto harus berupa file gambar (jpg, jpeg, png).
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3">
            Kirim Laporan
          </Button>
        </Form>
      </Container>

      {/* Modal Konfirmasi */}
      <Modal show={showConfirm} onHide={handleCloseConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Pengiriman</Modal.Title>
        </Modal.Header>
        <Modal.Body>Apakah Anda yakin ingin mengirim pelaporan ini?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirm}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleConfirmSubmit}>
            Ya, Kirim
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sukses */}
      <Modal show={showSuccess} onHide={handleCloseSuccess}>
        <Modal.Header closeButton>
          <Modal.Title>Pengiriman Berhasil</Modal.Title>
        </Modal.Header>
        <Modal.Body>Pelaporan Anda telah berhasil dikirim.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseSuccess}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Pelaporan;
