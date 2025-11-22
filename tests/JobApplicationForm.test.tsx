import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { JobApplicationForm } from '../components/JobApplicationForm';
import * as api from '../services/api';

jest.mock('../services/api');

describe('JobApplicationForm', () => {
  const mockSubmit = api.submitJobApplication as jest.Mock;

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm />);

    // Click submit empty
    await user.click(screen.getByRole('button', { name: /submit application/i }));

    // Check validations
    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(await screen.findByText('Select at least one skill')).toBeInTheDocument();
    
    // Default experience validation (first row exists by default)
    expect(await screen.findByText('Company is required')).toBeInTheDocument();
  });

  it('should toggle location field based on remote switch', async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm />);

    const locationInput = screen.getByLabelText(/preferred office location/i);
    expect(locationInput).toBeInTheDocument();

    // Click Remote Switch
    const remoteSwitch = screen.getByLabelText(/i am applying for a remote position/i);
    await user.click(remoteSwitch);

    // Location input should disappear
    await waitFor(() => {
      expect(screen.queryByLabelText(/preferred office location/i)).not.toBeInTheDocument();
    });

    // Toggle back
    await user.click(remoteSwitch);
    expect(await screen.findByLabelText(/preferred office location/i)).toBeInTheDocument();
  });

  it('should handle dynamic experience fields', async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm />);

    // Fill first experience
    const companies = screen.getAllByLabelText(/company/i);
    await user.type(companies[0], 'Tech Corp');

    // Add new experience
    await user.click(screen.getByRole('button', { name: /add job/i }));

    // Check if new fields appeared
    const newCompanies = await screen.findAllByLabelText(/company/i);
    expect(newCompanies).toHaveLength(2);

    // Delete the first one
    const deleteButtons = screen.getAllByRole('button', { name: /delete experience/i });
    await user.click(deleteButtons[0]);

    // Check count
    const finalCompanies = await screen.findAllByLabelText(/company/i);
    expect(finalCompanies).toHaveLength(1);
  });

  it('should submit data correctly', async () => {
    const user = userEvent.setup();
    render(<JobApplicationForm />);

    await user.type(screen.getByLabelText(/full name/i), 'Alice Engineer');
    
    // Select Position (MUI Select is tricky, uses listbox)
    await user.click(screen.getByLabelText(/position applied for/i));
    await user.click(screen.getByRole('option', { name: /fullstack/i }));

    // Select Skills
    await user.click(screen.getByLabelText(/skills/i));
    await user.click(screen.getByRole('option', { name: 'React' }));
    await user.click(screen.getByRole('option', { name: 'TypeScript' }));
    // Close select dropdown (click backdrop or just press escape, userEvent escape is easiest)
    await user.keyboard('{Escape}');

    // Fill Location
    await user.type(screen.getByLabelText(/preferred office location/i), 'London');

    // Fill Experience
    const companies = screen.getAllByLabelText(/company/i);
    await user.type(companies[0], 'StartUp Inc');
    
    const roles = screen.getAllByLabelText(/role/i);
    await user.type(roles[0], 'Junior Dev');

    const startDates = screen.getAllByLabelText(/start date/i);
    await user.type(startDates[0], '2020-01-01');

    mockSubmit.mockResolvedValueOnce({ success: true, ref: 'JOB-999' });

    await user.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(screen.getByText(/application submitted successfully/i)).toBeInTheDocument();
    });

    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'Alice Engineer',
      position: 'Fullstack',
      skills: expect.arrayContaining(['React', 'TypeScript']),
      experience: expect.arrayContaining([
        expect.objectContaining({ company: 'StartUp Inc' })
      ])
    }));
  });
});