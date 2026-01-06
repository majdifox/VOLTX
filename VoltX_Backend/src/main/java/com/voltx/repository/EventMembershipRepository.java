package com.voltx.repository;

import com.voltx.entity.Event;
import com.voltx.entity.EventMembership;
import com.voltx.entity.User;
import com.voltx.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventMembershipRepository extends JpaRepository<EventMembership, Long> {

    Optional<EventMembership> findByEventAndUser(Event event, User user);

    boolean existsByEventAndUser(Event event, User user);

    List<EventMembership> findByEvent(Event event);

    List<EventMembership> findByEventAndStatus(Event event, MembershipStatus status);

    List<EventMembership> findByUser(User user);

    long countByEventAndStatus(Event event, MembershipStatus status);
}
