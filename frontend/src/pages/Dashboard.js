import React, { useEffect, useState } from "react";
import { Table, Button, Container, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/adminNavbar";
import LogoutNavbar from "../components/logoutNavbar";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/pages/Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserId(response.data.id);
      } catch (error) {
        setError(
          error.response?.data?.error || "Gagal mengambil data pengguna."
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
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        setError(
          error.response?.data?.error || "Silakan login terlebih dahulu."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchData();
  }, []);

  useEffect(() => {
    const results = data.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.no_hp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(results);
  }, [searchQuery, data]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-center text-danger mt-4">{error}</div>;

  return (
    <>
      {userId === 1 ? <AdminNavbar /> : <LogoutNavbar />}

      <Container className="mt-5">
        <div className="mb-4 text-center">
          <h2 className="fw-bold">Aktivitas Laporan Sumbang</h2>
          <p className="text-muted">Sarana Prasarana Untuk Masyarakat Batu Gampang</p>
        </div>

        <div className="mb-4 d-flex justify-content-center">
          <Form.Group controlId="search" style={{ maxWidth: "500px", width: "100%" }}>
            <Form.Control
              type="text"
              placeholder="Cari berdasarkan nama, no HP, atau lokasi"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Form.Group>
        </div>

        <div className="table-responsive">
          <Table bordered hover className="align-middle">
            <thead style={{ backgroundColor: "#D1D5DB", color: "#111827" }}>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>No HP</th>
                <th>Lokasi</th>
                <th>Permintaan</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Detail Informasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nama}</td>
                    <td>{item.no_hp || "-"}</td>
                    <td>{item.lokasi || "-"}</td>
                    <td>{item.permintaan || "Perbaikan"}</td>
                    <td>
                      <i className="bi bi-calendar-event me-2"></i>
                      {new Date(item.tanggal || Date.now()).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <Link to={`/detail/${item.id}`}>
                        <Button variant="info" size="sm">
                          Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Container>
    </>
  );
};

export default Dashboard;
