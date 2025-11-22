import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { RegistrationWizard } from '../components/RegistrationWizard';
import * as api from '../services/api';

// Mock the API layer only
jest.mock('../services/api');

describe('RegistrationWizard', () => {
  const mockSubmit = api.submitRegistration as jest.Mock;

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('should navigate through steps and submit the form successfully', async () => {
    const user = userEvent.setup();
    render(<RegistrationWizard />);

    // --- Step 1: Account Details ---
    expect(screen.getByText('Account Details')).toBeInTheDocument();

    // Try next without filling
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();

    // Fill Step 1
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /next/i }));

    // --- Step 2: Personal Info ---
    await waitFor(() => {
      expect(screen.getByText('First Name')).toBeInTheDocument();
    });

    // Fill Step 2
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    
    await user.click(screen.getByRole('button', { name: /next/i }));

    // --- Step 3: Preferences ---
    await waitFor(() => {
      expect(screen.getByText('Preferences')).toBeInTheDocument();
    });

    // Verify Summary
    expect(screen.getByText(/Email: test@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Name: John Doe/)).toBeInTheDocument();

    // Mock successful API response
    mockSubmit.mockResolvedValueOnce({ success: true, id: 'REG-123' });

    // Submit
    await user.click(screen.getByRole('button', { name: /complete registration/i }));

    // --- Success State ---
    await waitFor(() => {
      expect(screen.getByText('Registration Complete!')).toBeInTheDocument();
    });
    expect(screen.getByText(/REG-123/)).toBeInTheDocument();
    
    // Verify API was called with correct data structure
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      firstName: 'John',
      newsletter: true // Default value
    }));
  });

  it('should display error message if API fails', async () => {
    const user = userEvent.setup();
    render(<RegistrationWizard />);

    // Fast forward to end (helper function in real app, manual here for transparency)
    await user.type(screen.getByLabelText(/email/i), 'fail@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Mock API Error
    mockSubmit.mockRejectedValueOnce(new Error('Server error'));

    await user.click(screen.getByRole('button', { name: /complete registration/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to submit registration/i)).toBeInTheDocument();
    });
  });
});