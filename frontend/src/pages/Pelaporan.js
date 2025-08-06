import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
  const [successMessage, setSuccessMessage] = useState("");
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
    setSuccessMessage("");
    
    // Reset file input elements
    const fileSuratInput = document.getElementById('formFileSurat');
    const fotoInput = document.getElementById('formFoto');
    if (fileSuratInput) fileSuratInput.value = '';
    if (fotoInput) fotoInput.value = '';
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.nama.trim()) errors.push("Nama harus diisi");
    if (!form.alamat.trim()) errors.push("Alamat harus diisi");
    if (!form.noHp.trim()) errors.push("Nomor telepon harus diisi");
    if (!form.noWhatsapp.trim()) errors.push("Nomor WhatsApp harus diisi");
    if (!form.permintaan) errors.push("Permintaan harus dipilih");
    if (!form.detailPermintaan.trim()) errors.push("Detail permintaan harus diisi");
    if (!form.lokasi.trim()) errors.push("Lokasi harus diisi");
    if (!form.fileSurat) errors.push("Surat pengajuan harus diupload");
    
    // Validasi format nomor telepon
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (form.noHp && !phoneRegex.test(form.noHp.replace(/\s+/g, ''))) {
      errors.push("Format nomor telepon tidak valid");
    }
    if (form.noWhatsapp && !phoneRegex.test(form.noWhatsapp.replace(/\s+/g, ''))) {
      errors.push("Format nomor WhatsApp tidak valid");
    }
    
    // Validasi file PDF
    if (form.fileSurat && form.fileSurat.type !== 'application/pdf') {
      errors.push("Surat pengajuan harus berupa file PDF");
    }
    
    // Validasi file gambar
    if (form.foto) {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedImageTypes.includes(form.foto.type)) {
        errors.push("Foto harus berupa file gambar (JPG, JPEG, PNG)");
      }
      
      // Validasi ukuran file (max 5MB untuk gambar)
      if (form.foto.size > 5 * 1024 * 1024) {
        errors.push("Ukuran foto maksimal 5MB");
      }
    }
    
    // Validasi ukuran file PDF (max 10MB)
    if (form.fileSurat && form.fileSurat.size > 10 * 1024 * 1024) {
      errors.push("Ukuran file surat maksimal 10MB");
    }
    
    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const formElement = event.currentTarget;
    setValidated(true);
    
    // Validasi custom
    const validationErrors = validateForm();
    
    if (formElement.checkValidity() === false || validationErrors.length > 0) {
      if (validationErrors.length > 0) {
        setErrorMessage(validationErrors.join(". "));
      }
      return;
    }
    
    setErrorMessage("");
    handleShowConfirm();
  };

  // Replace your handleConfirmSubmit function with this improved version

