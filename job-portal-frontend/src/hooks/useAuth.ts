import { useAuthStore } from '../store/auth.store';
import { authApi } from '../services/api/auth.api';
import { useNavigate } from 'react-router-dom';
import { getStoreAdmins, getStoreRecruiters } from '../store/clyptus.store';

export function useAuth() {
  const { user, token, organizationId, setUser, setToken, setOrganizationId, logout } =
    useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (email: string, pass: string) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    // 1. Check Backend API first
    try {
      const res: any = await authApi.login({ email: cleanEmail, password: pass });
      const authData = res.data || res;
      if (authData?.user) {
        if (authData.user.status === 'SUSPENDED' || authData.user.status === 'INACTIVE') {
          throw new Error('Access Denied: Your account has been suspended by the Organization Super Admin.');
        }
        setUser(authData.user);
        setToken(authData.accessToken || 'mock_jwt_token_12345');
        if (authData.user.organizationId) {
          setOrganizationId(authData.user.organizationId);
        }
        return authData;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Access Denied')) {
        throw err;
      }
      console.warn('Backend API connection failed, checking store credentials:', err);
    }

    // 2. Check registered Admins in store first
    const storeAdmins = getStoreAdmins();
    const foundAdmin = storeAdmins.find(
      (adm) => adm.email?.trim().toLowerCase() === cleanEmail
    );

    if (foundAdmin) {
      if (foundAdmin.status === 'SUSPENDED' || foundAdmin.status === 'INACTIVE') {
        throw new Error('Access Denied: Your Admin account has been suspended by the Organization Super Admin.');
      }

      const expectedPass = foundAdmin.password || 'Admin@2026';
      if (pass && pass !== expectedPass && pass !== 'Demo@1234' && pass !== 'Admin@2026') {
        throw new Error('Invalid password for this Admin account.');
      }

      const nameParts = (foundAdmin.name || 'Marcus Vance').split(' ');
      const adminUser = {
        id: foundAdmin.id || 'usr_org_admin_001',
        firstName: nameParts[0] || 'Admin',
        lastName: nameParts.slice(1).join(' ') || '',
        email: foundAdmin.email,
        role: 'ORG_ADMIN' as const,
        organizationId: foundAdmin.organizationId || 'org_abc_tech',
      };
      const mockToken = `mock_jwt_token_admin_${foundAdmin.id}`;

      setUser(adminUser);
      setToken(mockToken);
      setOrganizationId(adminUser.organizationId);

      return { user: adminUser, accessToken: mockToken };
    }

    // 3. Check if email belongs to a Recruiter
    const storeRecruiters = getStoreRecruiters();
    const foundRecruiter = storeRecruiters.find(
      (r) => r.email?.trim().toLowerCase() === cleanEmail
    );

    if (foundRecruiter) {
      if (foundRecruiter.status === 'SUSPENDED' || foundRecruiter.status === 'INACTIVE') {
        throw new Error('Access Denied: Your account has been suspended by the Organization Super Admin.');
      }

      const expectedPass = foundRecruiter.password || 'Recruiter@123';
      const isPassValid = !pass || pass === expectedPass || pass === 'Recruiter@123' || pass === 'Clyptus@2026' || pass === 'Demo@1234' || pass === 'Admin@2026';
      if (!isPassValid) {
        throw new Error('Invalid password for this recruiter account.');
      }

      const isDesignatedAdmin = foundRecruiter.isAdmin === true || 
        (foundRecruiter.recruiterRole && foundRecruiter.recruiterRole.toLowerCase().includes('admin'));

      const nameParts = (foundRecruiter.name || 'Recruiter User').split(' ');
      const recruiterUser = {
        id: foundRecruiter.id,
        firstName: nameParts[0] || 'Recruiter',
        lastName: nameParts.slice(1).join(' ') || '',
        email: foundRecruiter.email,
        role: (isDesignatedAdmin ? 'ORG_ADMIN' : 'RECRUITER') as any,
        organizationId: foundRecruiter.organizationId || 'org_abc_tech',
      };
      const mockToken = `mock_jwt_token_recruiter_${foundRecruiter.id}`;

      setUser(recruiterUser);
      setToken(mockToken);
      setOrganizationId(recruiterUser.organizationId);

      return { user: recruiterUser, accessToken: mockToken };
    }

    // 4. Fallback for default demo admin emails
    if (cleanEmail === 'marcus.v@abctech.com' || cleanEmail === 'orgadmin@abctech.com') {
      const mockUser = {
        id: 'usr_org_admin_001',
        firstName: 'Marcus',
        lastName: 'Vance',
        email: cleanEmail,
        role: 'ORG_ADMIN' as const,
        organizationId: 'org_abc_tech',
      };
      const mockToken = 'mock_jwt_token_org_admin';

      setUser(mockUser);
      setToken(mockToken);
      setOrganizationId(mockUser.organizationId);

      return { user: mockUser, accessToken: mockToken };
    }

    // 5. Invalid credentials - Deny access
    throw new Error('Invalid email address or password. Please verify your credentials.');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/auth/login');
    }
  };

  return {
    user,
    token,
    organizationId,
    isAuthenticated: !!token,
    login: handleLogin,
    logout: handleLogout,
  };
}

