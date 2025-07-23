import React, { useEffect, useState } from "react";
import { Container, Table, Form, Button } from "react-bootstrap";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/pages/Verifikasi.css";

const Verifikasi = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        second: "2-digit", 
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Handle detail view
  const handleDetailClick = (item) => {
    // Implementasi untuk menampilkan detail
    console.log("Detail item:", item);
    // Bisa redirect ke halaman detail atau buka modal
    // window.location.href = `/detail/${item.id}`;
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

        const processedData = response.data.map((item) => ({
          ...item,
          tanggal:
            item.tanggal || item.created_at || item.date || new Date().toISOString(),
        }));

        const sortedData = processedData.sort((a, b) => b.id - a.id);

        setData(sortedData);
        setFilteredData(sortedData);
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

    if (statusFilter !== "all") {
      results = results.filter(
        (item) =>
          item.status &&
          item.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchQuery) {
      results = results.filter(
        (item) =>
          item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.permintaan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatDate(item.tanggal).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    results = results.sort((a, b) => b.id - a.id);
    setFilteredData(results);
    setCurrentPage(1); // Reset halaman saat filter berubah
  }, [searchQuery, statusFilter, data]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const getStatusCount = (status) => {
    if (status === "all") return data.length;
    return data.filter(
      (item) => item.status?.toLowerCase() === status.toLowerCase()
    ).length;
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <MainNavbar />
      <div
        style={{
          backgroundColor: "#e9ecef",
          minHeight: "100vh",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <Container>
          <div className="row justify-content-center">
            <div className="col-12">
              <div
                className="card shadow-sm"
                style={{
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#ffffff",
                }}
              >
                <div className="card-body p-5">
                  <div className="header-section mb-4">
                    <h2 className="page-title" style={{ color: "#2c3e50" }}>
                      Status Laporan Sumbang
                    </h2>
                    <p className="page-subtitle text-muted">
                      Sarana Prasarana Untuk Masyarakat Batu Gampang
                    </p>
                  </div>

                  {/* Search & Filter */}
                  <div className="search-filter-section mb-4">
                    <div className="row g-3">
                      <div className="col-md-8">
                        <Form.Control
                          type="text"
                          placeholder="Cari nama lengkap, permintaan, lokasi, atau tanggal..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #dee2e6",
                            padding: "12px 16px",
                            fontSize: "16px",
                          }}
                        />
                      </div>
                      <div className="col-md-4">
                        <Form.Select
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #dee2e6",
                            padding: "12px 16px",
                            fontSize: "16px",
                          }}
                        >
                          <option value="all">
                            Semua Status ({getStatusCount("all")})
                          </option>
                          <option value="verifikasi">
                            Verifikasi ({getStatusCount("verifikasi")})
                          </option>
                          <option value="approved">
                            Disetujui ({getStatusCount("approved")})
                          </option>
                          <option value="rejected">
                            Ditolak ({getStatusCount("rejected")})
                          </option>
                          <option value="on process">
                            Dalam Proses ({getStatusCount("on process")})
                          </option>
                          <option value="on hold">
                            Ditahan ({getStatusCount("on hold")})
                          </option>
                          <option value="done">
                            Selesai ({getStatusCount("done")})
                          </option>
                        </Form.Select>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-container">
                    <Table className="custom-table">
                      <thead>
                        <tr style={{ backgroundColor: "#6c7b8a", color: "white" }}>
                          <th className="text-center">ID</th>
                          <th>Nama Lengkap</th>
                          <th>Permintaan</th>
                          <th>Lokasi</th>
                          <th className="text-center">Tanggal</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length > 0 ? (
                          currentItems.map((item) => (
                            <tr key={item.id}>
                              <td className="text-center align-middle">{item.id}</td>
                              <td className="align-middle">{item.nama}</td>
                              <td className="align-middle">{item.permintaan}</td>
                              <td className="align-middle">{item.lokasi}</td>
                              <td className="text-center align-middle">{formatDate(item.tanggal)}</td>
                              <td className="text-center align-middle">
                                <span className={`status-badge ${getStatusClass(item.status)}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="col-detail text-center align-middle">
                                <Link to={`/riwayat-laporan/${item.id}`}>
                                  <Button variant="info">Lihat</Button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center text-muted py-5">
                              Tidak ada data yang ditemukan
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <nav>
                        <ul className="pagination">
                          <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                              Previous
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, index) => (
                            <li key={index} className={`page-item ${currentPage === index + 1 && "active"}`}>
                              <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}

                  {/* Summary & Reset Filter */}
                  <div className="summary-section mt-4">
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted">
                          Menampilkan {currentItems.length} dari {filteredData.length} laporan
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
                            style={{ borderRadius: "20px" }}
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