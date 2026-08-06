//basic test to confirm the app renders without crashing
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PR Pilot app without crashing', () => {
  render(<App />);
  //check that the Connect GitHub button exists on the login screen
  const button = screen.getByText(/Connect GitHub/i);
  expect(button).toBeInTheDocument();
});