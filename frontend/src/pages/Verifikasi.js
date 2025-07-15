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

    fetchData();
  }, []);

  useEffect(() => {
    const results = data.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.permintaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(results);
  }, [searchQuery, data]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <MainNavbar />
      <Container className="mt-5">
        <div className="text-center mb-4">
          <h2>Status Pelaporan SUMBANG</h2>
        </div>
        <div className="mb-4 d-flex justify-content-center">
          <Form.Group controlId="search" className="w-100 w-md-40">
            <Form.Control
              type="text"
              placeholder="Cari berdasarkan nama, permintaan, lokasi, status, atau tanggal"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </Form.Group>
        </div>
        <div className="d-none d-md-block">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th className="col-nama">Nama</th>
                <th className="col-permintaan">Permintaan</th>
                <th className="col-lokasi">Lokasi</th>
                <th className="col-date">Date</th>
                <th className="col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="col-id">{item.id}</td>
                  <td className="col-nama">{item.nama}</td>
                  <td className="col-permintaan">{item.permintaan}</td>
                  <td className="col-lokasi">{item.lokasi}</td>
                  <td className="col-date">{item.date}</td>
                  <td className={`col-status ${getStatusClass(item.status)}`}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="d-block d-md-none">
          {filteredData.map((item) => (
            <Card className="mb-3" key={item.id}>
              <Card.Body>
                <div className="card-content">
                  <div className="card-label">ID :</div>
                  <div className="card-value">{item.id}</div>
                </div>
                <div className="card-content">
                  <div className="card-label">Nama :</div>
                  <div className="card-value">{item.nama}</div>
                </div>
                <div className="card-content">
                  <div className="card-label">Permintaan :</div>
                  <div className="card-value">{item.permintaan}</div>
                </div>
                <div className="card-content">
                  <div className="card-label">Lokasi :</div>
                  <div className="card-value">{item.lokasi}</div>
                </div>
                <div className="card-content">
                  <div className="card-label">Date :</div>
                  <div className="card-value">{item.date}</div>
                </div>
                <div className="card-content">
                  <div className="card-label">Status :</div>
                  <div className={`card-value ${getStatusClass(item.status)}`}>
                    {item.status}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default Verifikasi;
