import React from 'react';
import { ButtonGroup, Button, Col } from 'react-bootstrap';

const FilterUser = ({ handleFilter }) => {
  return (
    <Col md={4}>
      <h5>Filter By Status:</h5>
      <ButtonGroup>
        <Button variant="success" onClick={() => handleFilter('Active')}>
          Active
        </Button>
        <Button
          variant="danger"
          className="ms-2"
          onClick={() => handleFilter('Inactive')}
        >
          Inactive
        </Button>
      </ButtonGroup>
    </Col>
  );
};

export default FilterUser;
