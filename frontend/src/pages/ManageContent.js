
import React, { useState, useEffect } from "react";
import UsersNavbar from "../components/usersNavbar";



import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Table,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const ManageContent = () => {
  const token = localStorage.getItem("token");

  const [contentList, setContentList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("content"); // 'content' or 'service'
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", media: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);


  const fetchData = async () => {
    try {
      const [contentRes, serviceRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/manage/content`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/manage/service`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setContentList(contentRes.data);
      setServiceList(serviceRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

const handleSubmit = async () => {
  if (!formData.title && !formData.description && !formData.media && modalType === "content") {
    return alert("Minimal satu field harus diisi.");
  }

  if (!formData.title && !formData.description && modalType === "service") {
    return alert("Minimal satu field harus diisi.");
  }

  try {
    if (editData) {
      if (modalType === "service") {
        // Kirim JSON biasa untuk service (tidak pakai FormData)
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/manage/${modalType}/edit/${editData.id}`,
          {
            title: formData.title,
            description: formData.description,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Pakai FormData untuk content
        const form = new FormData();
        form.append("title", formData.title);
        form.append("description", formData.description);
        if (formData.media) form.append("media", formData.media);

        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/manage/${modalType}/edit/${editData.id}`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } else {
      if (modalType === "service") {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/manage/${modalType}/create`,
          {
            title: formData.title,
            description: formData.description,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const form = new FormData();
        form.append("title", formData.title);
        form.append("description", formData.description);
        if (formData.media) form.append("media", formData.media);

        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/manage/${modalType}/create`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    }

    handleClose();
    fetchData();
  } catch (err) {
    console.error("Gagal submit:", err.response?.data || err.message);
    alert("Gagal menyimpan data. Periksa koneksi atau format input.");
  }
};

  const handlePreview = (imageBase64) => {
  setPreviewImage(imageBase64);
  setShowPreviewModal(true);
};


  const handleDelete = async (id, type) => {
    if (!window.confirm("Yakin ingin menghapus item ini?")) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/manage/${type}/delete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
    setFormData({ title: "", description: "", media: null });
  };

  const openModal = (type, data = null) => {
    setModalType(type);
    setEditData(data);
    setFormData({
      title: data?.title || "",
      description: data?.description || "",
      media: null,
    });
    setShowModal(true);
  };

  return (
    <Container className="mt-5">
      <UsersNavbar />
      <h3 className="fw-bold">Manage Content & Service</h3>
      <Row className="my-4">
        <Col>
          <div className="d-flex justify-content-between mb-2">
            <h5>Content</h5>
            <Button onClick={() => openModal("content")}>Tambah Content</Button>
          </div>
          <Table bordered>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Media</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contentList.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>
                    {item.media ? (
                      <>
                        {/* Deteksi apakah ini gambar atau video dari konten base64 */}
                        {item.media.startsWith("AAAAGGZ0") || item.media.startsWith("AAAAHGZ0") ? (
                          // Ini adalah video mp4 (base64 biasanya diawali 'AAAA...')
                          <video width="120" controls>
                            <source src={`data:video/mp4;base64,${item.media}`} type="video/mp4" />
                            Browser tidak mendukung tag video.
                          </video>
                        ) : (
                          // Anggap selain itu sebagai gambar
                        <img
                          src={`data:image/jpeg;base64,${item.media}`}
                          alt="preview"
                          style={{ maxWidth: "120px", maxHeight: "80px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => handlePreview(item.media)}
                        />
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <Button size="sm" variant="warning" onClick={() => openModal("content", item)}>Edit</Button>{" "}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(item.id, "content")}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="d-flex justify-content-between mb-2">
            <h5>Service</h5>
            <Button onClick={() => openModal("service")}>Tambah Service</Button>
          </div>
          <Table bordered>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {serviceList.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>
                    <Button size="sm" variant="warning" onClick={() => openModal("service", item)}>Edit</Button>{" "}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(item.id, "service")}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit" : "Tambah"} {modalType === "content" ? "Content" : "Service"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control name="title" value={formData.title} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
            </Form.Group>
            {modalType === "content" && (
              <Form.Group className="mb-3">
                <Form.Label>Media</Form.Label>
                <Form.Control type="file" name="media" onChange={handleInputChange} />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Batal</Button>
          <Button variant="primary" onClick={handleSubmit}>Simpan</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Pratinjau Gambar</Modal.Title>
  </Modal.Header>
  <Modal.Body className="text-center">
    <img
      src={`data:image/jpeg;base64,${previewImage}`}
      alt="full"
      style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
    />
  </Modal.Body>
</Modal>

    </Container>
  );
  
};

export default ManageContent;
