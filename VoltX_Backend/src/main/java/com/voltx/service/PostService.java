package com.voltx.service;

import com.voltx.dto.CreatePostRequest;
import com.voltx.dto.PostResponse;
import com.voltx.entity.Post;
import com.voltx.entity.User;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.PostRepository;
import lombok.RequiredArgsConstructor;
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
}
