import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/Logo-dishub.png";
import MainNavbar from "../components/mainNavbar";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div>
      <MainNavbar />
      <div
        className="d-flex flex-column justify-content-start align-items-center"
        style={{ minHeight: "80vh", paddingTop: "5vh" }}
      >
        <img
          src={logo}
          alt="Dishub Logo"
          className="img-fluid"
          style={{ maxWidth: "40%", height: "auto" }}
        />
        <p
          style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center" }}
        >
          SUMBANG
        </p>
        <p
          style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center" }}
        >
          Sarana Prasarana Untuk Masyarakat Batu Gampang
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
