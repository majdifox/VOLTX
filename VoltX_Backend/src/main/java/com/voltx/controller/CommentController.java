package com.voltx.controller;

import com.voltx.dto.CommentResponse;
import com.voltx.dto.CreateCommentRequest;
import com.voltx.entity.Comment;
import com.voltx.entity.User;
import com.voltx.service.CommentService;
import com.voltx.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        Comment comment = commentService.createComment(user, postId, request);
        CommentResponse response = commentService.toResponse(comment);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<Page<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> comments = commentService.getCommentsByPost(postId, pageable);
        Page<CommentResponse> response = comments.map(commentService::toResponse);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        Comment comment = commentService.updateComment(id, user, request);
        CommentResponse response = commentService.toResponse(comment);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        commentService.deleteComment(id, user);
        return ResponseEntity.ok().build();
    }
}
