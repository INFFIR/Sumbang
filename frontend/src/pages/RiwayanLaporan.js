import React, { useEffect, useState } from "react";
import { Container, Table, Card, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import axios from "axios";
import "../css/pages/RiwayatLaporan.css";

const RiwayatLaporanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [laporanData, setLaporanData] = useState(null);
  const [riwayatData, setRiwayatData] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("");

  const statusSteps = [
    { key: "verifikasi", label: "Verifikasi", color: "#ffc107" },
    { key: "persetujuan", label: "Persetujuan", color: "#28a745" },
    { key: "pengerjaan", label: "Pengerjaan", color: "#17a2b8" },
    { key: "selesai", label: "Selesai", color: "	#4669deff" }
  ];

  const stepStatusMap = {
    verifikasi: ["verifikasi"],
    persetujuan: ["approved", "rejected"],
    pengerjaan: ["on_process", "on_hold"],
    selesai: ["done"]
  };

  const statusColors = {
    approved: "	#2ecc71",
    rejected: "#dc3545",
    on_hold: "#6c757d",
    on_process: "#17a2b8",
    done: "	#1347f3ff",
    verifikasi: "#ffc107"
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
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
    const relatedStatuses = stepStatusMap[stepKey] || [];
    const matchingStatus = riwayatData
      .slice()
      .reverse()
      .find((r) => relatedStatuses.includes(r.status.toLowerCase().replace(/ /g, "_")));
    if (!matchingStatus) return "#e9ecef";
    const normalized = matchingStatus.status.toLowerCase().replace(/ /g, "_");
    return statusColors[normalized] || "#28a745";
  };

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(
      step => step.key.toLowerCase() === status.toLowerCase().replace(" ", "_")
    );
  };

  const isStatusCompleted = (stepIndex, currentStatusIndex) => {
    if (currentStatus.toLowerCase() === "rejected") {
      return stepIndex <= 1; // Hanya verifikasi dan persetujuan yang completed untuk rejected
    }
    return stepIndex <= currentStatusIndex;
  };

  const isStatusActive = (stepIndex, currentStatusIndex) => {
    if (currentStatus.toLowerCase() === "rejected") {
      return false; // Tidak ada yang aktif jika rejected
    }
    return stepIndex === currentStatusIndex;
  };

  // Fungsi untuk menentukan apakah step ini rejected
  const isStatusRejected = (stepKey) => {
    if (stepKey === "persetujuan" && currentStatus.toLowerCase() === "rejected") {
      return true;
    }
    return false;
  };

  // Fungsi untuk mendapatkan ikon yang tepat untuk setiap step
  const getStepIcon = (stepKey, stepIndex, currentStatusIndex) => {
    const isCompleted = isStatusCompleted(stepIndex, currentStatusIndex);
    const isRejected = isStatusRejected(stepKey);

    if (isRejected) {
      return <FaTimes color="white" size={24} />;
    } else if (isCompleted) {
      return <FaCheckCircle color="white" size={24} />;
    } else {
      return stepIndex + 1;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const laporanResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/laporan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const riwayatResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/laporan/${id}/riwayat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLaporanData(laporanResponse.data);
        setRiwayatData(riwayatResponse.data);
        setCurrentStatus(laporanResponse.data.status || "verifikasi");
      } catch (error) {
        setError(error.response?.data?.error || "Gagal memuat data riwayat laporan");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <>
      <MainNavbar />
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
        <Container>
          <Card className="shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1" style={{ color: "#2c3e50" }}>Riwayat Laporan #{id}</h3>
                  <p className="text-muted mb-0">{laporanData?.nama} - {laporanData?.permintaan}</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>← Kembali</button>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-5">
              <h5 className="text-center mb-4" style={{ color: "#2c3e50" }}>Progress Status Laporan</h5>
              <Row className="justify-content-center">
                {statusSteps.map((step, index) => {
                  const isCompleted = isStatusCompleted(index, currentStatusIndex);
                  const isActive = isStatusActive(index, currentStatusIndex);
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

          <Card className="shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              <h5 className="mb-4" style={{ color: "#2c3e50" }}>Riwayat Perubahan Status</h5>
              <div className="table-responsive">
                <Table className="table-hover">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th className="border-0 text-center" style={{ width: "80px" }}>No</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Tanggal Diubah</th>
                      <th className="border-0">Diubah Oleh</th>
                      <th className="border-0">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatData.length > 0 ? (
                      riwayatData.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center align-middle">
                            <span className="badge rounded-pill bg-light text-dark" style={{ fontSize: "12px" }}>{index + 1}</span>
                          </td>
                          <td className="align-middle">
                            <span className="badge text-white" style={{ backgroundColor: statusColors[item.status.toLowerCase().replace(" ", "_")] || "#6c757d" }}>{item.status}</span>
                          </td>
                          <td className="align-middle">{formatDate(item.tanggal_diubah)}</td>
                          <td className="align-middle">{item.diubah_oleh || "Sistem"}</td>
                          <td className="align-middle text-muted">{item.keterangan || "Tidak ada keterangan"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">Belum ada riwayat perubahan status</td>
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

export default RiwayatLaporanDetail;