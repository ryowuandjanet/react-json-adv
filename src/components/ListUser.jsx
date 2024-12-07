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
            <tr key={item.id}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.phone}</td>
              <td>{item.address}</td>
              <td>{item.status}</td>
              <td>
                <EditUser onEdit={handleEdit} user={item} />
                <DeleteUser onDelete={handleDelete} userId={item.id} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default ListUser;
