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
  const [currentFilter, setCurrentFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!value.trim()) {
      loadUserData();
    }
  }, [currentPage, sortValue, currentFilter]);

  const loadUserData = async () => {
    try {
      let url = 'http://localhost:5000/users';
      let queryParams = [];

      if (sortValue) {
        queryParams.push(`_sort=${sortValue}&_order=asc`);
      }

      if (currentFilter) {
        queryParams.push(`status=${currentFilter}`);
      }

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }

      const response = await axios.get(url);
      const allData = response.data;

      setTotalPages(Math.ceil(allData.length / itemsPerPage));

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setData(allData.slice(startIndex, endIndex));
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleReset = () => {
    setValue('');
    setSortValue('');
    setCurrentFilter('');
    setCurrentPage(1);
    loadUserData();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);

    try {
      if (value.trim() === '') {
        await loadUserData();
        return;
      }

      const response = await axios.get('http://localhost:5000/users');
      const allData = response.data;

      const filteredData = allData.filter((item) => {
        const searchTerm = value.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchTerm) ||
          item.email?.toLowerCase().includes(searchTerm) ||
          item.phone?.toLowerCase().includes(searchTerm) ||
          item.address?.toLowerCase().includes(searchTerm) ||
          item.status?.toLowerCase().includes(searchTerm)
        );
      });

      setTotalPages(Math.ceil(filteredData.length / itemsPerPage));

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setData(filteredData.slice(startIndex, endIndex));
    } catch (err) {
      console.error('Error searching data:', err);
    }
  };

  const handleSort = async (e) => {
    setSortValue(e.target.value);
    setCurrentPage(1);
    await loadUserData();
  };

  const handleFilter = async (status) => {
    setCurrentFilter(status);
    setCurrentPage(1);
    await loadUserData();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (value.trim()) {
      handleSearch(new Event('submit'));
    } else {
      loadUserData();
    }
  };

  const currentPageData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
        const newUser = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        const response = await axios.post(
          'http://localhost:5000/users',
          newUser,
        );

        if (response.status !== 201) {
          throw new Error('Failed to add new user');
        }

        console.log('New user added:', response.data);
      }

      setShowModal(false);
      resetFormData();
      setCurrentPage(1);
      await loadUserData();

      alert(
        isEditing ? 'User updated successfully!' : 'User added successfully!',
      );
    } catch (err) {
      console.error('Error:', err);
      alert(
        `Error: ${err.message || 'Failed to save data. Please try again.'}`,
      );
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
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      address: item.address,
      status: item.status,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:5000/users/${id}`);

        if (data.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          await loadUserData();
        }
      } catch (err) {
        console.error('Error deleting record:', err);
        alert('Error deleting record. Please try again.');
      }
    }
  };

  const checkServerConnection = async () => {
    try {
      await axios.get('http://localhost:5000/users');
      console.log('Successfully connected to JSON Server');
    } catch (err) {
      console.error('Error connecting to JSON Server:', err);
      alert(
        'Cannot connect to the server. Please ensure JSON Server is running.',
      );
    }
  };

  useEffect(() => {
    checkServerConnection();
  }, []);

  return (
    <Container>
      <Form
        style={{
          margin: 'auto',
          padding: '15px',
          maxWidth: '400px',
          alignContent: 'center',
        }}
        className="d-flex input-group w-auto"
        onSubmit={handleSearch}
      >
        <Form.Control
          type="text"
          placeholder="Search..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" variant="dark">
          Search
        </Button>
        <Button variant="info" onClick={handleReset} className="mx-2">
          Reset
        </Button>
      </Form>

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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>{item.address}</td>
                      <td>{item.status}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="me-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </td>
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
