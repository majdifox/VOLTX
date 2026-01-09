package com.voltx.service;

import com.voltx.dto.CommentResponse;
import com.voltx.dto.CreateCommentRequest;
import com.voltx.entity.Comment;
import com.voltx.entity.Post;
import com.voltx.entity.User;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.CommentRepository;
import com.voltx.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;

    public Comment findById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }

    @Transactional
    public Comment createComment(User author, Long postId, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(author)
                .post(post)
                .build();

        comment = commentRepository.save(comment);
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return comment;
    }

    public Page<Comment> getCommentsByPost(Long postId, Pageable pageable) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return commentRepository.findByPostOrderByCreatedAtDesc(post, pageable);
    }

    @Transactional
    public Comment updateComment(Long commentId, User user, CreateCommentRequest request) {
        Comment comment = findById(commentId);

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = findById(commentId);

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own comments");
        }

        Post post = comment.getPost();
        commentRepository.delete(comment);
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);
    }

    public CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(userService.toCardResponse(comment.getAuthor()))
                .postId(comment.getPost().getId())
                .createdAt(comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null)
                .build();
    }
}
