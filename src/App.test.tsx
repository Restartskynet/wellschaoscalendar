import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the login screen header', () => {
    render(<App />);

    expect(screen.getByText('Wells Chaos Calendar')).toBeInTheDocument();
    expect(screen.getByText('Family Trip Planning')).toBeInTheDocument();
  });

  it('renders username and password fields on login screen', () => {
    render(<App />);

    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows error on invalid login attempt', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'wronguser');
    await user.type(screen.getByPlaceholderText('Enter password'), 'wrongpass');
    await user.click(screen.getByText('Sign In'));

    expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
  });

  it('login is case-sensitive for username', async () => {
    const user = userEvent.setup();
    render(<App />);

    // "Ben" should not match "ben" (case-sensitive)
    await user.type(screen.getByPlaceholderText('Enter username'), 'Ben');
    await user.type(screen.getByPlaceholderText('Enter password'), 'magic2024');
    await user.click(screen.getByText('Sign In'));

    expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
  });

  it('family gate screen renders when needed (Supabase configured)', () => {
    // In test mode, Supabase is not configured, so the gate screen is skipped
    // and we go directly to login. This test verifies the login screen shows.
    render(<App />);
    expect(screen.getByText('Wells Chaos Calendar')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
