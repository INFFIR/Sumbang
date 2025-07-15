import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");

    navigate("/");
  }, [navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h2>Silahkan Login Terlebih Dahulu</h2>
      </div>
    </Container>
  );
};

export default Logout;
