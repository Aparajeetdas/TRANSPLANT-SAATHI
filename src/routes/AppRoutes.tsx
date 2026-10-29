import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminPortal } from '../features/admin/AdminPortal';
import { HospitalStaffPortal } from '../features/hospital/HospitalStaffPortal';
import { VolunteerPortal } from '../features/volunteer/VolunteerPortal';
import { VolunteerRequestDetailPage } from '../features/volunteer/VolunteerRequestDetailPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { DonorDashboardPage } from '../pages/donor/DonorDashboardPage';
import { DonorRegisterPage } from '../pages/donor/DonorRegisterPage';
import { PatientDashboardPage } from '../pages/patient/PatientDashboardPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { DesignSystemShowcasePage } from '../pages/public/DesignSystemShowcasePage';
import { DirectoryPage } from '../pages/public/DirectoryPage';
import { HomePage } from '../pages/public/HomePage';
import { HospitalDetailPage } from '../pages/public/HospitalDetailPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { PrivacyPage } from '../pages/public/PrivacyPage';
import { ResourcesPage } from '../pages/public/ResourcesPage';
import { SafetyLimitationsPage } from '../pages/public/SafetyLimitationsPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Public Website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/safety-and-limitations" element={<SafetyLimitationsPage />} />
          <Route path="/design-system" element={<DesignSystemShowcasePage />} />

          {/* Authentication */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/unauthorized" element={<UnauthorizedPage />} />

          {/* Organ Donor Registration & Private Dashboard */}
          <Route path="/donor/register" element={<DonorRegisterPage />} />
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['donor', 'patient', 'family', 'admin']}>
                <DonorDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Role Portals (Protected Routes) */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient', 'family', 'admin']}>
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                <VolunteerPortal onRequestNewSupport={() => {}} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/requests/:id"
            element={
              <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                <VolunteerRequestDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital"
            element={
              <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                <HospitalStaffPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
