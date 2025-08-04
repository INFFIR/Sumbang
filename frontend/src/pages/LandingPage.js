import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Button, Container, Row, Col, Card, Carousel, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";

const LandingPage = () => {
  const navigate = useNavigate();
  const [serviceList, setServiceList] = useState([]);
  const [contentList, setContentList] = useState([]);
  const cardRefs = useRef([]);
  const [cardHeight, setCardHeight] = useState(null);

  // State for media preview modal
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
      const token = localStorage.getItem("token"); // Consider if token is needed for public landing page
      const [contentRes, serviceRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/manage/content`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}, // Only send token if it exists
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/manage/service`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}, // Only send token if it exists
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

  useLayoutEffect(() => {
    if (cardRefs.current.length > 0) {
      const heights = cardRefs.current.map(ref => ref?.offsetHeight || 0);
      const max = Math.max(...heights);
      setCardHeight(max);
    }
  }, [serviceList]);

  const handleLaporClick = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/pelaporan");
    } else {
      navigate("/login");
    }
  };


  // Function to handle media preview
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


  const renderMedia = (content) => {
    const youtubeEmbedUrl = content.url ? getYoutubeEmbedUrl(content.url) : null;

    if (content.media) {
      const isContentMediaVideoBase64 = typeof content.media === 'string' && (content.media.startsWith("data:video") || content.media.startsWith("AAAA"));
      const isContentMediaImageBase64 = typeof content.media === 'string' && content.media.startsWith("data:image");

      if (isContentMediaVideoBase64) {
        return (
          <video
            width="100%"
            controls
            style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover", cursor: "pointer" }}
            onClick={() => handlePreview(content)}
          >
            <source src={content.media.startsWith("AAAA") ? `data:video/mp4;base64,${content.media}` : content.media} type="video/mp4" />
            Browser tidak mendukung video.
          </video>
        );
      } else if (isContentMediaImageBase64) {
        return (
          <img
            src={content.media}
            alt="media"
            style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover", cursor: "pointer" }}
            onClick={() => handlePreview(content)}
          />
        );
      } else if (typeof content.media === 'string') { // Fallback assuming base64 image if no clear prefix
        return (
          <img
            src={`data:image/jpeg;base64,${content.media}`}
            alt="media"
            style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover", cursor: "pointer" }}
            onClick={() => handlePreview(content)}
          />
        );
      }
    } else if (youtubeEmbedUrl) {
      return (
        <div
          // Menyesuaikan lebar dengan kontainer, Mengatur tinggi menjadi 0 untuk mempertahankan rasio aspek, Rasio aspek 16:9 (360 / 640 = 0.5625 atau 56.25%)
          style={{ paddingBottom: "56.25%", overflow: "hidden", cursor: "pointer", position: "relative"}}
          onClick={() => handlePreview(content)}
        >
          <iframe
            width="100%"
            height="100%"
            src={youtubeEmbedUrl}
            title="YouTube video player thumbnail"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0 }}
          ></iframe>
        </div>
      );
    } else if (content.url && isVideoUrl(content.url)) {
      return (
        <video
          width="100%"
          controls
          style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover", cursor: "pointer" }}
          onClick={() => handlePreview(content)}
        >
          <source src={content.url} type="video/mp4" />
          Browser tidak mendukung video.
        </video>
      );
    } else if (content.url && isImageUrl(content.url)) {
      return (
        <img
          src={content.url}
          alt="media"
          style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover", cursor: "pointer" }}
          onClick={() => handlePreview(content)}
        />
      );
    }
    return null; // No media to display
  };

  const renderContentCard = (content, index) => {
    const isFirst = index === 0;
    const isEven = index % 2 === 0;
    const bgColor = isEven ? "bg-light" : "bg-dark text-white";
    const textAlign = isEven ? "text-start" : "text-end";
    const mediaToRender = renderMedia(content);

    return (
      <section className={`${bgColor} py-5 border-top`} key={`content-${index}`}>
  <Container>
    <Row className="align-items-center justify-content-center">
      {!mediaToRender ? (
        <Col md={8} className="text-center">
          <h3 className="fw-bold">{content.title}</h3>
          <p className="mt-4">{content.description}</p>
          {isFirst && (
            <Button
              style={{ backgroundColor: '#2F5D9F', borderColor: '#2F5D9F', color: 'black' }}
              onClick={handleLaporClick}
            >
              Lapor Sekarang
            </Button>
          )}
        </Col>
      ) : isEven ? (
        <>
          <Col md={7} className={textAlign}>
            <h3 className="fw-bold">{content.title}</h3>
            <p className="mt-4">{content.description}</p>
            {isFirst && (
              <Button
                style={{ backgroundColor: '#2F5D9F', borderColor: '#2F5D9F', color: 'white' }}
                onClick={handleLaporClick}
              >
                Lapor Sekarang
              </Button>
            )}
          </Col>
          <Col md={5} className="text-center">
            {mediaToRender}
          </Col>
        </>
      ) : (
        <>
          <Col md={5} className="text-center">
            {mediaToRender}
          </Col>
          <Col md={7} className={textAlign}>
            <h3 className="fw-bold">{content.title}</h3>
            <p className="mt-4">{content.description}</p>
            {isFirst && (
              <Button
                style={{ backgroundColor: '#2F5D9F', borderColor: '#2F5D9F', color: '#fff' }}
                onClick={handleLaporClick}
              >
                Lapor Sekarang
              </Button>
            )}
          </Col>
        </>
      )}
    </Row>
  </Container>
</section>

    );
  };

  const renderServiceSlider = () => (
    <section className="py-5 text-center bg-light border-top">
      <h4 className="mb-4 fw-semibold">Layanan</h4>
      <Container>
        <Carousel indicators={false} interval={null}>
          {Array.from({ length: Math.ceil(serviceList.length / 3) }).map((_, slideIdx) => (
            <Carousel.Item key={`slide-${slideIdx}`}>
              <Row className="justify-content-center">
                {serviceList.slice(slideIdx * 3, slideIdx * 3 + 3).map((s, i) => (
                  <Col md={3} className="mx-2 mb-3" key={`service-card-${i}`}>
                    <Card
                      ref={el => (cardRefs.current[i + slideIdx * 3] = el)}
                      style={{
                        backgroundColor: "#CBD5E1",
                        border: "none",
                        borderRadius: "12px",
                        height: cardHeight || "auto"
                      }}
                    >
                      <Card.Body>
                        <h5 className="fw-bold">{s.title}</h5>
                        <p className="text-muted" style={{ fontSize: "0.9rem" }}>{s.description}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );

  const sections = [];
  const maxIndex = Math.max(contentList.length, 1);

  for (let i = 0; i < maxIndex; i++) {
    if (contentList[i]) {
      sections.push(
        React.cloneElement(renderContentCard(contentList[i], i), {
          key: `content-${i}`,
        })
      );
    }
    if (i === 0 && serviceList.length > 0) {
      sections.push(
        React.cloneElement(renderServiceSlider(), {
          key: `services`,
        })
      );
    }
  }

  return (
    <div>
      <MainNavbar />
      {sections}

      {/* Preview Modal for LandingPage */}
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
    </div>
  );
};

export default LandingPage;