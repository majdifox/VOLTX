package com.voltx.service;

import com.voltx.dto.CreatePostRequest;
import com.voltx.dto.PostResponse;
import com.voltx.entity.Post;
import com.voltx.entity.User;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;

    public Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    @Transactional
    public Post createPost(User author, CreatePostRequest request) {
        Post post = Post.builder()
                .content(request.getContent())
                .mediaUrl(request.getMediaUrl())
                .location(request.getLocation())
                .type(request.getType())
                .riskLevel(request.getRiskLevel())
                .author(author)
                .likesCount(0)
                .commentsCount(0)
                .build();

        return postRepository.save(post);
    }

    public Page<Post> getPostsByUser(User user, Pageable pageable) {
        return postRepository.findByAuthorOrderByCreatedAtDesc(user, pageable);
    }

    public Page<Post> getFeed(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public Post updatePost(Long postId, User user, CreatePostRequest request) {
        Post post = findById(postId);

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own posts");
        }

        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getLocation() != null) {
            post.setLocation(request.getLocation());
        }

        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId, User user) {
        Post post = findById(postId);

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own posts");
        }

        postRepository.delete(post);
    }

    public PostResponse toResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .location(post.getLocation())
                .type(post.getType().name())
                .riskLevel(post.getRiskLevel().name())
                .author(userService.toCardResponse(post.getAuthor()))
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : null)
                .build();
    }
}
