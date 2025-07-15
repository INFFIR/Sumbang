import React, { useEffect, useState } from "react";
import { Table, Button, Container, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/adminNavbar";
import LogoutNavbar from "../components/logoutNavbar";
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
          error.response?.data?.error ||
            "An error occurred while fetching user data"
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
          error.response?.data?.error || "Silahkan Login Terlebih Dahulu"
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
        item.no_hp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(results);
  }, [searchQuery, data]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="centered-error">{error}</div>;

  return (
    <>
      {userId === 1 ? <AdminNavbar /> : <LogoutNavbar />}
      <Container className="mt-5">
        <div className="mb-4">
          <h2 className="text-center">Dashboard</h2>
        </div>
        <div className="mb-4">
          <Form.Group controlId="search" style={{ maxWidth: "500px" }}>
            <Form.Control
              type="text"
              placeholder="Cari berdasarkan nama, no HP, atau lokasi"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Form.Group>
        </div>
        <div className="table-container">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="dashboard-id">ID</th>
                <th className="dashboard-nama">Nama</th>
                <th className="dashboard-nohp">No HP</th>
                <th className="dashboard-lokasi">Lokasi</th>
                <th className="dashboard-detail">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="dashboard-id">{item.id}</td>
                  <td className="dashboard-nama">{item.nama}</td>
                  <td className="dashboard-nohp">{item.no_hp}</td>
                  <td className="dashboard-lokasi">{item.lokasi}</td>
                  <td className="dashboard-detail">
                    <Link to={`/detail/${item.id}`}>
                      <Button variant="info">Detail</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="card-container">
          {filteredData.map((item) => (
            <Card key={item.id} className="mb-3">
              <Card.Body>
                <div className="card-text">
                  <span className="card-label">ID</span>
                  <span className="card-value">: {item.id}</span>
                </div>
                <div className="card-text">
                  <span className="card-label">NAMA</span>
                  <span className="card-value">: {item.nama}</span>
                </div>
                <div className="card-text">
                  <span className="card-label">NO HP</span>
                  <span className="card-value">: {item.no_hp}</span>
                </div>
                <div className="card-text">
                  <span className="card-label">LOKASI</span>
                  <span className="card-value">: {item.lokasi}</span>
                </div>
                <Link to={`/detail/${item.id}`} className="card-link">
                  <Button variant="info">DETAIL</Button>
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default Dashboard;
