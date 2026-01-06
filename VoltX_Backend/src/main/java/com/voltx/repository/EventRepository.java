package com.voltx.repository;

import com.voltx.entity.Event;
import com.voltx.entity.User;
import com.voltx.enums.EventModerationStatus;
import com.voltx.enums.EventLifecycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByOrganizer(User organizer);

    List<Event> findByModerationStatus(EventModerationStatus status);

    List<Event> findByLifecycleStatus(EventLifecycleStatus status);

    Optional<Event> findByEventCode(String eventCode);
}
