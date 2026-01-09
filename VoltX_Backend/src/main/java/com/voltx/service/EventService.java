package com.voltx.service;

import com.voltx.dto.CreateEventRequest;
import com.voltx.dto.EventResponse;
import com.voltx.entity.Event;
import com.voltx.entity.EventMembership;
import com.voltx.entity.User;
import com.voltx.enums.EventLifecycleStatus;
import com.voltx.enums.EventModerationStatus;
import com.voltx.enums.MembershipStatus;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.EventMembershipRepository;
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
    private final EventMembershipRepository membershipRepository;
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

    @Transactional
    public void joinEvent(Long eventId, User user) {
        Event event = findById(eventId);

        if (event.getCurrentParticipants() >= event.getMaxParticipants()) {
            throw new BadRequestException("Event is full");
        }

        if (membershipRepository.existsByEventAndMember(event, user)) {
            throw new BadRequestException("Already joined this event");
        }

        EventMembership membership = EventMembership.builder()
                .event(event)
                .member(user)
                .status(MembershipStatus.PENDING)
                .build();

        membershipRepository.save(membership);
    }

    @Transactional
    public void leaveEvent(Long eventId, User user) {
        Event event = findById(eventId);

        EventMembership membership = membershipRepository.findByEventAndMember(event, user)
                .orElseThrow(() -> new BadRequestException("Not a member of this event"));

        membershipRepository.delete(membership);

        if (membership.getStatus() == MembershipStatus.ACCEPTED) {
            event.setCurrentParticipants(Math.max(0, event.getCurrentParticipants() - 1));
            eventRepository.save(event);
        }
    }

    @Transactional
    public void acceptMember(Long eventId, Long memberId, User organizer) {
        Event event = findById(eventId);

        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new BadRequestException("Only the organizer can accept members");
        }

        User member = userService.findById(memberId);
        EventMembership membership = membershipRepository.findByEventAndMember(event, member)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

        membership.setStatus(MembershipStatus.ACCEPTED);
        membershipRepository.save(membership);

        event.setCurrentParticipants(event.getCurrentParticipants() + 1);
        eventRepository.save(event);
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
