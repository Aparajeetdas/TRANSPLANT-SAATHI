import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { DEMO_PROFILES, VERIFIED_HOSPITALS } from '../../lib/mockData';
import {
  getHospitalRequestsForPatient,
  getStoredHospitalRequests,
  saveStoredHospitalRequests,
  setStoredUser
} from '../../lib/store';
import { UserProfile } from '../../types';
import {
  HospitalAssistanceRequestModal,
  isValidEmail,
  isValidIndianMobile
} from './HospitalAssistanceRequestModal';

const mockPatient: UserProfile = DEMO_PROFILES.find((p) => p.id === 'demo-patient') as UserProfile;
const aiimsHospital = VERIFIED_HOSPITALS[0];

const renderModal = (props?: { initialOrgan?: any }) => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <HospitalAssistanceRequestModal
          isOpen={true}
          onClose={vi.fn()}
          hospital={aiimsHospital}
          {...props}
        />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('Hospital Assistance Request Form Validation & Submission Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    saveStoredHospitalRequests([]);
    setStoredUser(mockPatient);
  });

  describe('Validation Helpers', () => {
    it('validates Indian mobile numbers with optional prefixes', () => {
      // Valid Indian mobile numbers (10 digits starting with 6, 7, 8, or 9)
      expect(isValidIndianMobile('+91-98765-43210')).toBe(true);
      expect(isValidIndianMobile('+91 98765 43210')).toBe(true);
      expect(isValidIndianMobile('919876543210')).toBe(true);
      expect(isValidIndianMobile('9876543210')).toBe(true);
      expect(isValidIndianMobile('09876543210')).toBe(true);
      expect(isValidIndianMobile('+91-81234-56789')).toBe(true);
      expect(isValidIndianMobile('+91-71234-56789')).toBe(true);
      expect(isValidIndianMobile('+91-61234-56789')).toBe(true);

      // Invalid phone numbers
      expect(isValidIndianMobile('12345')).toBe(false);
      expect(isValidIndianMobile('abcdefghij')).toBe(false);
      expect(isValidIndianMobile('+91-12345-67890')).toBe(false); // starts with 1
      expect(isValidIndianMobile('')).toBe(false);
      expect(isValidIndianMobile('   ')).toBe(false);
    });

    it('validates RFC-compliant email formats and trims whitespace', () => {
      expect(isValidEmail('patient@example.com')).toBe(true);
      expect(isValidEmail(' patient.sharma@hospital.org.in ')).toBe(true);
      expect(isValidEmail('test.name+tag@sub.domain.co')).toBe(true);

      expect(isValidEmail('bademail')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Form Validation UI & Character Counter', () => {
    it('displays live character counter and explains minimum length requirement', () => {
      renderModal();

      // Check initial character counter
      expect(screen.getByText(/0\/10 min characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Minimum 10 characters required/i)).toBeInTheDocument();

      const descInput = screen.getByLabelText(/short description of assistance needed/i);
      
      // Type 9 characters (under 10 minimum)
      fireEvent.change(descInput, { target: { value: 'Need help' } });
      expect(screen.getByText(/9\/10 min characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Please provide at least 10 characters \(9 entered so far\)/i)).toBeInTheDocument();

      // Submit button is disabled
      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      expect(submitBtn).toBeDisabled();

      // Add characters to reach valid length
      fireEvent.change(descInput, { target: { value: 'Need help with Form 1 registration' } });
      expect(screen.getByText(/34\/10 min characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Description meets minimum length requirement/i)).toBeInTheDocument();
    });

    it('trims whitespace and rejects whitespace-only descriptions', () => {
      renderModal();
      const descInput = screen.getByLabelText(/short description of assistance needed/i);

      // Whitespace only
      fireEvent.change(descInput, { target: { value: '            ' } });
      expect(screen.getByText(/0\/10 min characters/i)).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      expect(submitBtn).toBeDisabled();
    });

    it('shows inline error messages when phone number format is invalid', () => {
      renderModal();

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, { target: { value: '999' } });

      expect(
        screen.getByText(/Please enter a valid 10-digit Indian mobile number/i)
      ).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      expect(submitBtn).toBeDisabled();

      // Correct phone number
      fireEvent.change(phoneInput, { target: { value: '+91-98765-43210' } });
      expect(screen.getByText(/Valid 10-digit mobile number/i)).toBeInTheDocument();
    });

    it('shows inline error messages when email format is invalid', () => {
      renderModal();

      // Switch to Email contact method
      const methodSelect = screen.getByLabelText(/contact method/i);
      fireEvent.change(methodSelect, { target: { value: 'email' } });

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email-string' } });

      expect(
        screen.getByText(/Please enter a valid email address/i)
      ).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      expect(submitBtn).toBeDisabled();

      // Correct email
      fireEvent.change(emailInput, { target: { value: 'caregiver@example.com' } });
      expect(screen.getByText(/Valid email address format/i)).toBeInTheDocument();
    });

    it('keeps submit button disabled until description, phone, and consent are all valid', async () => {
      renderModal();

      const descInput = screen.getByLabelText(/short description of assistance needed/i);
      const consentCheckbox = screen.getByLabelText(/I consent to transmitting this assistance inquiry/i);
      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });

      // Initially disabled
      expect(submitBtn).toBeDisabled();

      // Enter valid description
      fireEvent.change(descInput, { target: { value: 'Need assistance regarding Form 1 living donor paperwork.' } });
      expect(submitBtn).toBeDisabled(); // Still disabled because consent is missing

      // Check consent
      fireEvent.click(consentCheckbox);
      expect(submitBtn).toBeEnabled(); // Now enabled!

      // Uncheck consent
      fireEvent.click(consentCheckbox);
      expect(submitBtn).toBeDisabled(); // Disabled again
    });
  });

  describe('Submission, Loading State & My Requests Persistence', () => {
    it('submits successfully, displays reference number, and saves to My Requests', async () => {
      renderModal();

      const descInput = screen.getByLabelText(/short description of assistance needed/i);
      fireEvent.change(descInput, {
        target: { value: 'Requesting consultation on Form 1 living-donor affidavits and SOTTO verification.' }
      });

      const consentCheckbox = screen.getByLabelText(/I consent to transmitting this assistance inquiry/i);
      fireEvent.click(consentCheckbox);

      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      expect(submitBtn).toBeEnabled();

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Assistance Request Confirmed')).toBeInTheDocument();
      });

      // Verify reference number is displayed
      const refElements = screen.getAllByText(/TS-REQ-2026-/);
      expect(refElements.length).toBeGreaterThan(0);

      // Verify request is saved in store for this patient (My Requests)
      const patientRequests = getHospitalRequestsForPatient(mockPatient.id);
      expect(patientRequests.length).toBe(1);
      expect(patientRequests[0].hospitalId).toBe(aiimsHospital.id);
      expect(patientRequests[0].description).toBe(
        'Requesting consultation on Form 1 living-donor affidavits and SOTTO verification.'
      );
      expect(patientRequests[0].status).toBe('submitted');
    });

    it('prevents accidental duplicate submission when already submitting', async () => {
      renderModal();

      const descInput = screen.getByLabelText(/short description of assistance needed/i);
      fireEvent.change(descInput, {
        target: { value: 'Inquiry regarding renal transplant waitlist protocols.' }
      });

      const consentCheckbox = screen.getByLabelText(/I consent to transmitting this assistance inquiry/i);
      fireEvent.click(consentCheckbox);

      const submitBtn = screen.getByRole('button', { name: /submit assistance request/i });
      fireEvent.click(submitBtn);

      // Rapidly clicking again should not create duplicate
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Assistance Request Confirmed')).toBeInTheDocument();
      });

      const allStored = getStoredHospitalRequests();
      expect(allStored.length).toBe(1);
    });
  });
});
