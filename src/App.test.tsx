import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the login screen header', () => {
    render(<App />);

    expect(screen.getByText('Wells Chaos Calendar')).toBeInTheDocument();
    expect(screen.getByText('Family Trip Planning')).toBeInTheDocument();
  });
});
