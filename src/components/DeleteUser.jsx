import React from 'react';
import { Button } from 'react-bootstrap';

const DeleteUser = ({ handleDelete, userId }) => {
  const onDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      handleDelete(userId);
    }
  };

  return (
    <Button variant="danger" size="sm" onClick={onDeleteClick}>
      Delete
    </Button>
  );
};

export default DeleteUser;
