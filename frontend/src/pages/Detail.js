import React, { useState, useEffect } from "react";
import { Table, Container, Row, Col, Button, Modal } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import DetailNavbar from "../components/detailNavbar";
import "../css/pages/Detail.css";

const Detail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [showOnProcessModal, setShowOnProcessModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ➕
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/detail/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
        setIsAuthenticated(false);
      });
  }, [id, token]);

  if (!isAuthenticated) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h2>Silahkan Login Terlebih Dahulu</h2>
        </div>
      </Container>
    );
  }

  if (!data) return <div>Loading...</div>;

  const {
    nama,
    alamat,
    no_hp,
    no_whatsapp,
    permintaan,
    detail_permintaan,
    lokasi,
    surat,
    status,
    foto,
  } = data;

  const getPdfUrl = (base64) => {
    if (base64) {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    }
    return null;
  };

  const getImageUrl = (base64) => {
    return base64 ? `data:image/jpeg;base64,${base64}` : null;
  };

  const handleReject = () => {
    setModalType("Reject");
    setShowModal(true);
  };

  const handleApprove = () => {
    setModalType("Approve");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setShowOnHoldModal(false);
    setShowOnProcessModal(false);
    setShowDoneModal(false);
    setShowDeleteModal(false); // ➕
  };

  const handleAction = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-status/${id}`,
        {
          status: modalType === "Approve" ? "Approved" : "Rejected",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (modalType === "Approve") {
        setData((prevData) => ({ ...prevData, status: "Approved" }));
      } else if (modalType === "Reject") {
        window.location.reload();
      }
      handleClose();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleOnHold = () => {
    setShowOnHoldModal(true);
  };

  const handleOnHoldConfirm = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-status/${id}`,
        {
          status: "On Hold",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData((prevData) => ({ ...prevData, status: "On Hold" }));
      handleClose();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleOnProcess = () => {
    setShowOnProcessModal(true);
  };

  const handleOnProcessConfirm = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-status/${id}`,
        {
          status: "On Process",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData((prevData) => ({ ...prevData, status: "On Process" }));
      handleClose();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDone = () => {
    setShowDoneModal(true);
  };

  const handleDoneConfirm = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/update-status/${id}`,
        {
          status: "Done",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData((prevData) => ({ ...prevData, status: "Done" }));
      handleClose();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true); // ➕
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/delete/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleClose();
      window.location.href = "/dashboard"; // ➕ alihkan setelah delete
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const renderButtons = () => {
    if (status === "Rejected" || status === "Done" || status === "Deleted") {
      return (
        <Button variant="outline-danger" onClick={handleDelete} className="ms-2">
          Delete
        </Button>
      );
    }

    if (status === "Approved") {
      return (
        <>
          <Button variant="warning" onClick={handleOnHold} className="me-2">
            On Hold
          </Button>
          <Button variant="info" onClick={handleOnProcess}>
            On Process
          </Button>
          <Button variant="outline-danger" onClick={handleDelete} className="ms-2">
            Delete
          </Button>
        </>
      );
    }

    if (status === "On Process") {
      return (
        <>
          <Button variant="success" onClick={handleDone}>
            Done
          </Button>
          <Button variant="outline-danger" onClick={handleDelete} className="ms-2">
            Delete
          </Button>
        </>
      );
    }

    if (status === "On Hold") {
      return (
        <>
          <Button variant="info" onClick={handleOnProcess}>
            On Process
          </Button>
          <Button variant="outline-danger" onClick={handleDelete} className="ms-2">
            Delete
          </Button>
        </>
      );
    }

    return (
      <>
        <Button variant="danger" onClick={handleReject} className="me-2">
          Rejected
        </Button>
        <Button variant="success" onClick={handleApprove}>
          Approved
        </Button>
        <Button variant="outline-danger" onClick={handleDelete} className="ms-2">
          Delete
        </Button>
      </>
    );
  };

  return (
    <>
      <DetailNavbar />
      <Container className="mt-5">
        <h2 className="mb-4">Detail Pelaporan</h2>
        <Row>
          <Col md={8}>
            <Table striped bordered hover className="table-custom">
              <tbody>
                <tr><td>Nama</td><td>{nama}</td></tr>
                <tr><td>Alamat</td><td>{alamat}</td></tr>
                <tr><td>No HP</td><td>{no_hp}</td></tr>
                <tr>
                  <td>No Whatsapp</td>
                  <td>
                    <a href={no_whatsapp} target="_blank" rel="noopener noreferrer">Go To Whatsapp</a>
                  </td>
                </tr>
                <tr><td>Permintaan</td><td>{permintaan}</td></tr>
                <tr><td>Detail Permintaan</td><td>{detail_permintaan}</td></tr>
                <tr><td>Lokasi</td><td>{lokasi}</td></tr>
                <tr>
                  <td>Surat Pengajuan</td>
                  <td>
                    {surat ? (
                      <a href={getPdfUrl(surat)} target="_blank" rel="noopener noreferrer">
                        Lihat Dokumen
                      </a>
                    ) : "No document available"}
                  </td>
                </tr>
                <tr><td>Status</td><td>{status}</td></tr>
              </tbody>
            </Table>

            <div className="d-flex justify-content-start mt-3">
              {renderButtons()}
            </div>
          </Col>
          <Col md={4} className="d-flex justify-content-center align-items-center">
            {foto ? (
              <img
                src={getImageUrl(foto)}
                alt="Detail"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  border: "5px solid #272a2f",
                }}
              />
            ) : (
              <p>No image available</p>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal Approve/Reject */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "Approve" ? "Approve" : "Reject"} Confirmation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {modalType === "Approve" ? "Approve" : "Reject"} this request?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant={modalType === "Approve" ? "success" : "danger"} onClick={handleAction}>
            {modalType === "Approve" ? "Approve" : "Reject"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal On Hold */}
      <Modal show={showOnHoldModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>On Hold Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to put this request on hold?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="warning" onClick={handleOnHoldConfirm}>Confirm</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal On Process */}
      <Modal show={showOnProcessModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>On Process Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to mark this request as being processed?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="info" onClick={handleOnProcessConfirm}>Confirm</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Done */}
      <Modal show={showDoneModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Done Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to mark this request as done?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="success" onClick={handleDoneConfirm}>Confirm</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Delete ➕ */}
      <Modal show={showDeleteModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this request? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>Confirm Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Detail;
