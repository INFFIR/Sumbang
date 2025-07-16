import React, { useEffect, useState } from "react";
import { Container, Table, Card, Form } from "react-bootstrap";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";
import "../css/pages/Verifikasi.css";

const Verifikasi = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Helper function untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Helper function untuk mendapatkan tanggal relatif (opsional)
  const getRelativeDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Hari ini";
      if (diffDays === 1) return "Kemarin";
      if (diffDays <= 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString('id-ID');
    } catch (error) {
      return "";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/verifikasi/data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Process data untuk memastikan tanggal ter-format dengan benar
        const processedData = response.data.map(item => ({
          ...item,
          // Gunakan tanggal dari backend, atau created_at, atau tanggal saat ini sebagai fallback
          tanggal: item.tanggal || item.created_at || item.date || new Date().toISOString()
        }));
        
        setData(processedData);
        setFilteredData(processedData);
      } catch (error) {
        setError(
          error.response?.data?.error || "Silahkan Login Terlebih Dahulu"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let results = data;
    
    // Filter berdasarkan status
    if (statusFilter !== "all") {
      results = results.filter(item => 
        item.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Filter berdasarkan search query (fokus pada nama lengkap)
    if (searchQuery) {
      results = results.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.permintaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDate(item.tanggal).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredData(results);
  }, [searchQuery, statusFilter, data]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Helper function untuk mendapatkan jumlah per status
  const getStatusCount = (status) => {
    if (status === "all") return data.length;
    return data.filter(item => item.status.toLowerCase() === status.toLowerCase()).length;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Rejected":
        return "status-rejected";
      case "Approved":
        return "status-approved";
      case "On Hold":
        return "status-on-hold";
      case "On Process":
        return "status-on-process";
      case "Done":
        return "status-done";
      case "Verifikasi":
        return "status-verifikasi";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Rejected":
        return "🔴";
      case "Approved":
        return "🟢";
      case "On Hold":
        return "🟡";
      case "On Process":
        return "🔵";
      case "Done":
        return "✅";
      case "Verifikasi":
        return "⏳";
      default:
        return "🟡";
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <MainNavbar />
      <div style={{ backgroundColor: '#e9ecef', minHeight: '100vh', paddingTop: '40px', paddingBottom: '40px' }}>
        <Container>
          <div className="row justify-content-center">
            <div className="col-12">
              <div 
                className="card shadow-sm"
                style={{
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <div className="card-body p-5">
                  {/* Header Section */}
                  <div className="header-section mb-4">
                    <h2 className="page-title" style={{ color: '#2c3e50' }}>Aktivitas Laporan Sumbang</h2>
                    <p className="page-subtitle text-muted">Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
                  </div>

                  {/* Search and Filter Section */}
                    <div className="search-filter-section mb-4">
                      <div className="row g-3">
                        <div className="col-md-8">
                          <Form.Control
                            type="text"
                            placeholder="Cari nama lengkap, permintaan, lokasi, atau tanggal..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #dee2e6',
                              padding: '12px 16px',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        <div className="col-md-4">
                          <Form.Select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #dee2e6',
                              padding: '12px 16px',
                              fontSize: '16px'
                            }}
                          >
                            <option value="all">Semua Status ({getStatusCount("all")})</option>
                            <option value="verifikasi">Verifikasi ({getStatusCount("verifikasi")})</option>
                            <option value="approved">Disetujui ({getStatusCount("approved")})</option>
                            <option value="rejected">Ditolak ({getStatusCount("rejected")})</option>
                            <option value="on process">Dalam Proses ({getStatusCount("on process")})</option>
                            <option value="on hold">Ditahan ({getStatusCount("on hold")})</option>
                            <option value="done">Selesai ({getStatusCount("done")})</option>
                          </Form.Select>
                        </div>
                      </div>
                    </div>


                  {/* Table Section */}
                  <div className="table-container">
                    <Table className="custom-table">
                      <thead>
                        <tr>
                          <th className="col-no">No.</th>
                          <th className="col-nama">Nama Lengkap</th>
                          <th className="col-permintaan">Permintaan</th>
                          <th className="col-lokasi">Lokasi</th>
                          <th className="col-tanggal">Tanggal</th>
                          <th className="col-status">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((item) => (
                            <tr key={item.id}>
                              <td className="col-no">{item.id}</td>
                              <td className="col-nama">{item.nama}</td>
                              <td className="col-permintaan">{item.permintaan}</td>
                              <td className="col-lokasi">{item.lokasi}</td>
                              <td className="col-tanggal">
                                {item.tanggal ? (
                                  <div>
                                    
                                    <span className="date-text">{formatDate(item.tanggal)}</span>
                                    <br />
                                    <small className="text-muted">
                                      {getRelativeDate(item.tanggal)}
                                    </small>
                                  </div>
                                ) : (
                                  <span></span>
                                )}
                              </td>
                              <td className="col-status">
                                {item.status && (
                                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                                    <span className="status-icon">{getStatusIcon(item.status)}</span>
                                    {item.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-5">
                              <div>
                                <i className="fas fa-search mb-2" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                                <h5 className="mb-2">
                                  {searchQuery && statusFilter !== "all" 
                                    ? `Tidak ada data "${searchQuery}" dengan status "${statusFilter}"`
                                    : searchQuery 
                                    ? `Tidak ada data yang sesuai dengan pencarian "${searchQuery}"`
                                    : statusFilter !== "all"
                                    ? `Tidak ada laporan dengan status "${statusFilter}"`
                                    : "Tidak ada data laporan"
                                  }
                                </h5>
                                <p className="mb-0">
                                  {searchQuery || statusFilter !== "all" 
                                    ? "Coba ubah filter atau kata kunci pencarian"
                                    : "Belum ada laporan yang masuk"
                                  }
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                    
                      </tbody>
                    </Table>
                  </div>
                  
                  {/* Summary Section */}
                  <div className="summary-section mt-4">
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted">
                          Menampilkan {filteredData.length} dari {data.length} laporan
                          {statusFilter !== "all" && ` (filter: ${statusFilter})`}
                          {searchQuery && ` (pencarian: "${searchQuery}")`}
                        </small>
                      </div>
                      <div className="col-md-6 text-end">
                        {(searchQuery || statusFilter !== "all") && (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                            }}
                            style={{ borderRadius: '20px' }}
                          >
                            Reset Filter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Verifikasi;