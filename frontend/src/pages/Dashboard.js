//frontend dashboard
import React, { useEffect, useState } from "react";
import { Container, Table, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminNavbar from "../components/adminNavbar";
import UsersAdminNavbar from "../components/usersAdminNavbar";
import { Button } from "react-bootstrap"; 
import axios from "axios";
import "../css/pages/Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 rows per page

  // Helper function untuk format tanggal
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
        second: "2-digit", 
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/userAdmin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserId(response.data.id);
      } catch (error) {
        setError(
          error.response?.data?.error ||
            "Terjadi kesalahan saat mengambil data pengguna"
        );
      }
    };

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Proses data: format tanggal dan sort berdasarkan ID descending
        const processedData = response.data.map(item => ({
          ...item,
          tanggal: item.tanggal || item.created_at || item.date || new Date().toISOString(),
        }));

        const sortedData = processedData.sort((a, b) => b.id - a.id);

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (error) {
        setError(
          error.response?.data?.error || "Silahkan login terlebih dahulu"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchData();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const safeIncludes = (field, query) => {
      return (field || "").toLowerCase().includes(query);
    };

    let results = data;

    // Filter berdasarkan status
    if (statusFilter !== "all") {
      results = results.filter(item =>
        (item.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter berdasarkan search query
    if (searchQuery) {
      results = results.filter(item =>
        safeIncludes(item.nama, query) ||
        safeIncludes(item.permintaan, query) ||
        safeIncludes(item.lokasi, query) ||
        safeIncludes(formatDate(item.tanggal), query)
      );
    }

    // Pastikan filtered data tetap terurut berdasarkan ID terbesar
    results = results.sort((a, b) => b.id - a.id);

    setFilteredData(results);
    // Reset to first page when filter changes
    setCurrentPage(1);
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

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Pagination helper functions
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // If total pages is less than or equal to maxVisible, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // If total pages is more than maxVisible, show smart pagination
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      // Adjust if we're near the end
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add last page and ellipsis if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {userId === 1 ? <AdminNavbar /> : <UsersAdminNavbar/>}
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
                    <h2 className="page-title" style={{ color: '#2c3e50' }}>Status Pelapor Sumbang</h2>
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
                          <th className="col-no">ID</th>
                          <th className="col-nama">Nama Lengkap</th>
                          <th className="col-permintaan">Permintaan</th>
                          <th className="col-lokasi">Lokasi</th>
                          <th className="col-tanggal">Tanggal</th>
                          <th className="col-tanggal">Keterangan</th>
                          <th className="col-status">Status</th>
                          <th className="col-detail">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length > 0 ? (
                          currentItems.map((item) => (
                            <tr key={item.id}>
                              <td className="col-no text-center align-middle">{item.id}</td>
                              <td className="col-nama">{item.nama}</td>
                              <td className="col-permintaan">{item.permintaan}</td>
                              <td className="col-lokasi">{item.lokasi}</td>
                              <td className="col-tanggal text-center align-middle">
                                {item.tanggal ? (
                                  <div>
                                    <span className="date-text">{formatDate(item.tanggal)}</span>
                                    <br />
                                  </div>
                                ) : (
                                  <span></span>
                                )}
                              </td>
                              <td>{item.keterangan || "-"}</td>
                              <td className="col-status text-center align-middle">
                                {item.status && (
                                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                                    {item.status}
                                  </span>
                                )}
                              </td>
                              <td className="col-detail text-center align-middle">
                                <Link to={`/detail/${item.id}`}>
                                  <Button variant="info">Detail</Button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center text-muted py-5">
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <nav aria-label="Table pagination">
                        <ul className="pagination pagination-sm">
                          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button 
                              className="page-link" 
                              onClick={goToPrevious}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          
                          {getPageNumbers().map((pageNumber, index) => (
                            <li 
                              key={index} 
                              className={`page-item ${
                                pageNumber === currentPage ? "active" : ""
                              } ${pageNumber === '...' ? "disabled" : ""}`}
                            >
                              {pageNumber === '...' ? (
                                <span className="page-link">...</span>
                              ) : (
                                <button 
                                  className="page-link" 
                                  onClick={() => goToPage(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              )}
                            </li>
                          ))}
                          
                          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button 
                              className="page-link" 
                              onClick={goToNext}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                  
                  {/* Summary Section */}
                  <div className="summary-section mt-4">
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted">
                          Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} laporan
                          {statusFilter !== "all" && ` (filter: ${statusFilter})`}
                          {searchQuery && ` (pencarian: "${searchQuery}")`}
                          {totalPages > 1 && ` • Halaman ${currentPage} dari ${totalPages}`}
                        </small>
                      </div>
                      <div className="col-md-6 text-end">
                        {(searchQuery || statusFilter !== "all") && (
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                            }}
                            style={{ borderRadius: '20px' }}
                          >
                            Reset Filter
                          </button>
                        )}
                        {totalPages > 1 && (
                          <small className="text-muted">
                            {itemsPerPage} baris per halaman
                          </small>
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

export default Dashboard;