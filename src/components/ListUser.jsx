import React from 'react';
import { Table } from 'react-bootstrap';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';

const ListUser = ({
  data,
  handleEdit,
  handleDelete,
  currentPage,
  itemsPerPage,
}) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Status</th>
          <th>Created At</th>
          <th>Updated At</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <tr key={item.id}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.phone}</td>
              <td>{item.address}</td>
              <td>{item.status}</td>
              <td>{item.createdAt || '-'}</td>
              <td>{item.updatedAt || '-'}</td>
              <td>
                <EditUser handleEdit={handleEdit} item={item} />
                <DeleteUser handleDelete={handleDelete} userId={item.id} />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="text-center">
              No Data Found
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default ListUser;
