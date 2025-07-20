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
} from "react-bootstrap";
import axios from "axios";

const ManageContent = () => {
  const token = localStorage.getItem("token");
  const [contentList, setContentList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("content");
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media: null,
    url: "",
  });
  const [previewMedia, setPreviewMedia] = useState({ type: null, src: null });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Helper function to check if a URL is an image
  const isImageUrl = (url) => {
    return (
      typeof url === "string" &&
      /\.(jpeg|jpg|png|gif|webp)$/i.test(url.split("?")[0])
    );
  };

  // Helper function to check if a URL is a direct video link
  const isVideoUrl = (url) => {
    return (
      typeof url === "string" &&
      /\.(mp4|webm|ogg)$/i.test(url.split("?")[0])
    );
  };

  // Helper function to get YouTube embed URL
  const getYoutubeEmbedUrl = (url) => {
    const regExp =
      /^.*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?$/;
    const match = url.match(regExp);
    if (match && match[1] && match[1].length === 11) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

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
      console.error("Failed to fetch data:", err);
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
    if (
      !formData.title &&
      !formData.description &&
      !formData.media &&
      !formData.url &&
      modalType === "content"
    ) {
      return alert("Minimal satu field harus diisi.");
    }

    if (!formData.title && !formData.description && modalType === "service") {
      return alert("Minimal satu field harus diisi.");
    }

    if (formData.media && formData.url) {
      return alert("Hanya salah satu dari media atau url yang boleh diisi.");
    }

    try {
      if (editData) {
        if (modalType === "service") {
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
          const form = new FormData();
          form.append("title", formData.title);
          form.append("description", formData.description);
          if (formData.media) form.append("media", formData.media);
          // Only append URL if media is not present for content
          if (formData.url && !formData.media) form.append("url", formData.url);

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
          // Only append URL if media is not present for content
          if (formData.url && !formData.media) form.append("url", formData.url);

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

  const handlePreview = (item) => {
    const youtubeEmbedUrl = item.url ? getYoutubeEmbedUrl(item.url) : null;

    if (item.media) {
      // Check if item.media is a base64 string
      if (typeof item.media === "string") {
        if (item.media.startsWith("data:video")) {
          setPreviewMedia({ type: "video", src: item.media });
        } else if (item.media.startsWith("data:image")) {
          setPreviewMedia({ type: "image", src: item.media });
        } else {
          // Fallback for base64 that might not have a full data URI prefix
          // Attempt to detect if it's likely a video based on common base64 video starts (e.g., "AAAA")
          // This is a heuristic and might need to be more robust depending on your backend
          if (item.media.startsWith("AAAA")) { // Common start for some base64 encoded video files
            setPreviewMedia({ type: "video", src: `data:video/mp4;base64,${item.media}` });
          } else { // Assume it's an image if not identified as video
            setPreviewMedia({ type: "image", src: `data:image/jpeg;base64,${item.media}` });
          }
        }
      } else {
        setPreviewMedia({ type: "unknown", src: null }); // For non-string media types
      }
    } else if (youtubeEmbedUrl) {
      setPreviewMedia({ type: "youtube", src: youtubeEmbedUrl });
    } else if (item.url && isImageUrl(item.url)) {
      setPreviewMedia({ type: "image", src: item.url });
    } else if (item.url && isVideoUrl(item.url)) {
      setPreviewMedia({ type: "video", src: item.url });
    } else {
      setPreviewMedia({ type: "unknown", src: null });
    }
    setShowPreviewModal(true);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Yakin ingin menghapus item ini?")) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/manage/${type}/delete/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchData();
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Gagal menghapus data.");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
    setFormData({ title: "", description: "", media: null, url: "" });
  };

  const openModal = (type, data = null) => {
    setModalType(type);
    setEditData(data);
    setFormData({
      title: data?.title || "",
      description: data?.description || "",
      media: null, // Clear media input on open
      url: data?.url || "",
    });
    setShowModal(true);
  };

  return (
    <Container className="mt-5">
      <UsersNavbar />
      <h3 className="fw-bold">Manage Content & Service</h3>

      {/* Content */}
      <Row className="my-4">
        <Col>
          <div className="d-flex justify-content-between mb-2">
            <h5>Content</h5>
            <Button onClick={() => openModal("content")}>Tambah Content</Button>
          </div>
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Media/URL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contentList.map((item) => {const youtubeEmbedUrl = item.url ? getYoutubeEmbedUrl(item.url) : null;
                const isItemMediaVideoBase64 = typeof item.media === 'string' && (item.media.startsWith("data:video") || item.media.startsWith("AAAA"));
                const isItemMediaImageBase64 = typeof item.media === 'string' && item.media.startsWith("data:image");

                return (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.description}</td>
                    <td>
                      {item.media ? (
                        isItemMediaVideoBase64 ? (
                          <video
                            width="100%"
                            controls
                            onClick={() => handlePreview(item)} // Make video clickable
                            style={{overflow: "hidden", cursor: "pointer", position: "center",}}
                          >
                            <source
                              src={item.media.startsWith("AAAA") ? `data:video/mp4;base64,${item.media}` : item.media}
                              type="video/mp4"
                            />
                            Browser tidak mendukung tag video.
                          </video>
                        ) : (
                          <img
                            src={isItemMediaImageBase64 ? item.media : `data:image/jpeg;base64,${item.media}`} // Fallback assuming base64 image
                            alt="preview"
                            style={{maxWidth: "100%", objectFit: "cover",  overflow: "hidden", cursor: "pointer", position: "relative"}}
                            onClick={() => handlePreview(item)} // Make image clickable
                          />
                        )
                      ) : youtubeEmbedUrl ? (
                        <div
                         // Menyesuaikan lebar dengan kontainer, Mengatur tinggi menjadi 0 untuk mempertahankan rasio aspek, Rasio aspek 16:9 (360 / 640 = 0.5625 atau 56.25%)
                          style={{ paddingBottom: "56.25%", overflow: "hidden", cursor: "pointer", position: "relative"}}
                          onClick={() => handlePreview(item)}
                        >
                          <iframe
                            width="100%"
                            src={youtubeEmbedUrl}
                            title="YouTube video player thumbnail"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0 }}
                          ></iframe>
                        </div>
                      ) : item.url && isVideoUrl(item.url) ? (
                        <video
                          width="100%"
                          controls
                          onClick={() => handlePreview(item)} // Make video clickable
                          style={{ paddingBottom: "56.25%", overflow: "hidden", cursor: "pointer", position: "relative"}}
                        >
                          <source src={item.url} type="video/mp4" />
                          Browser tidak mendukung tag video.
                        </video>
                      ) : item.url && isImageUrl(item.url) ? (
                        <img
                          src={item.url}
                          alt="preview"
                          style={{maxWidth: "100%", objectFit: "cover", cursor: "pointer", position: "relative", overflow: "hidden"}}
                          onClick={() => handlePreview(item)} // Make image clickable
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => openModal("content", item)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(item.id, "content")}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Service */}
      <Row>
        <Col>
          <div className="d-flex justify-content-between mb-2">
            <h5>Service</h5>
            <Button onClick={() => openModal("service")}>Tambah Service</Button>
          </div>
          <Table bordered responsive>
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
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => openModal("service", item)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(item.id, "service")}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Modal for Add/Edit Content/Service */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editData ? "Edit" : "Tambah"}{" "}
            {modalType === "content" ? "Content" : "Service"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
            {modalType === "content" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Media (Image or Video)</Form.Label>
                  <Form.Control
                    type="file"
                    name="media"
                    onChange={handleInputChange}
                    accept="image/*,video/*"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Atau Link URL Media (Image, Video, or YouTube)</Form.Label>
                  <Form.Control
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Modal */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Pratinjau Media</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewMedia.type === "image" && previewMedia.src && (
            <img
              src={previewMedia.src}
              alt="Pratinjau Gambar"
              style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          )}
          {previewMedia.type === "video" && previewMedia.src && (
            <video
              width="100%"
              height="auto"
              controls
              autoPlay
              style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
            >
              <source src={previewMedia.src} type="video/mp4" />
              Browser tidak mendukung video.
            </video>
          )}
          {previewMedia.type === "youtube" && previewMedia.src && (
            <div className="embed-responsive embed-responsive-16by9" style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
              <iframe
                className="embed-responsive-item"
                src={previewMedia.src}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              ></iframe>
            </div>
          )}
          {previewMedia.type === "unknown" && (
            <p>Tidak dapat menampilkan pratinjau media.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageContent;