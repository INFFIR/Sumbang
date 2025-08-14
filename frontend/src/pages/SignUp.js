import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";

const Signup = () => {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        navigate("/"); // jangan hapus token!
    }
  }, [navigate]);

  // Validasi email dengan domain .com
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    return emailRegex.test(email);
  };

  // Validasi password minimal 6 karakter dan ada angka
  const validatePassword = (password) => {
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return hasMinLength && hasNumber;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let newValidationErrors = { ...validationErrors };

    if (name === "email") {
      if (value && !validateEmail(value)) {
        newValidationErrors.email = "Email harus menggunakan domain .com (contoh: user@example.com)";
      } else {
        newValidationErrors.email = "";
      }
    }

    if (name === "password") {
      if (value && !validatePassword(value)) {
        newValidationErrors.password = "Password minimal 6 karakter dan harus mengandung angka";
      } else {
        newValidationErrors.password = "";
      }
    }

    setValidationErrors(newValidationErrors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    // Validasi custom
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    
    let newValidationErrors = { ...validationErrors };
    
    if (!isEmailValid) {
      newValidationErrors.email = "Email harus menggunakan domain .com (contoh: user@example.com)";
    }
    
    if (!isPasswordValid) {
      newValidationErrors.password = "Password minimal 6 karakter dan harus mengandung angka";
    }
    
    setValidationErrors(newValidationErrors);

    if (form.checkValidity() === false || !isEmailValid || !isPasswordValid) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.error || "Silahkan signup terlebih dahulu"
      );
    }
    
    setValidated(true);
  };

  return (
    <>
      <MainNavbar />
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={4}>
            <h2 className="text-center mb-4 fw-bold">Sign Up Sumbang</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
                <Form.Control.Feedback type="invalid">
                  Username is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formEmail" className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter email (contoh: user@gmail.com)"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={validated && (validationErrors.email || !formData.email)}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.email || "Email is required."}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  placeholder="Password harus minimal 6 karakter dan mengandung angka."
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  isInvalid={validated && (validationErrors.password || !formData.password)}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.password || "Password is required."}
                </Form.Control.Feedback>
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-4 w-100">
                Sign-Up
              </Button>

            {/* ✅ Tombol Login di bawah Sign Up */}
            <div className="text-center mt-3">
              <span>Sudah punya akun? </span>
              <Button
                variant="link"
                onClick={() => navigate("/login")}
                className="p-0 align-baseline"
              >
                Login
              </Button>
            </div>

            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Signup;