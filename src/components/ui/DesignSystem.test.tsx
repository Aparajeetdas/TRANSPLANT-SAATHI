import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogFooter,
  EmptyState,
  ErrorState,
  Footer,
  Input,
  Navigation,
  PageContainer,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './index';

describe('Phase 1: Design System & Reusable Components', () => {
  describe('PageContainer & Card', () => {
    it('renders PageContainer with title, subtitle, and badge', () => {
      render(
        <PageContainer
          title="Transplant Navigation"
          subtitle="Test Subtitle"
          badge={<Badge variant="primary">Active</Badge>}
        >
          <div>Child Content</div>
        </PageContainer>
      );
      expect(screen.getByText('Transplant Navigation')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders Card with Header, Title, and Content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card Body</CardContent>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Body')).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('renders label, input, helper text, and error state', () => {
      const { rerender } = render(
        <Input label="Email Address" helperText="Enter official email" placeholder="test@test.com" />
      );
      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByText('Enter official email')).toBeInTheDocument();

      rerender(
        <Input label="Email Address" error="Email is required" placeholder="test@test.com" />
      );
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  describe('Table Component', () => {
    it('renders table headers, rows, and cells with semantic markup', () => {
      render(
        <Table striped>
          <TableHeader>
            <TableRow>
              <TableHead>Hospital</TableHead>
              <TableHead>City</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>AIIMS New Delhi</TableCell>
              <TableCell>New Delhi</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Hospital')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();
      expect(screen.getByText('AIIMS New Delhi')).toBeInTheDocument();
      expect(screen.getByText('New Delhi')).toBeInTheDocument();
    });
  });

  describe('Dialog / Modal Component', () => {
    it('renders dialog when isOpen is true and triggers onClose', () => {
      const handleClose = vi.fn();
      render(
        <Dialog
          isOpen={true}
          onClose={handleClose}
          title="Statutory Legal Clearance"
          description="THOTA compliance notice"
        >
          <div>Dialog Content</div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </Dialog>
      );

      expect(screen.getByText('Statutory Legal Clearance')).toBeInTheDocument();
      expect(screen.getByText('THOTA compliance notice')).toBeInTheDocument();
      expect(screen.getByText('Dialog Content')).toBeInTheDocument();

      const closeBtn = screen.getByLabelText('Close dialog');
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it('does not render dialog when isOpen is false', () => {
      render(
        <Dialog isOpen={false} onClose={() => {}} title="Hidden Dialog">
          <div>Hidden Content</div>
        </Dialog>
      );
      expect(screen.queryByText('Hidden Dialog')).not.toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton Component', () => {
    it('renders text, circular, card, and table-row skeletons', () => {
      const { container } = render(
        <div>
          <Skeleton variant="text" data-testid="text-skeleton" />
          <Skeleton variant="circular" data-testid="circle-skeleton" />
          <Skeleton variant="card" data-testid="card-skeleton" />
          <Skeleton variant="table-row" data-testid="row-skeleton" />
        </div>
      );
      expect(container.querySelector('[data-testid="text-skeleton"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="circle-skeleton"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="card-skeleton"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="row-skeleton"]')).toBeInTheDocument();
    });
  });

  describe('EmptyState & ErrorState Components', () => {
    it('renders EmptyState and triggers action callback', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No Hospitals Found"
          description="Adjust your search filters"
          actionText="Clear Filters"
          onAction={handleAction}
        />
      );
      expect(screen.getByText('No Hospitals Found')).toBeInTheDocument();
      expect(screen.getByText('Adjust your search filters')).toBeInTheDocument();
      const actionBtn = screen.getByRole('button', { name: 'Clear Filters' });
      fireEvent.click(actionBtn);
      expect(handleAction).toHaveBeenCalled();
    });

    it('renders ErrorState with permission-denied variant', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          isPermissionDenied
          title="Access Restricted"
          message="Authorized hospital staff only"
          retryText="Switch Role"
          onRetry={handleRetry}
        />
      );
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(screen.getByText('Authorized hospital staff only')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: 'Switch Role' });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });
  });

  describe('Navigation & Footer Components', () => {
    it('renders Navigation with statutory THOTA header and NOTTO helpline', () => {
      render(
        <MemoryRouter>
          <Navigation brandName="Transplant Saathi" />
        </MemoryRouter>
      );
      expect(screen.getByText('Transplant Saathi')).toBeInTheDocument();
      expect(screen.getByText(/THOTA 1994/i)).toBeInTheDocument();
      expect(screen.getByText(/1800-11-4770/i)).toBeInTheDocument();
    });

    it('renders Footer with Section 19 penalty warnings and emergency helpline', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      expect(screen.getByText(/Section 19 THOTA 1994 Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/1800-11-4770/i)).toBeInTheDocument();
    });
  });
});
