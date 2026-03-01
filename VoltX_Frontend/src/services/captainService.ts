import api, { handleApiError } from './api';

export const captainService = {
  getPendingEvents: async () => {
    try { return (await api.get('/captain/events/pending')).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  getReviewedEvents: async () => {
    try { return (await api.get('/captain/events/reviewed')).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
  reviewEvent: async (eventId: number, decision: string, reason?: string) => {
    try { return (await api.post(`/captain/events/${eventId}/review`, { decision, reason })).data; }
    catch (e) { throw new Error(handleApiError(e)); }
  },
};
