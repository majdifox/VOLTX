import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../services/postService';
import { Post, CreatePostRequest } from '../types';

// Hook for getting posts feed
export const usePosts = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['posts', page, size],
    queryFn: () => postService.getPosts(page, size),
  });
};

// Hook for getting a single post
export const usePost = (postId: number) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => postService.getPostById(postId),
    enabled: !!postId,
  });
};

// Hook for getting posts by user
export const useUserPosts = (userId: number, page = 0, size = 20) => {
  return useQuery({
    queryKey: ['posts', 'user', userId, page, size],
    queryFn: () => postService.getPostsByUser(userId, page, size),
    enabled: !!userId,
  });
};

// Hook for creating a post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: CreatePostRequest) => postService.createPost(postData),
    onSuccess: () => {
      // Invalidate posts queries to refresh the feed
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Hook for updating a post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, postData }: { postId: number; postData: CreatePostRequest }) =>
      postService.updatePost(postId, postData),
    onSuccess: (data) => {
      // Update the specific post in cache
      queryClient.setQueryData(['post', data.id], data);
      // Invalidate posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Hook for deleting a post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.deletePost(postId),
    onSuccess: () => {
      // Invalidate posts queries to refresh the feed
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Hook for liking a post
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.likePost(postId),
    onSuccess: () => {
      // Invalidate posts queries to refresh like count
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Hook for unliking a post
export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postService.unlikePost(postId),
    onSuccess: () => {
      // Invalidate posts queries to refresh like count
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};