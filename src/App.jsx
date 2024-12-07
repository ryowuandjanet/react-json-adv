import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Row, ButtonGroup } from 'react-bootstrap';
import './App.css';

// 導入所有組件
import AddUser from './components/AddUser';
import SearchUser from './components/SearchUser';
import SortUser from './components/SortUser';
import FilterUser from './components/FilterUser';
import ListUser from './components/ListUser';

function App() {
  const [data, setData] = useState([]);
  const [value, setValue] = useState('');
  const [sortValue, setSortValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const itemsPerPage = 10;
  const sortOptions = ['name', 'address', 'email', 'phone', 'status'];

  // 數據加載函數
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

  // 處理函數
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/users/${formData.id}`, formData);
      } else {
        const newUser = {
          ...formData,
          id: Date.now().toString(),
        };
        await axios.post('http://localhost:5000/users', newUser);
      }
      setShowModal(false);
      resetFormData();
      setCurrentPage(1);
      await loadUserData();
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    }
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
      setData(filteredData.slice(0, itemsPerPage));
    } catch (err) {
      console.error('Error searching data:', err);
    }
  };

  const handleSort = (e) => {
    setSortValue(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (status) => {
    setCurrentFilter(status);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setValue('');
    setSortValue('');
    setCurrentFilter('');
    setCurrentPage(1);
    loadUserData();
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/users/${id}`);
      if (data.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        loadUserData();
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Error deleting record. Please try again.');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  // 效果
  useEffect(() => {
    if (!value.trim()) {
      loadUserData();
    }
  }, [currentPage, sortValue, currentFilter]);

  return (
    <Container>
      <div style={{ marginTop: '100px' }}>
        <h2 className="text-center">
          Search, Filter, Sort and Pagination using JSON Fake Rest API
        </h2>

        <SearchUser
          value={value}
          setValue={setValue}
          handleSearch={handleSearch}
          handleReset={handleReset}
        />

        <Row>
          <SortUser
            sortValue={sortValue}
            handleSort={handleSort}
            sortOptions={sortOptions}
          />
          <FilterUser handleFilter={handleFilter} />
        </Row>

        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="mt-3"
        >
          Add New User
        </Button>

        <div className="mt-3">
          <ListUser
            data={data}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>

        <AddUser
          showModal={showModal}
          handleClose={() => setShowModal(false)}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
        />

        <div className="d-flex justify-content-center mt-4">
          <ButtonGroup>
            <Button
              variant="outline-primary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={
                  currentPage === index + 1 ? 'primary' : 'outline-primary'
                }
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline-primary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </Container>
  );
}

export default App;
