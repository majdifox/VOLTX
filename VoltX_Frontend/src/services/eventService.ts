import api, { handleApiError } from './api';
import { Event, CreateEventRequest, PaginatedResponse } from '../types';

export const eventService = {
  // Get upcoming events
  getUpcomingEvents: async (page = 0, size = 20): Promise<PaginatedResponse<Event>> => {
    try {
      const response = await api.get<PaginatedResponse<Event>>(`/events?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get event by ID
  getEventById: async (eventId: number): Promise<Event> => {
    try {
      const response = await api.get<Event>(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get events by organizer
  getEventsByOrganizer: async (organizerId: number, page = 0, size = 20): Promise<PaginatedResponse<Event>> => {
    try {
      const response = await api.get<PaginatedResponse<Event>>(`/events/organizer/${organizerId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new event
  createEvent: async (eventData: CreateEventRequest): Promise<Event> => {
    try {
      const response = await api.post<Event>('/events', eventData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update event
  updateEvent: async (eventId: number, eventData: CreateEventRequest): Promise<Event> => {
    try {
      const response = await api.put<Event>(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete event
  deleteEvent: async (eventId: number): Promise<void> => {
    try {
      await api.delete(`/events/${eventId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Join event
  joinEvent: async (eventId: number): Promise<void> => {
    try {
      await api.post(`/events/${eventId}/join`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Leave event
  leaveEvent: async (eventId: number): Promise<void> => {
    try {
      await api.delete(`/events/${eventId}/leave`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Accept member (for organizers)
  acceptMember: async (eventId: number, memberId: number): Promise<void> => {
    try {
      await api.post(`/events/${eventId}/accept/${memberId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
// Get current user's events
export const getMyEvents = async (): Promise<any[]> => {
  try {
    const { data } = await (await import('./api')).default.get('/events/my');
    return data;
  } catch { return []; }
};

// chore: final whitespace cleanup across service files
