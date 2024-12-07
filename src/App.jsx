import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  Row,
  Col,
  Button,
  ButtonGroup,
  Pagination,
  Form,
  Modal,
} from 'react-bootstrap';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [value, setValue] = useState('');
  const [sortValue, setSortValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const sortOptions = ['name', 'address', 'email', 'phone', 'status'];
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users');
      setData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setValue('');
    setSortValue('');
    setCurrentPage(1);
    loadUserData();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!value) {
      loadUserData();
      return;
    }
    const searchResults = data.filter(
      (item) =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.email.toLowerCase().includes(value.toLowerCase()) ||
        item.phone.includes(value) ||
        item.address.toLowerCase().includes(value.toLowerCase()) ||
        item.status.toLowerCase().includes(value.toLowerCase()),
    );
    setData(searchResults);
    setCurrentPage(1);
  };

  const handleSort = async (e) => {
    let value = e.target.value;
    setSortValue(value);
    try {
      const response = await axios.get(
        `http://localhost:5000/users?_sort=${value}&_order=asc`,
      );
      setData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilter = async (value) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/users?status=${value}`,
      );
      setData(response.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentPageData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const toggleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/users/${formData.id}`, formData);
      } else {
        const response = await axios.post('http://localhost:5000/users', {
          ...formData,
          id: Date.now().toString(),
        });

        if (response.status === 201) {
          console.log('User added successfully:', response.data);
        }
      }

      setShowModal(false);

      resetFormData();

      await loadUserData();
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: '',
    });
  };

  return (
    <Container>
      <form
        style={{
          margin: 'auto',
          padding: '15px',
          maxWidth: '400px',
          alignContent: 'center',
        }}
        className="d-flex input-group w-auto"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search Name ..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" variant="dark">
          Search
        </Button>
        <Button className="mx-2" variant="info" onClick={handleReset}>
          Reset
        </Button>
      </form>

      <Row>
        <Col md={8}>
          <h5>Sort By:</h5>
          <select
            style={{ width: '50%', borderRadius: '2px', height: '35px' }}
            onChange={handleSort}
            value={sortValue}
            className="form-select"
          >
            <option>Please Select Value</option>
            {sortOptions.map((item, index) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </select>
        </Col>
        <Col md={4}>
          <h5>Filter By Status:</h5>
          <ButtonGroup>
            <Button variant="success" onClick={() => handleFilter('Active')}>
              Active
            </Button>
            <Button
              variant="danger"
              style={{ marginLeft: '2px' }}
              onClick={() => handleFilter('Inactive')}
            >
              Inactive
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      <div style={{ marginTop: '100px' }}>
        <h2 className="text-center">
          Search, Filter, Sort, and Pagination using JSON Fake Rest API
        </h2>
        <Button variant="primary" onClick={toggleModal} className="mb-3">
          Add New User
        </Button>

        <Modal
          show={showModal}
          onHide={toggleModal}
          aria-labelledby="modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="modal-title">
              {isEditing ? 'Edit User' : 'Add New User'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={toggleModal}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Row>
          <Col xs={12}>
            <Table>
              <thead className="table-dark">
                <tr>
                  <th>No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr key={index}>
                      <th>{(currentPage - 1) * itemsPerPage + index + 1}</th>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>{item.address}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Pagination className="justify-content-center">
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === currentPage}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </Container>
  );
}

export default App;
