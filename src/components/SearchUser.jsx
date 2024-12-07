import React from 'react';
import { Form, Button } from 'react-bootstrap';

const SearchUser = ({ value, setValue, handleSearch, handleReset }) => {
  return (
    <Form
      style={{
        margin: 'auto',
        padding: '15px',
        maxWidth: '400px',
        alignContent: 'center',
      }}
      className="d-flex input-group w-auto"
      onSubmit={handleSearch}
    >
      <Form.Control
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit" variant="dark">
        Search
      </Button>
      <Button variant="info" onClick={handleReset} className="mx-2">
        Reset
      </Button>
    </Form>
  );
};

export default SearchUser;
