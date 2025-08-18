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

  // Responsiveness: deteksi lebar layar untuk tweak khusus HP
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767.98px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const handler = (e) => setIsMobile(e.matches);
    try {
      mq.addEventListener("change", handler);
    } catch {
      // Safari fallback
      mq.addListener(handler);
    }
    return () => {
      try {
        mq.removeEventListener("change", handler);
      } catch {
        mq.removeListener(handler);
      }
    };
  }, []);

  // State untuk modal pratinjau media
  const [previewMedia, setPreviewMedia] = useState({ type: null, src: null });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Helper cek URL image
  const isImageUrl = (url) => {
    return (
      typeof url === "string" &&
      /\.(jpeg|jpg|png|gif|webp)$/i.test(url.split("?")[0])
    );
  };

  // Helper cek URL video
  const isVideoUrl = (url) => {
    return (
      typeof url === "string" &&
      /\.(mp4|webm|ogg)$/i.test(url.split("?")[0])
    );
  };

  // Helper YouTube embed
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
      const token = localStorage.getItem("token");
      const [contentRes, serviceRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/manage/content`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/manage/service`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  // Equal height cards hanya untuk desktop (HP biarkan auto height)
  useLayoutEffect(() => {
    if (isMobile) {
      setCardHeight(null);
      return;
    }
    if (cardRefs.current.length > 0) {
      const heights = cardRefs.current.map((ref) => ref?.offsetHeight || 0);
      const max = Math.max(...heights);
      setCardHeight(max);
    }
  }, [serviceList, isMobile]);

  const handleLaporClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/pelaporan");
    } else {
      navigate("/login");
    }
  };

  // Handler preview media
  const handlePreview = (item) => {
    const youtubeEmbedUrl = item.url ? getYoutubeEmbedUrl(item.url) : null;

    if (item.media) {
      if (typeof item.media === "string") {
        if (item.media.startsWith("data:video")) {
          setPreviewMedia({ type: "video", src: item.media });
        } else if (item.media.startsWith("data:image")) {
          setPreviewMedia({ type: "image", src: item.media });
        } else {
          if (item.media.startsWith("AAAA")) {
            setPreviewMedia({ type: "video", src: `data:video/mp4;base64,${item.media}` });
          } else {
            setPreviewMedia({ type: "image", src: `data:image/jpeg;base64,${item.media}` });
          }
        }
      } else {
        setPreviewMedia({ type: "unknown", src: null });
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

  // Wrapper media responsif
  const MediaWrapper = ({ children }) => (
    <div className="hp-media-wrapper">
      {children}
    </div>
  );

  const renderMedia = (content) => {
    const youtubeEmbedUrl = content.url ? getYoutubeEmbedUrl(content.url) : null;

    if (content.media) {
      const isContentMediaVideoBase64 =
        typeof content.media === "string" &&
        (content.media.startsWith("data:video") || content.media.startsWith("AAAA"));
      const isContentMediaImageBase64 =
        typeof content.media === "string" && content.media.startsWith("data:image");

      if (isContentMediaVideoBase64) {
        return (
          <MediaWrapper>
            <video
              width="100%"
              controls
              className="hp-media"
              onClick={() => handlePreview(content)}
            >
              <source
                src={content.media.startsWith("AAAA") ? `data:video/mp4;base64,${content.media}` : content.media}
                type="video/mp4"
              />
              Browser tidak mendukung video.
            </video>
          </MediaWrapper>
        );
      } else if (isContentMediaImageBase64) {
        return (
          <MediaWrapper>
            <img
              src={content.media}
              alt="media"
              className="hp-media"
              onClick={() => handlePreview(content)}
            />
          </MediaWrapper>
        );
      } else if (typeof content.media === "string") {
        return (
          <MediaWrapper>
            <img
              src={`data:image/jpeg;base64,${content.media}`}
              alt="media"
              className="hp-media"
              onClick={() => handlePreview(content)}
            />
          </MediaWrapper>
        );
      }
    } else if (youtubeEmbedUrl) {
      return (
        <MediaWrapper>
          <div
            className="hp-embed"
            onClick={() => handlePreview(content)}
          >
            <iframe
              src={youtubeEmbedUrl}
              title="YouTube video player thumbnail"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </MediaWrapper>
      );
    } else if (content.url && isVideoUrl(content.url)) {
      return (
        <MediaWrapper>
          <video
            width="100%"
            controls
            className="hp-media"
            onClick={() => handlePreview(content)}
          >
            <source src={content.url} type="video/mp4" />
            Browser tidak mendukung video.
          </video>
        </MediaWrapper>
      );
    } else if (content.url && isImageUrl(content.url)) {
      return (
        <MediaWrapper>
          <img
            src={content.url}
            alt="media"
            className="hp-media"
            onClick={() => handlePreview(content)}
          />
        </MediaWrapper>
      );
    }
    return null;
  };

  const renderContentCard = (content, index) => {
    const isFirst = index === 0;
    const isEven = index % 2 === 0;
    const bgColor = isEven ? "bg-light" : "bg-dark text-white";
    const textAlignDesktop = isEven ? "text-start" : "text-end";
    const mediaToRender = renderMedia(content);

    // Di HP: urutan media > teks agar lebih natural
    // Di desktop: tetap mengikuti pola kiri/kanan seperti sebelumnya
    return (
      <section className={`${bgColor} py-4 py-md-5 border-top`} key={`content-${index}`}>
        <Container className="px-3 px-md-0">
          <Row className="align-items-center justify-content-center g-3 g-md-4">
            {!mediaToRender ? (
              <Col xs={12} md={8} className="text-center">
                <h3 className="fw-bold mb-3">{content.title}</h3>
                <p className="mt-2 mb-0">{content.description}</p>
                {isFirst && (
                  <div className="d-grid d-md-inline mt-3">
                    <Button
                      className="hp-btn-lapor"
                      style={{ backgroundColor: "#2F5D9F", borderColor: "#2F5D9F", color: "white" }}
                      onClick={handleLaporClick}
                    >
                      Lapor Sekarang
                    </Button>
                  </div>
                )}
              </Col>
            ) : isEven ? (
              <>
                {/* Desktop: teks kiri, media kanan | HP: media dulu */}
                <Col
                  xs={12}
                  md={7}
                  className={`${textAlignDesktop} order-2 order-md-1`}
                >
                  <h3 className="fw-bold mb-3">{content.title}</h3>
                  <p className="mt-2 mb-0">{content.description}</p>
                  {isFirst && (
                    <div className="d-grid d-md-inline mt-3">
                      <Button
                        className="hp-btn-lapor"
                        style={{ backgroundColor: "#2F5D9F", borderColor: "#2F5D9F", color: "white" }}
                        onClick={handleLaporClick}
                      >
                        Lapor Sekarang
                      </Button>
                    </div>
                  )}
                </Col>
                <Col xs={12} md={5} className="text-center order-1 order-md-2">
                  {mediaToRender}
                </Col>
              </>
            ) : (
              <>
                {/* Desktop: media kiri, teks kanan | HP: media dulu */}
                <Col xs={12} md={5} className="text-center order-1">
                  {mediaToRender}
                </Col>
                <Col
                  xs={12}
                  md={7}
                  className={`${textAlignDesktop} order-2`}
                >
                  <h3 className="fw-bold mb-3">{content.title}</h3>
                  <p className="mt-2 mb-0">{content.description}</p>
                  {isFirst && (
                    <div className="d-grid d-md-inline mt-3">
                      <Button
                        className="hp-btn-lapor"
                        style={{ backgroundColor: "#2F5D9F", borderColor: "#2F5D9F", color: "#fff" }}
                        onClick={handleLaporClick}
                      >
                        Lapor Sekarang
                      </Button>
                    </div>
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
    <>
      {/* CSS ringan khusus HP agar media & tombol tidak mepet */}
      <style>{`
        /* Wrapper media: padding kecil, radius, dan shadow di HP */
        .hp-media-wrapper {
          width: 100%;
        }
        .hp-media {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
        }
        /* Iframe YT responsif (16:9) */
        .hp-embed {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          border-radius: 12px;
          overflow: hidden;
        }
        .hp-embed iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        /* Spacing & batasan tinggi media */
        @media (max-width: 767.98px) {
          .hp-media-wrapper {
            margin: 10px 0 8px 0; /* beri jarak atas-bawah agar tidak nempel tombol/teks */
          }
          .hp-media, .hp-embed iframe {
            max-height: 240px; /* nyaman di HP */
            object-fit: cover;
          }
          .hp-btn-lapor {
            padding: 10px 14px;
            border-radius: 10px;
          }
        }
        @media (min-width: 768px) {
          .hp-media, .hp-embed iframe {
            max-height: 300px; /* desktop tetap seperti sebelumnya */
            object-fit: cover;
          }
        }
      `}</style>

      <div>
        <MainNavbar />
        {sections}

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
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 12 }}
              />
            )}
            {previewMedia.type === "video" && previewMedia.src && (
              <video
                width="100%"
                height="auto"
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 12 }}
              >
                <source src={previewMedia.src} type="video/mp4" />
                Browser tidak mendukung video.
              </video>
            )}
            {previewMedia.type === "youtube" && previewMedia.src && (
              <div
                className="hp-embed"
                style={{ maxWidth: "100%", margin: "0 auto" }}
              >
                <iframe
                  src={previewMedia.src}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {previewMedia.type === "unknown" && (
              <p>Tidak dapat menampilkan pratinjau media.</p>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default LandingPage;
