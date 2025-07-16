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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const resetForm = () => {
    setForm({
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
    setValidated(false);
    setErrorMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (formElement.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Validasi tambahan untuk file
    if (!form.fileSurat) {
      setErrorMessage("Surat pengajuan harus diupload");
      setValidated(true);
      return;
    }

    setErrorMessage("");
    handleShowConfirm();
    setValidated(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      // Validasi environment variable
      if (!process.env.REACT_APP_API_URL) {
        throw new Error("API URL tidak ditemukan. Pastikan REACT_APP_API_URL sudah diset.");
      }

      const formattedNoWhatsapp = formatWhatsappNumber(form.noWhatsapp);
      const formData = new FormData();
      
      // Append semua field form ke FormData
      formData.append('nama', form.nama);
      formData.append('alamat', form.alamat);
      formData.append('noHp', form.noHp);
      formData.append('noWhatsapp', formattedNoWhatsapp);
      formData.append('permintaan', form.permintaan);
      formData.append('detailPermintaan', form.detailPermintaan);
      formData.append('lokasi', form.lokasi);
      
      if (form.fileSurat) {
        formData.append('fileSurat', form.fileSurat);
      }
      
      if (form.foto) {
        formData.append('foto', form.foto);
      }

      console.log("Mengirim data ke:", `${process.env.REACT_APP_API_URL}/api/submit`);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 detik timeout
        }
      );

      console.log("Response:", response.data);
      
      handleCloseConfirm();
      handleShowSuccess();
      
      // Reset form setelah berhasil
      resetForm();

    } catch (error) {
      console.error("Error submitting form:", error);
      
      let errorMsg = "Terjadi kesalahan saat mengirim laporan.";
      
      if (error.response) {
        // Server merespons dengan status error
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request dibuat tapi tidak ada response
        errorMsg = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message) {
        // Error lainnya
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      handleCloseConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainNavbar />
      <div style={{ backgroundColor: '#e9ecef', minHeight: '100vh', paddingTop: '40px', paddingBottom: '40px' }}>
        <Container>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div 
                className="card shadow-sm"
                style={{
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <div className="card-body p-5">
                  <div className="mb-4">
                    <h2 className="fw-bold mb-2" style={{ color: '#2c3e50' }}>Formulir Pelaporan Sumbang</h2>
                    <p className="text-muted mb-0">Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
                  </div>
                  
                  {errorMessage && (
                    <div className="alert alert-danger mb-4" role="alert">
                      {errorMessage}
                    </div>
                  )}
                  
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    
                    <Form.Group className="mb-4" controlId="formNama">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Nama Lengkap</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Cth. Maulana Ibrahim"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        Nama harus diisi.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formNoHp">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Nomor Telepon</Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        placeholder="08xxxxxxxx"
                        value={form.noHp}
                        onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        Nomor telepon harus diisi.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formNoWhatsapp">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Nomor WhatsApp</Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        placeholder="08xxxxxxxx"
                        value={form.noWhatsapp}
                        onChange={(e) => setForm({ ...form, noWhatsapp: e.target.value })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        Nomor WhatsApp harus diisi.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formAlamat">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Alamat</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Masukkan Alamat"
                        value={form.alamat}
                        onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        Alamat harus diisi.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formPermintaan">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Permintaan</Form.Label>
                      <Form.Control
                        as="select"
                        required
                        value={form.permintaan}
                        onChange={(e) => setForm({ ...form, permintaan: e.target.value })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px',
                          color: form.permintaan ? '#2c3e50' : '#6c757d'
                        }}
                      >
                        <option value="" disabled>Pilih jenis permintaan</option>
                        <option value="Pengadaan">Pengadaan</option>
                        <option value="Perbaikan">Perbaikan</option>
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        Permintaan harus dipilih.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formDetailPermintaan">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Detail Permintaan</Form.Label>
                      <Form.Control
                        required
                        as="textarea"
                        rows={4}
                        placeholder="Masukkan Detail Permintaan"
                        value={form.detailPermintaan}
                        onChange={(e) => setForm({ ...form, detailPermintaan: e.target.value })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        Detail permintaan harus diisi.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formLokasi">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Lokasi</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Masukkan Lokasi Pengadaan/Perbaikan"
                        value={form.lokasi}
                        onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        Lokasi harus diisi.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formFileSurat">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Surat Pengajuan</Form.Label>
                      <Form.Control
                        required
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setForm({ ...form, fileSurat: e.target.files[0] })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        File surat pengajuan harus berupa PDF.
                      </Form.Control.Feedback>
                      {form.fileSurat && (
                        <small className="text-muted">File terpilih: {form.fileSurat.name}</small>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-5" controlId="formFoto">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>Foto Lokasi (Opsional)</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          padding: '12px 16px',
                          fontSize: '16px'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        Foto harus berupa file gambar (jpg, jpeg, png).
                      </Form.Control.Feedback>
                      {form.foto && (
                        <small className="text-muted">File terpilih: {form.foto.name}</small>
                      )}
                    </Form.Group>

                    <div className="d-grid">
                      <Button 
                        type="submit" 
                        size="lg"
                        disabled={loading}
                        style={{
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontWeight: '600',
                          backgroundColor: loading ? '#6c757d' : '#95a5a6',
                          borderColor: loading ? '#6c757d' : '#95a5a6',
                          color: '#ffffff',
                          fontSize: '16px'
                        }}
                      >
                        {loading ? 'Mengirim...' : 'Kirim'}
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Modal show={showConfirm} onHide={handleCloseConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Pengiriman</Modal.Title>
        </Modal.Header>
        <Modal.Body>Apakah Anda yakin ingin mengirim pelaporan ini?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirm} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleConfirmSubmit} disabled={loading}>
            {loading ? 'Mengirim...' : 'Ya, Kirim'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSuccess} onHide={handleCloseSuccess}>
        <Modal.Header closeButton>
          <Modal.Title>Pengiriman Berhasil</Modal.Title>
        </Modal.Header>
        <Modal.Body>Pelaporan Anda telah berhasil dikirim. Terima kasih!</Modal.Body>
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