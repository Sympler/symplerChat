import React from 'react';
import { render, screen } from '@testing-library/react';
import SymplerChat from './index';

test('renders learn react link', () => {
  render(<SymplerChat urlParam='' />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
