import React from 'react';
import { Button } from 'react-bootstrap';

const EditUser = ({ onEdit, user }) => {
  return (
    <Button
      variant="info"
      size="sm"
      onClick={() => onEdit(user)}
      className="me-2"
    >
      Edit
    </Button>
  );
};

export default EditUser;
