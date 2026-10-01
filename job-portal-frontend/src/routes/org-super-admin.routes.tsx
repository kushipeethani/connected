import React from 'react';
import { Routes, Route, Navigate, RouteObject } from 'react-router-dom';
import { OrgSuperAdminLayout } from '../layouts/org-super-admin/OrgSuperAdminLayout';
import { OrgSuperAdminLogin } from '../pages/organization-super-admin/Login';
import { OrgSuperAdminDashboard } from '../pages/organization-super-admin/Dashboard';
import { OrgSuperAdminInvitations } from '../pages/organization-super-admin/Invitations';
import { AdminManagement } from '../pages/organization-super-admin/AdminManagement';
import { RecruiterManagement } from '../pages/organization-super-admin/RecruiterManagement';
import { RolesPermissions } from '../pages/organization-super-admin/RolesPermissions';
import { CreditReports } from '../pages/organization-super-admin/CreditReports';
import { OrgSuperAdminBilling } from '../pages/organization-super-admin/Billing';
import { OrgSuperAdminAnalytics } from '../pages/organization-super-admin/Analytics';
import { OrgSuperAdminOffers } from '../pages/organization-super-admin/Offers';
import { OrgSuperAdminAuditLogs } from '../pages/organization-super-admin/AuditLogs';
import { OrgSuperAdminInterviews } from '../pages/organization-super-admin/Interviews';
import { OrgSuperAdminSettings } from '../pages/organization-super-admin/Settings';

export const orgSuperAdminRoutes: RouteObject = {
  path: 'organization-super-admin',
  children: [
    { path: 'login', element: <OrgSuperAdminLogin /> },
    {
      element: <OrgSuperAdminLayout />,
      children: [
        { path: '', element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <OrgSuperAdminDashboard /> },
        { path: 'invitations', element: <OrgSuperAdminInvitations /> },
        { path: 'admins', element: <AdminManagement /> },
        { path: 'recruiters', element: <RecruiterManagement /> },
        { path: 'roles', element: <RolesPermissions /> },
        { path: 'tokens', element: <CreditReports /> },
        { path: 'billing', element: <OrgSuperAdminBilling /> },
        { path: 'analytics', element: <OrgSuperAdminAnalytics /> },
        { path: 'offers', element: <OrgSuperAdminOffers /> },
        { path: 'audit', element: <OrgSuperAdminAuditLogs /> },
        { path: 'interviews', element: <OrgSuperAdminInterviews /> },
        { path: 'settings', element: <OrgSuperAdminSettings /> },
        { path: '*', element: <Navigate to="dashboard" replace /> },
      ],
    },
  ],
};

export const OrgSuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<OrgSuperAdminLogin />} />
      <Route element={<OrgSuperAdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrgSuperAdminDashboard />} />
        <Route path="invitations" element={<OrgSuperAdminInvitations />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="recruiters" element={<RecruiterManagement />} />
        <Route path="roles" element={<RolesPermissions />} />
        <Route path="tokens" element={<CreditReports />} />
        <Route path="billing" element={<OrgSuperAdminBilling />} />
        <Route path="analytics" element={<OrgSuperAdminAnalytics />} />
        <Route path="offers" element={<OrgSuperAdminOffers />} />
        <Route path="audit" element={<OrgSuperAdminAuditLogs />} />
        <Route path="interviews" element={<OrgSuperAdminInterviews />} />
        <Route path="settings" element={<OrgSuperAdminSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};
