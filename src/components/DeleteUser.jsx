import React from 'react';
import { Button } from 'react-bootstrap';

const DeleteUser = ({ onDelete, userId }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      onDelete(userId);
    }
  };

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
};

export default DeleteUser;
