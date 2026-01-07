package com.voltx.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Post type is required")
    private String postType;

    private String caption;

    private List<String> mediaUrls;

    private String location;

    private Long eventId;
}
