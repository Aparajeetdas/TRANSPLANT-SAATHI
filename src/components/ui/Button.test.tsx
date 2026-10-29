import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Alert } from './Alert';
import { Input } from './Input';

describe('Design System Primitives (Phase 1)', () => {
  describe('Button Component', () => {
    it('renders with children and handles clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Request Saathi</Button>);
      const btn = screen.getByRole('button', { name: /request saathi/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('displays loading state and disables button when isLoading is true', () => {
      render(<Button isLoading>Submitting</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    it('renders primary brand variant styling', () => {
      render(<Button variant="primary">Primary Action</Button>);
      const btn = screen.getByRole('button', { name: /primary action/i });
      expect(btn.className).toContain('bg-[#2563EB]');
    });
  });

  describe('Badge Component', () => {
    it('renders with subtle brand variant by default', () => {
      render(<Badge>Verified Center</Badge>);
      const badge = screen.getByText('Verified Center');
      expect(badge.parentElement?.className).toContain('bg-[#F4F8FF]');
    });

    it('renders with navy variant', () => {
      render(<Badge variant="navy">THOTA Compliant</Badge>);
      const badge = screen.getByText('THOTA Compliant');
      expect(badge.parentElement?.className).toContain('bg-[#0F172A]');
    });
  });

  describe('Alert Component', () => {
    it('renders statutory notice with title and message', () => {
      render(
        <Alert variant="statutory" title="THOTA 1994 Compliance">
          Organ donation in India is strictly altruistic.
        </Alert>
      );
      expect(screen.getByText('THOTA 1994 Compliance')).toBeInTheDocument();
      expect(screen.getByText(/organ donation in india is strictly altruistic/i)).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('renders input with label and helper text', () => {
      render(<Input label="Patient Mobile" helperText="10-digit number" placeholder="9876543210" />);
      expect(screen.getByLabelText(/patient mobile/i)).toBeInTheDocument();
      expect(screen.getByText('10-digit number')).toBeInTheDocument();
    });

    it('displays accessible error message when error prop is passed', () => {
      render(<Input label="Patient Mobile" error="Mobile number is required" />);
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toHaveTextContent('Mobile number is required');
    });
  });
});