const handleConfirmSubmit = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    setErrorMessage("Anda harus login terlebih dahulu");
    handleCloseConfirm();
    return;
  }
  
  let decoded;
  try {
    decoded = jwtDecode(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      setErrorMessage("Session telah berakhir. Silakan login kembali.");
      localStorage.removeItem("token");
      handleCloseConfirm();
      return;
    }
  } catch (err) {
    console.error("Token tidak valid", err);
    setErrorMessage("Token tidak valid. Silakan login kembali.");
    localStorage.removeItem("token");
    handleCloseConfirm();
    return;
  }
  
  setLoading(true);
  setErrorMessage("");
  
  try {
    // Check if API URL is configured
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      throw new Error("API URL tidak ditemukan. Pastikan REACT_APP_API_URL sudah diset di file .env");
    }

    console.log("API URL:", apiUrl);
    console.log("Endpoint:", `${apiUrl}/api/submit`);

    const formattedNoWhatsapp = formatWhatsappNumber(form.noWhatsapp);
    const formData = new FormData();
    
    // Append all form fields to FormData
    formData.append('nama', form.nama.trim());
    formData.append('alamat', form.alamat.trim());
    formData.append('noHp', form.noHp.trim());
    formData.append('noWhatsapp', formattedNoWhatsapp);
    formData.append('permintaan', form.permintaan);
    formData.append('detailPermintaan', form.detailPermintaan.trim());
    formData.append('lokasi', form.lokasi.trim());
    
    if (form.fileSurat) {
      formData.append('fileSurat', form.fileSurat);
    }
    
    if (form.foto) {
      formData.append('foto', form.foto);
    }

    // Log the form data being sent (for debugging)
    console.log("Sending form data:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, `File - ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }
    
    const response = await axios.post(
      `${apiUrl}/api/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000, // 60 seconds timeout
      }
    );

    console.log("Response:", response.data);
    
    // Set success message based on response
    if (response.data.warning) {
      setSuccessMessage(`${response.data.message}. ${response.data.warning}`);
    } else {
      setSuccessMessage(response.data.message || "Laporan berhasil dikirim dan email notifikasi telah dikirim!");
    }

    handleCloseConfirm();
    handleShowSuccess();

    // Reset form after success
    setTimeout(() => {
      resetForm();
    }, 1000);

  } catch (error) {
    console.error("Error submitting form:", error);
    
    let errorMsg = "Terjadi kesalahan saat mengirim laporan.";
    
    // Handle different types of errors
    if (error.code === 'ERR_NETWORK') {
      errorMsg = "Tidak dapat terhubung ke server. Pastikan server backend berjalan di port 5000 dan periksa koneksi internet Anda.";
      console.error("Network Error - Server mungkin tidak berjalan atau CORS tidak dikonfigurasi dengan benar");
    } else if (error.code === 'ECONNABORTED') {
      errorMsg = "Request timeout. File terlalu besar atau koneksi lambat.";
    } else if (error.response) {
      // Server responded with error status
      console.error("Server Error Response:", error.response.data);
      
      switch (error.response.status) {
        case 401:
          errorMsg = "Session telah berakhir. Silakan login kembali.";
          localStorage.removeItem("token");
          break;
        case 413:
          errorMsg = "File terlalu besar. Maksimal 10MB untuk PDF dan 5MB untuk gambar.";
          break;
        case 400:
          errorMsg = error.response.data?.error || "Data yang dikirim tidak valid.";
          break;
        case 500:
          errorMsg = error.response.data?.error || "Terjadi kesalahan di server.";
          break;
        default:
          errorMsg = error.response.data?.error || 
                    error.response.data?.message || 
                    `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMsg = "Server tidak merespons. Periksa apakah server backend berjalan.";
      console.error("No response received:", error.request);
    } else if (error.message) {
      // Something else happened
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
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {errorMessage}
                    </div>
                  )}
                  
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    
                    <Form.Group className="mb-4" controlId="formNama">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Nama Lengkap <span className="text-danger">*</span>
                      </Form.Label>
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

                    <Form.Group className="mb-4" controlId="formAlamat">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Alamat <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Masukkan alamat lengkap"
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

                    <Form.Group className="mb-4" controlId="formNoHp">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Nomor Telepon <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        placeholder="08xxxxxxxx atau 62xxxxxxxx"
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
                        Nomor telepon harus diisi dengan format yang benar.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formNoWhatsapp">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Nomor WhatsApp <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        placeholder="08xxxxxxxx atau 62xxxxxxxx"
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
                        Nomor WhatsApp harus diisi dengan format yang benar.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formPermintaan">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Permintaan <span className="text-danger">*</span>
                      </Form.Label>
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
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Detail Permintaan <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        as="textarea"
                        rows={4}
                        placeholder="Jelaskan detail permintaan Anda secara lengkap"
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
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Lokasi <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="text"
                        placeholder="Masukkan lokasi spesifik pengadaan/perbaikan"
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
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Surat Pengajuan <span className="text-danger">*</span>
                      </Form.Label>
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
                        File surat pengajuan harus berupa PDF (maksimal 10MB).
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Format: PDF, Maksimal: 10MB
                      </Form.Text>
                      {form.fileSurat && (
                        <div className="mt-2">
                          <small className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            File terpilih: {form.fileSurat.name} ({(form.fileSurat.size / 1024 / 1024).toFixed(2)} MB)
                          </small>
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-5" controlId="formFoto">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#2c3e50' }}>
                        Foto Lokasi <span className="text-muted">(Opsional)</span>
                      </Form.Label>
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
                        Foto harus berupa file gambar (JPG, JPEG, PNG, maksimal 5MB).
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Format: JPG, JPEG, PNG, Maksimal: 5MB
                      </Form.Text>
                      {form.foto && (
                        <div className="mt-2">
                          <small className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            File terpilih: {form.foto.name} ({(form.foto.size / 1024 / 1024).toFixed(2)} MB)
                          </small>
                        </div>
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
                          backgroundColor: loading ? '#6c757d' : '#2F5D9F',
                          borderColor: loading ? '#6c757d' : '#2F5D9F',
                          color: '#ffffff',
                          fontSize: '16px'
                        }}
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Kirim Laporan
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        <span className="text-danger">*</span> Field wajib diisi
                      </small>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Modal Konfirmasi */}
      <Modal show={showConfirm} onHide={handleCloseConfirm} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-question-circle text-warning me-2"></i>
            Konfirmasi Pengiriman
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah Anda yakin ingin mengirim pelaporan ini?</p>
          <div className="bg-light p-3 rounded">
            <small className="text-muted">
              <strong>Catatan:</strong> Setelah dikirim, laporan akan masuk ke sistem dan Anda akan menerima email konfirmasi.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirm} disabled={loading}>
            <i className="fas fa-times me-2"></i>
            Batal
          </Button>
          <Button variant="primary" onClick={handleConfirmSubmit} disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Mengirim...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Ya, Kirim
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Success */}
      <Modal show={showSuccess} onHide={handleCloseSuccess} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-check-circle text-success me-2"></i>
            Pengiriman Berhasil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 mb-3">Laporan Berhasil Dikirim!</h5>
            <p className="mb-3">
              {successMessage || "Pelaporan Anda telah berhasil dikirim dan email konfirmasi telah dikirim ke email Anda."}
            </p>
            <div className="bg-light p-3 rounded">
              <small className="text-muted">
                <strong>Langkah selanjutnya:</strong><br/>
                • Cek email Anda untuk konfirmasi<br/>
                • Tim akan memverifikasi laporan Anda<br/>
                • Anda akan mendapat update via email
              </small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseSuccess} className="w-100">
            <i className="fas fa-check me-2"></i>
            OK, Mengerti
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Pelaporan;