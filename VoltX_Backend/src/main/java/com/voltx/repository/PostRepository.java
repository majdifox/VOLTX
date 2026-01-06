package com.voltx.repository;

import com.voltx.entity.Event;
import com.voltx.entity.Post;
import com.voltx.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    List<Post> findByEvent(Event event);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
