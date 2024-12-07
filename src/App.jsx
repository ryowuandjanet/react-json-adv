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
  const sortOptions = ['name', 'email', 'phone', 'address', 'status'];

  // 生成 MongoDB 風格 ID 的函數
  const generateObjectId = () => {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const randomPart = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
    return (timestamp + randomPart).slice(0, 24);
  };

  // 時間格式化函數
  const formatDateTime = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 添加 handleSubmit 函數
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentTime = formatDateTime(new Date());

      if (isEditing) {
        // 更新用戶時只更新 updatedAt
        const updatedUser = {
          ...formData,
          updatedAt: currentTime,
        };
        await axios.put(
          `http://localhost:5000/users/${formData.id}`,
          updatedUser,
        );
      } else {
        // 新增用戶時設置 id, createdAt 和 updatedAt
        const newUser = {
          ...formData,
          id: generateObjectId(),
          createdAt: currentTime,
          updatedAt: currentTime,
        };

        // 驗證 ID 格式
        if (!/^[0-9a-f]{24}$/.test(newUser.id)) {
          throw new Error('Invalid ID format generated');
        }

        await axios.post('http://localhost:5000/users', newUser);
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

  // 添加 handleEdit 函數
  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    setShowModal(true);
  };

  // 添加 handleDelete 函數
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:5000/users/${id}`);
        await loadUserData();
      } catch (err) {
        console.error('Error deleting record:', err);
        alert('Error deleting record. Please try again.');
      }
    }
  };

  // 添加 resetFormData 函數
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

  // 修改數據加載函數
  const loadUserData = async () => {
    try {
      let url = 'http://localhost:5000/users';
      let queryParams = [];

      // 處理排序邏輯
      if (sortValue) {
        queryParams.push(`_sort=${sortValue}&_order=asc`);
      } else {
        queryParams.push('_sort=updatedAt&_order=desc');
      }

      // 處理過濾邏輯
      if (currentFilter) {
        queryParams.push(`status=${encodeURIComponent(currentFilter)}`);
      }

      // 組合 URL
      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }

      const response = await axios.get(url);
      const allData = response.data;

      // 格式化時間
      const formattedData = allData.map((item) => ({
        ...item,
        createdAt: item.createdAt
          ? formatDateTime(new Date(item.createdAt))
          : '',
        updatedAt: item.updatedAt
          ? formatDateTime(new Date(item.updatedAt))
          : '',
      }));

      setTotalPages(Math.ceil(formattedData.length / itemsPerPage));

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setData(formattedData.slice(startIndex, endIndex));
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // 修改排序處理函數
  const handleSort = async (e) => {
    const value = e.target.value;
    setSortValue(value);
    setCurrentPage(1);

    try {
      let url = 'http://localhost:5000/users';

      if (value) {
        // 如果選擇了排序字段
        url += `?_sort=${value}&_order=asc`;
      } else {
        // 如果選擇 "Please Select Value"，則恢復默認排序
        url += '?_sort=updatedAt&_order=desc';
      }

      const response = await axios.get(url);
      const formattedData = response.data.map((item) => ({
        ...item,
        createdAt: item.createdAt
          ? formatDateTime(new Date(item.createdAt))
          : '',
        updatedAt: item.updatedAt
          ? formatDateTime(new Date(item.updatedAt))
          : '',
      }));

      setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
      setData(formattedData.slice(0, itemsPerPage));
    } catch (err) {
      console.error('Error sorting data:', err);
    }
  };

  // 修改搜索處理函數
  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);

    try {
      if (value.trim() === '') {
        await loadUserData();
        return;
      }

      let url = 'http://localhost:5000/users';
      let queryParams = [];

      // 添加排序
      if (sortValue) {
        queryParams.push(`_sort=${sortValue}&_order=asc`);
      } else {
        queryParams.push('_sort=updatedAt&_order=desc');
      }

      // 添加過濾
      if (currentFilter) {
        queryParams.push(`status=${encodeURIComponent(currentFilter)}`);
      }

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }

      const response = await axios.get(url);
      const allData = response.data;

      // 搜索過濾
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

      const formattedData = filteredData.map((item) => ({
        ...item,
        createdAt: formatDateTime(new Date(item.createdAt)),
        updatedAt: formatDateTime(new Date(item.updatedAt)),
      }));

      setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
      setData(formattedData.slice(0, itemsPerPage));
    } catch (err) {
      console.error('Error searching data:', err);
    }
  };

  // 修改�濾處理函數
  const handleFilter = async (status) => {
    try {
      setCurrentFilter(status === currentFilter ? '' : status);
      setCurrentPage(1);

      let url = 'http://localhost:5000/users';
      let queryParams = [];

      // 處理排序
      if (sortValue) {
        queryParams.push(`_sort=${sortValue}&_order=asc`);
      } else {
        queryParams.push('_sort=updatedAt&_order=desc');
      }

      // 處理過濾
      if (status && status !== currentFilter) {
        queryParams.push(`status=${encodeURIComponent(status)}`);
      }

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }

      const response = await axios.get(url);
      const formattedData = response.data.map((item) => ({
        ...item,
        createdAt: formatDateTime(new Date(item.createdAt)),
        updatedAt: formatDateTime(new Date(item.updatedAt)),
      }));

      setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
      setData(formattedData.slice(0, itemsPerPage));
    } catch (err) {
      console.error('Error filtering data:', err);
    }
  };

  // 修改重置函數
  const handleReset = async () => {
    setValue('');
    setSortValue('');
    setCurrentFilter('');
    setCurrentPage(1);
    await loadUserData();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 效果
  useEffect(() => {
    loadUserData();
  }, [currentPage]);

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
          handleClose={() => {
            setShowModal(false);
            resetFormData();
          }}
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
