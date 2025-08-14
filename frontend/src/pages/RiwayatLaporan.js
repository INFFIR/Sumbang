import React, { useEffect, useState } from "react";
import { Container, Table, Card, Alert, Spinner, Button, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import axios from "axios";
import "../css/pages/RiwayatLaporan.css";

const RiwayatLaporan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");

  const statusSteps = [
    { key: "verifikasi", label: "Verifikasi", color: "#ffc107" },
    { key: "persetujuan", label: "Persetujuan", color: "#28a745" },
    { key: "pengerjaan", label: "Pengerjaan", color: "#17a2b8" },
    { key: "selesai", label: "Selesai", color: "#4669deff" }
  ];


  const statusColors = {
    approved: "#2ecc71",
    rejected: "#dc3545",
    on_hold: "#6c757d",
    on_process: "#17a2b8",
    done: "#1347f3ff",
    verifikasi: "#ffc107"
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

const getStatusColor = (stepKey) => {
  const stepIndex = statusSteps.findIndex(s => s.key === stepKey);
  const currentStepKey = mapStatusToStepKey(currentStatus); // dari fungsi sebelumnya
  const currentIndex = statusSteps.findIndex(s => s.key === currentStepKey);

  if (stepKey === "persetujuan" && currentStatus.toLowerCase() === "rejected") {
    return "#dc3545"; // merah untuk ditolak
  }

  if (stepIndex < currentIndex) {
  return statusSteps[stepIndex]?.color || "#1347f3ff";
}

  if (stepIndex === currentIndex) {
    // Warna khusus per step jika aktif
    switch (stepKey) {
      case "verifikasi": return "#ffc107";
      case "persetujuan": return "#28a745";
      case "pengerjaan": return "#17a2b8";
      case "selesai": return "#4669deff";
      default: return "#6c757d";
    }
  }

  return "#e9ecef"; // step belum dicapai
};



  const getStatusIndex = (status) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
    return statusSteps.findIndex(
      step => step.key.toLowerCase() === normalizedStatus
    );
  };

  const isStatusCompleted = (stepIndex, currentStatusIndex) => {
    if (currentStatus.toLowerCase() === "rejected") {
      return stepIndex <= 1; // Hanya verifikasi dan persetujuan yang completed untuk rejected
    }
    
    // Jika current status adalah verifikasi, hanya step 0 (verifikasi) yang completed
    if (currentStatus.toLowerCase() === "verifikasi") {
      return stepIndex === 0;
    }
    
    return stepIndex <= currentStatusIndex;
  };

  // Fungsi untuk menentukan apakah step ini rejected
  const isStatusRejected = (stepKey) => {
    if (stepKey === "persetujuan" && currentStatus.toLowerCase() === "rejected") {
      return true;
    }
    return false;
  };
const mapStatusToStepKey = (status) => {
  if (!status) return "verifikasi";
  const s = status.toLowerCase().replace(/\s+/g, "_");
  if (["verifikasi"].includes(s)) return "verifikasi";
  if (["approved", "rejected"].includes(s)) return "persetujuan";
  if (["on_process", "on_hold"].includes(s)) return "pengerjaan";
  if (["done"].includes(s)) return "selesai";
  return "verifikasi";
};

  // Fungsi untuk mendapatkan ikon yang tepat untuk setiap step
const getStepIcon = (stepKey) => {
  const currentStepKey = mapStatusToStepKey(currentStatus);

  if (stepKey === "persetujuan" && currentStatus.toLowerCase() === "rejected") {
    return <FaTimes color="white" size={24} />;
  } 
  if (stepKey === currentStepKey) {
    return <FaCheckCircle color="white" size={24} />;
  }
  const stepIndex = statusSteps.findIndex(s => s.key === stepKey);
  const currentIndex = statusSteps.findIndex(s => s.key === currentStepKey);
  if (stepIndex < currentIndex) {
    return <FaCheckCircle color="white" size={24} />; // step sebelumnya selesai
  }
  return stepIndex + 1; // step selanjutnya belum selesai, tampil angka
};

  // Function to convert base64 image to displayable URL
  const getImageUrl = (base64) => {
    return base64 ? `data:image/jpeg;base64,${base64}` : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch detail laporan
        console.log("📡 Fetching detail from:", `${process.env.REACT_APP_API_URL}/api/detail-riwayat/${id}`);
        const detailResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/detail-riwayat/${id}`,
        );
        console.log("✅ Detail response:", detailResponse.data);
        setDetail(detailResponse.data);
        setCurrentStatus(detailResponse.data.status || "verifikasi");

        // Fetch history laporan
        console.log("📡 Fetching history from:", `${process.env.REACT_APP_API_URL}/api/history/${id}`);
        const historyResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/history/${id}`,
        );
        console.log("✅ History response:", historyResponse.data);
        setHistory(historyResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <MainNavbar />
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
          <Container>
            <div className="text-center mt-5">
              <Spinner animation="border" role="status" />
              <p className="mt-3">Memuat data...</p>
            </div>
          </Container>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainNavbar />
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
          <Container>
            <Alert variant="danger" className="mt-5">
              <Alert.Heading>Error!</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={() => navigate("/verifikasi")}>
                Kembali ke Verifikasi
              </Button>
            </Alert>
          </Container>
        </div>
      </>
    );
  }

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <>
      <MainNavbar />
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
        <Container>
          {/* Header Card */}
          <Card className="shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1" style={{ color: "#2c3e50" }}>Riwayat Laporan #{id}</h3>
                  <p className="text-muted mb-0">{detail?.nama} - {detail?.permintaan}</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/verifikasi")}>
                  ← Kembali
                </button>
              </div>
            </Card.Body>
          </Card>

          {/* Progress Status Card */}
          <Card className="shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-5">
              <h5 className="text-center mb-4" style={{ color: "#2c3e50" }}>Progress Status Laporan</h5>
              <Row className="justify-content-center">
                {statusSteps.map((step, index) => {
                  const isCompleted = isStatusCompleted(index, currentStatusIndex);
                  const isRejected = isStatusRejected(step.key);

                  return (
                    <Col key={step.key} xs={3} className="text-center">
                      <div
                        style={{
                          borderRadius: "50%",
                          width: 50,
                          height: 50,
                          margin: "auto",
                          backgroundColor: isRejected ? "#dc3545" : getStatusColor(step.key),
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: isCompleted || isRejected ? "white" : "#666",
                          fontWeight: "bold",
                          fontSize: "16px"
                        }}
                      >
                        {getStepIcon(step.key, index, currentStatusIndex)}
                      </div>
                      <p className="mt-2" style={{ 
                        color: isRejected ? "#dc3545" : "#2c3e50",
                        fontWeight: isRejected ? "bold" : "normal"
                      }}>
                        {step.label}
                        {isRejected && (
                          <>
                            <br />
                            <small style={{ color: "#dc3545" }}>(Ditolak)</small>
                          </>
                        )}
                      </p>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>

          {/* Display completion photo if status is Done and photo exists */}
          {detail?.status?.toLowerCase() === 'done' && detail?.foto_selesai && (
            <Card className="shadow-sm mb-4" style={{ borderRadius: "12px" }}>
              <Card.Body className="p-4">
                <h5 className="mb-4" style={{ color: "#2c3e50" }}>Foto Penyelesaian</h5>
                <div className="text-center">
                  <img
                    src={getImageUrl(detail.foto_selesai)}
                    alt="Foto Penyelesaian"
                    className="img-fluid rounded shadow"
                    style={{ 
                      maxHeight: "400px", 
                      objectFit: "contain",
                      border: "2px solid #e9ecef"
                    }}
                  />
                  <p className="text-muted mt-2 mb-0">
                    <small>Foto bukti penyelesaian pekerjaan</small>
                  </p>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Detail Laporan */}
          {detail && (
            <Card className="shadow-sm mb-4" style={{ borderRadius: "12px" }}>
              <Card.Body className="p-4">
                <h5 className="mb-4" style={{ color: "#2c3e50" }}>Detail Laporan</h5>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Nama Lengkap:</strong>
                      <p className="mb-1 text-muted">{detail.nama}</p>
                    </div>
                   <div className="mb-3">
                      <strong>Lokasi:</strong>
                      <p className="mb-1 text-muted">{detail.lokasi}</p>
                    </div>
                                        <div className="mb-3">
                      <strong>Status Saat Ini:</strong>
                      <br />
                      <span 
                        className="badge text-white mt-1" 
                        style={{ backgroundColor: statusColors[detail.status?.toLowerCase().replace(/\s+/g, "_")] || "#6c757d" }}
                      >
                        {detail.status}
                      </span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Permintaan:</strong>
                      <p className="mb-1 text-muted">{detail.permintaan}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Detail Permintaan:</strong>
                      <p className="mb-1 text-muted">{detail.detail_permintaan}</p>
                    </div>

                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Riwayat Perubahan */}
          <Card className="shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <h5 className="mb-4" style={{ color: "#2c3e50" }}>
                Riwayat Perubahan ({history.length})
              </h5>
              <div className="table-responsive">
                <Table className="table-hover">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th className="border-0" style={{ width: "120px" }}>Status</th>
                      <th className="border-0" style={{ width: "180px" }}>Tanggal</th>
                      <th className="border-0" style={{ width: "140px" }}>Diubah Oleh</th>
                      <th className="border-0">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? (
                      history.map((item, index) => (
                        <tr key={item.id} className={index === 0 ? "table-light" : ""}>
                          <td className="align-middle">
                            {item.status && (
                              <span 
                                className="badge text-white" 
                                style={{ backgroundColor: statusColors[item.status?.toLowerCase().replace(/\s+/g, "_")] || "#6c757d" }}
                              >
                                {item.status}
                              </span>
                            )}
                          </td>
                          <td className="align-middle">
                            <small className="text-muted">
                              {formatDate(item.updated_at)}
                            </small>
                          </td>
                          <td className="align-middle">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-user-circle me-2 text-primary"></i>
                              <strong style={{ color: "#2c3e50", fontSize: "14px" }}>
                                {item.updated_by || "System"}
                              </strong>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                              {item.keterangan || (
                                <em className="text-muted">Tidak ada keterangan</em>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          <i className="fas fa-inbox fa-2x mb-3"></i>
                          <br />
                          Belum ada perubahan yang tercatat untuk laporan ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default RiwayatLaporan;