import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/mainNavbar";
import axios from "axios";

const Signup = () => {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        navigate("/"); // jangan hapus token!
    }
    }, [navigate]);


  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      const username = form.username.value;
      const email = form.email.value;
      const password = form.password.value;

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/register`,
          {
            username,
            email,
            password,
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
    }
    setValidated(true);
  };

  return (
    <>
      <MainNavbar />
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={4}>
            <h2 className="text-center mb-4 fw-bold">Sign-Up Sumbang</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter username"
                  name="username"
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
                  placeholder="Enter email"
                  name="email"
                />
                <Form.Control.Feedback type="invalid">
                  Email is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  placeholder="Enter password"
                  name="password"
                />
                <Form.Control.Feedback type="invalid">
                  Password is required.
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
