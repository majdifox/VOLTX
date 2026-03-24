import api, { handleApiError } from './api';

export const adminService = {
  getDashboardStats: async () => {
    try { return (await api.get('/admin/stats')).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  getAllUsers: async (search = '', status = '', role = '') => {
    try { return (await api.get(`/admin/users?search=${search}&status=${status}&role=${role}`)).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  suspendUser: async (userId: number, reason: string, days: number) => {
    try { return (await api.put(`/admin/users/${userId}/suspend`, { reason, durationDays: days })).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  banUser: async (userId: number, reason: string) => {
    try { return (await api.put(`/admin/users/${userId}/ban`, { reason })).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  reactivateUser: async (userId: number) => {
    try { return (await api.put(`/admin/users/${userId}/reactivate`)).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  changeRole: async (userId: number, role: string) => {
    try { return (await api.put(`/admin/users/${userId}/role`, { role })).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  getPendingVerifications: async () => {
    try { return (await api.get('/admin/verifications/pending')).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  reviewVerification: async (id: number, status: string) => {
    try { return (await api.put(`/admin/verifications/${id}/review`, { status })).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
};

// fix(service): adminService properly passes Authorization header
