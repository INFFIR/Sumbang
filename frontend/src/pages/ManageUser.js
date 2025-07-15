import React, { useState, useEffect } from "react";
import { Table, Container, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import UsersNavbar from "../components/usersNavbar";

const API_URL = `${process.env.REACT_APP_API_URL}/api/manage-users`;

const ManageUser = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showEditErrorModal, setShowEditErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState({
    add: false,
    edit: false,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    axios
      .get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setIsAuthenticated(false);
      });
  }, []);

  if (!isAuthenticated) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h2>Silahkan Login Terlebih Dahulu</h2>
        </div>
      </Container>
    );
  }

  const handleCloseAddModal = () => setShowAddModal(false);
  const handleShowAddModal = () => setShowAddModal(true);

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleShowEditModal = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleCloseDeleteConfirmModal = () => setShowDeleteConfirmModal(false);
  const handleShowDeleteConfirmModal = (user) => {
    setCurrentUser(user);
    setShowDeleteConfirmModal(true);
  };

  const handleCloseEditSuccessModal = () => setShowEditSuccessModal(false);
  const handleCloseEditErrorModal = () => setShowEditErrorModal(false);

  const handleCloseSuccessModal = () => setShowSuccessModal(false);
  const handleCloseErrorModal = () => setShowErrorModal(false);

  const handleAddUser = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const newUser = {
      username: form.username.value,
      password: form.password.value,
    };
    axios
      .post(API_URL, newUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        if (response.data.error) {
          setErrorMessage(response.data.error);
          setShowErrorModal(true);
        } else {
          setUsers([...users, response.data]);
          handleCloseAddModal();
          setShowSuccessModal(true);
        }
      })
      .catch((error) => {
        setErrorMessage("An error occurred while adding the user.");
        setShowErrorModal(true);
        console.error("Error adding user:", error);
      });
  };

  const handleEditUser = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const updatedUser = {
      username: form.username.value,
      password: form.password.value,
    };
    axios
      .put(`${API_URL}/${currentUser.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setUsers(
          users.map((user) =>
            user.id === currentUser.id ? response.data : user
          )
        );
        handleCloseEditModal();
        setShowEditSuccessModal(true);
      })
      .catch((error) => {
        setErrorMessage("An error occurred while updating the user.");
        setShowEditErrorModal(true);
        console.error("Error updating user:", error);
      });
  };

  const handleDeleteUser = () => {
    axios
      .delete(`${API_URL}/${currentUser.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        setUsers(users.filter((user) => user.id !== currentUser.id));
        handleCloseDeleteConfirmModal();
        setShowSuccessModal(true);
      })
      .catch((error) => {
        setErrorMessage("An error occurred while deleting the user.");
        setShowErrorModal(true);
        console.error("Error deleting user:", error);
      });
  };

  const toggleModalPasswordVisibility = (modalType) => {
    setShowPasswordModal({
      ...showPasswordModal,
      [modalType]: !showPasswordModal[modalType],
    });
  };

  return (
    <>
      <UsersNavbar />
      <Container className="mt-5">
        <div className="d-flex justify-content-between mb-3">
          <h2>Manage Users</h2>
          <Button variant="primary" onClick={handleShowAddModal}>
            Add User
          </Button>
        </div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleShowEditModal(user)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  {user.id !== 1 && (
                    <Button
                      variant="danger"
                      onClick={() => handleShowDeleteConfirmModal(user)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Add User Modal */}
        <Modal show={showAddModal} onHide={handleCloseAddModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddUser}>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  name="username"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showPasswordModal.add ? "text" : "password"}
                    placeholder="Enter password"
                    name="password"
                    required
                  />
                  <Button
                    variant="link"
                    onClick={() => toggleModalPasswordVisibility("add")}
                    className="ms-2"
                  >
                    <i
                      className={`bi ${
                        showPasswordModal.add ? "bi-eye-slash" : "bi-eye"
                      }`}
                    />
                  </Button>
                </div>
              </Form.Group>
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="secondary"
                  onClick={handleCloseAddModal}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add User
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>Operation was successful!</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseSuccessModal}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Error Modal */}
        <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMessage}</Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleCloseErrorModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit User Modal */}
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentUser && (
              <Form onSubmit={handleEditUser}>
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    defaultValue={currentUser.username}
                    name="username"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type={showPasswordModal.edit ? "text" : "password"}
                      name="password"
                      required
                    />
                    <Button
                      variant="link"
                      onClick={() => toggleModalPasswordVisibility("edit")}
                      className="ms-2"
                    >
                      <i
                        className={`bi ${
                          showPasswordModal.edit ? "bi-eye-slash" : "bi-eye"
                        }`}
                      />
                    </Button>
                  </div>
                </Form.Group>
                <div className="d-flex justify-content-end mt-3">
                  <Button
                    variant="secondary"
                    onClick={handleCloseEditModal}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal
          show={showDeleteConfirmModal}
          onHide={handleCloseDeleteConfirmModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete the user "{currentUser?.username}"?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDeleteConfirmModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Success Modal */}
        <Modal show={showEditSuccessModal} onHide={handleCloseEditSuccessModal}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Username and/or password has been successfully updated!
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseEditSuccessModal}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Error Modal */}
        <Modal show={showEditErrorModal} onHide={handleCloseEditErrorModal}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMessage}</Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleCloseEditErrorModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ManageUser;
