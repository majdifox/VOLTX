package com.voltx.service;

import com.voltx.dto.CreateEventRequest;
import com.voltx.dto.EventResponse;
import com.voltx.entity.Event;
import com.voltx.entity.User;
import com.voltx.enums.EventLifecycleStatus;
import com.voltx.enums.EventModerationStatus;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserService userService;

    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    @Transactional
    public Event createEvent(User organizer, CreateEventRequest request) {
        LocalDateTime eventDate = LocalDateTime.parse(request.getEventDate(), DateTimeFormatter.ISO_DATE_TIME);

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .eventDate(eventDate)
                .maxParticipants(request.getMaxParticipants())
                .riskLevel(request.getRiskLevel())
                .organizer(organizer)
                .moderationStatus(EventModerationStatus.PENDING_REVIEW)
                .lifecycleStatus(EventLifecycleStatus.UPCOMING)
                .currentParticipants(0)
                .build();

        return eventRepository.save(event);
    }

    public Page<Event> getUpcomingEvents(Pageable pageable) {
        return eventRepository.findByLifecycleStatusOrderByEventDateAsc(
                EventLifecycleStatus.UPCOMING, pageable);
    }

    public Page<Event> getEventsByOrganizer(User organizer, Pageable pageable) {
        return eventRepository.findByOrganizerOrderByEventDateDesc(organizer, pageable);
    }

    @Transactional
    public Event updateEvent(Long eventId, User user, CreateEventRequest request) {
        Event event = findById(eventId);

        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new BadRequestException("Only the organizer can edit this event");
        }

        if (request.getTitle() != null) {
            event.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            event.setLocation(request.getLocation());
        }
        if (request.getMaxParticipants() != null) {
            event.setMaxParticipants(request.getMaxParticipants());
        }

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long eventId, User user) {
        Event event = findById(eventId);

        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new BadRequestException("Only the organizer can delete this event");
        }

        eventRepository.delete(event);
    }

    public EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .eventDate(event.getEventDate() != null ? event.getEventDate().toString() : null)
                .maxParticipants(event.getMaxParticipants())
                .currentParticipants(event.getCurrentParticipants())
                .riskLevel(event.getRiskLevel().name())
                .organizer(userService.toCardResponse(event.getOrganizer()))
                .moderationStatus(event.getModerationStatus().name())
                .lifecycleStatus(event.getLifecycleStatus().name())
                .createdAt(event.getCreatedAt() != null ? event.getCreatedAt().toString() : null)
                .build();
    }
}
