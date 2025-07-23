import React, { useEffect, useState } from "react";
import { Container, Table, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";
import "../css/pages/RiwayatLaporan.css";

const RiwayatLaporan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [laporanData, setLaporanData] = useState(null);
  const [riwayatData, setRiwayatData] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("");

  // Status steps
  const statusSteps = [
    { key: "verifikasi", label: "Verifikasi", color: "#ffc107" },
    { key: "approved", label: "Approved", color: "#28a745" },
    { key: "rejected", label: "Rejected", color: "#dc3545" },
    { key: "on_hold", label: "On Hold", color: "#6c757d" },
    { key: "on_process", label: "On Process", color: "#17a2b8" },
    { key: "done", label: "Done", color: "#28a745" }
  ];

  // Format tanggal
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

  // Get status index
  const getStatusIndex = (status) => {
    return statusSteps.findIndex(step => 
      step.key.toLowerCase() === status.toLowerCase().replace(" ", "_")
    );
  };

  // Check if status is completed
  const isStatusCompleted = (stepIndex, currentStatusIndex) => {
    if (currentStatus.toLowerCase() === "rejected") {
      return stepIndex <= 2; // Only show verifikasi, approved, rejected as completed
    }
    return stepIndex <= currentStatusIndex;
  };

  // Check if status is active
  const isStatusActive = (stepIndex, currentStatusIndex) => {
    return stepIndex === currentStatusIndex;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch laporan detail
        const laporanResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/verifikasi/data${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch riwayat perubahan status
        const riwayatResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/verifikasi/data${id}/riwayat`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLaporanData(laporanResponse.data);
        setRiwayatData(riwayatResponse.data);
        setCurrentStatus(laporanResponse.data.status || "verifikasi");
        
      } catch (error) {
        setError(
          error.response?.data?.error || "Gagal memuat data riwayat laporan"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <>
      <MainNavbar />
      <div
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Container>
          <div className="row justify-content-center">
            <div className="col-12">
              {/* Header Card */}
              <Card className="shadow-sm mb-4" style={{ borderRadius: "12px", border: "none" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="mb-1" style={{ color: "#2c3e50" }}>
                        Riwayat Laporan #{id}
                      </h3>
                      <p className="text-muted mb-0">
                        {laporanData?.nama} - {laporanData?.permintaan}
                      </p>
                    </div>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(-1)}
                      style={{ borderRadius: "8px" }}
                    >
                      ← Kembali
                    </button>
                  </div>
                </Card.Body>
              </Card>

              {/* Progress Tracker */}
              <Card className="shadow-sm mb-4" style={{ borderRadius: "12px", border: "none" }}>
                <Card.Body className="p-5">
                  <h5 className="text-center mb-4" style={{ color: "#2c3e50" }}>
                    Progress Status Laporan
                  </h5>
                  
                  <div className="progress-container">
                    <div className="progress-steps d-flex justify-content-between align-items-center position-relative">
                      {/* Progress Line */}
                      <div 
                        className="progress-line"
                        style={{
                          position: "absolute",
                          top: "20px",
                          left: "0",
                          right: "0",
                          height: "3px",
                          backgroundColor: "#e9ecef",
                          zIndex: 1
                        }}
                      >
                        <div
                          className="progress-fill"
                          style={{
                            height: "100%",
                            backgroundColor: "#28a745",
                            width: currentStatus.toLowerCase() === "rejected" 
                              ? "33.33%" 
                              : `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                            transition: "width 0.3s ease"
                          }}
                        />
                      </div>

                      {statusSteps.map((step, index) => {
                        const isCompleted = isStatusCompleted(index, currentStatusIndex);
                        const isActive = isStatusActive(index, currentStatusIndex);
                        const isRejectedPath = currentStatus.toLowerCase() === "rejected";
                        
                        // Skip some steps if rejected
                        if (isRejectedPath && index > 2 && index < 5) {
                          return null;
                        }

                        return (
                          <div
                            key={step.key}
                            className="progress-step d-flex flex-column align-items-center"
                            style={{ position: "relative", zIndex: 2 }}
                          >
                            <div
                              className={`progress-circle d-flex align-items-center justify-content-center`}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: isCompleted || isActive ? step.color : "#e9ecef",
                                color: isCompleted || isActive ? "white" : "#6c757d",
                                fontWeight: "bold",
                                fontSize: "14px",
                                border: isActive ? `3px solid ${step.color}` : "none",
                                boxShadow: isActive ? `0 0 0 3px ${step.color}33` : "none",
                                transition: "all 0.3s ease"
                              }}
                            >
                              {isCompleted ? "✓" : index + 1}
                            </div>
                            <span
                              className="mt-2 text-center"
                              style={{
                                fontSize: "12px",
                                fontWeight: isActive ? "bold" : "normal",
                                color: isActive ? step.color : "#6c757d",
                                maxWidth: "80px"
                              }}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Riwayat Table */}
              <Card className="shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
                <Card.Body className="p-4">
                  <h5 className="mb-4" style={{ color: "#2c3e50" }}>
                    Riwayat Perubahan Status
                  </h5>
                  
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
                                <span
                                  className="badge rounded-pill"
                                  style={{
                                    backgroundColor: "#e9ecef",
                                    color: "#495057",
                                    fontSize: "12px"
                                  }}
                                >
                                  {index + 1}
                                </span>
                              </td>
                              <td className="align-middle">
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: statusSteps.find(s => 
                                      s.key.toLowerCase() === item.status?.toLowerCase().replace(" ", "_")
                                    )?.color || "#6c757d",
                                    color: "white",
                                    fontSize: "12px",
                                    padding: "6px 12px",
                                    borderRadius: "20px"
                                  }}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="align-middle">
                                {formatDate(item.tanggal_diubah)}
                              </td>
                              <td className="align-middle">
                                {item.diubah_oleh || "Sistem"}
                              </td>
                              <td className="align-middle">
                                <span className="text-muted">
                                  {item.keterangan || "Tidak ada keterangan"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-4">
                              Belum ada riwayat perubahan status
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default RiwayatLaporan;