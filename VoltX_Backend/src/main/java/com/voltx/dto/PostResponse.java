package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;
    private UserCardResponse author;
    private String postType;
    private String caption;
    private List<String> mediaUrls;
    private String location;
    private Long eventId;
    private String eventName;
    private boolean edited;
    private long likesCount;
    private long commentsCount;
    private boolean likedByCurrentUser;
    private String createdAt;
}
