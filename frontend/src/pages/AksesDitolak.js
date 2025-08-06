import React from "react";
import { Link } from "react-router-dom";

const AksesDitolak = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>403 - Akses Ditolak</h1>
      <p style={styles.message}>
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link to="/" style={styles.link}>Kembali ke Beranda</Link>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    paddingTop: "100px",
  },
  title: {
    fontSize: "36px",
    color: "#D32F2F",
  },
  message: {
    fontSize: "18px",
    marginTop: "20px",
  },
  link: {
    marginTop: "30px",
    display: "inline-block",
    color: "#1976D2",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default AksesDitolak;
