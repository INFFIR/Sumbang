import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Button, Container, Row, Col, Card, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";

const LandingPage = () => {
  const navigate = useNavigate();
  const [serviceList, setServiceList] = useState([]);
  const [contentList, setContentList] = useState([]);
  const cardRefs = useRef([]);
  const [cardHeight, setCardHeight] = useState(null);

  const fetchData = async () => {
    try {
      // const token = localStorage.getItem("token");
      // const [contentRes, serviceRes] = await Promise.all([
      //   axios.get(`${process.env.REACT_APP_API_URL}/api/manage/content`, {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }),
      //   axios.get(`${process.env.REACT_APP_API_URL}/api/manage/service`, {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }),
      // ]
      const [contentRes, serviceRes] = await Promise.all([
      axios.get(`${process.env.REACT_APP_API_URL}/api/manage/content`),
      axios.get(`${process.env.REACT_APP_API_URL}/api/manage/service`),
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
    navigate("/pelaporan");
  };

  const renderContentCard = (content, index) => {
    const isFirst = index === 0;
    const isEven = index % 2 === 0;
    const bgColor = isEven ? "bg-light" : "bg-dark text-white";
    const textAlign = isEven ? "text-start" : "text-end";
    const hasMedia = !!content.media;

    return (
      <section className={`${bgColor} py-5 border-top`} key={`content-${index}`}>
        <Container>
          <Row className="align-items-center justify-content-center">
            {!hasMedia ? (
              <Col md={8} className="text-center">
                <h3 className="fw-bold">{content.title}</h3>
                <p className="mt-4">{content.description}</p>
                {isFirst && (
                  <Button variant={isEven ? "secondary" : "light"} onClick={handleLaporClick}>
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
                    <Button variant="secondary" onClick={handleLaporClick}>
                      Lapor Sekarang
                    </Button>
                  )}
                </Col>
                <Col md={5} className="text-center">
                  <div className="bg-white rounded-4 p-4 shadow-sm d-inline-block">
                    {content.media.startsWith("AAAA") ? (
                      <video width="100%" controls>
                        <source src={`data:video/mp4;base64,${content.media}`} type="video/mp4" />
                        Browser tidak mendukung video.
                      </video>
                    ) : (
                      <img
                        src={`data:image/jpeg;base64,${content.media}`}
                        alt="media"
                        style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                </Col>
              </>
            ) : (
              <>
                <Col md={5} className="text-center">
                  <div className="bg-white rounded-4 p-4 shadow-sm d-inline-block">
                    {content.media.startsWith("AAAA") ? (
                      <video width="100%" controls>
                        <source src={`data:video/mp4;base64,${content.media}`} type="video/mp4" />
                        Browser tidak mendukung video.
                      </video>
                    ) : (
                      <img
                        src={`data:image/jpeg;base64,${content.media}`}
                        alt="media"
                        style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                </Col>
                <Col md={7} className={textAlign}>
                  <h3 className="fw-bold">{content.title}</h3>
                  <p className="mt-4">{content.description}</p>
                  {isFirst && (
                    <Button variant="light" onClick={handleLaporClick}>
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
    <section className="py-5 text-center bg-white border-top">
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
      sections.push(renderContentCard(contentList[i], i));
    }
    if (i === 0 && serviceList.length > 0) {
      sections.push(renderServiceSlider());
    }
  }

  return (
    <div>
      <MainNavbar />
      {sections}
    </div>
  );
};

export default LandingPage;
