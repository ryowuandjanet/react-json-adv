import React from 'react';
import { Form, Col } from 'react-bootstrap';

const SortUser = ({ sortValue, handleSort, sortOptions }) => {
  return (
    <Col md={8}>
      <h5>Sort By:</h5>
      <Form.Select
        style={{ width: '50%', height: '35px' }}
        onChange={handleSort}
        value={sortValue}
      >
        <option>Please Select Value</option>
        {sortOptions.map((item, index) => (
          <option value={item} key={index}>
            {item}
          </option>
        ))}
      </Form.Select>
    </Col>
  );
};

export default SortUser;
