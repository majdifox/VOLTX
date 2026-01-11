import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import { Event, CreateEventRequest } from '../types';

// Hook for getting upcoming events
export const useUpcomingEvents = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['events', 'upcoming', page, size],
    queryFn: () => eventService.getUpcomingEvents(page, size),
  });
};

// Hook for getting a single event
export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !!eventId,
  });
};

// Hook for getting events by organizer
export const useOrganizerEvents = (organizerId: number, page = 0, size = 20) => {
  return useQuery({
    queryKey: ['events', 'organizer', organizerId, page, size],
    queryFn: () => eventService.getEventsByOrganizer(organizerId, page, size),
    enabled: !!organizerId,
  });
};

// Hook for creating an event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: CreateEventRequest) => eventService.createEvent(eventData),
    onSuccess: () => {
      // Invalidate events queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Hook for updating an event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: number; eventData: CreateEventRequest }) =>
      eventService.updateEvent(eventId, eventData),
    onSuccess: (data) => {
      // Update the specific event in cache
      queryClient.setQueryData(['event', data.id], data);
      // Invalidate events queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Hook for deleting an event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventService.deleteEvent(eventId),
    onSuccess: () => {
      // Invalidate events queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Hook for joining an event
export const useJoinEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventService.joinEvent(eventId),
    onSuccess: () => {
      // Invalidate events queries to refresh participant count
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Hook for leaving an event
export const useLeaveEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventService.leaveEvent(eventId),
    onSuccess: () => {
      // Invalidate events queries to refresh participant count
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};