import React from 'react';
import { Button } from 'react-bootstrap';

const EditUser = ({ handleEdit, item }) => {
  return (
    <Button variant="info" className="me-2" onClick={() => handleEdit(item)}>
      Edit
    </Button>
  );
};

export default EditUser;
