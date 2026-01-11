import api, { handleApiError } from './api';
import { Post, CreatePostRequest, PaginatedResponse } from '../types';

export const postService = {
  // Get paginated posts from feed
  getPosts: async (page = 0, size = 20): Promise<PaginatedResponse<Post>> => {
    try {
      const response = await api.get<PaginatedResponse<Post>>(`/posts?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get post by ID
  getPostById: async (postId: number): Promise<Post> => {
    try {
      const response = await api.get<Post>(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get posts by user ID
  getPostsByUser: async (userId: number, page = 0, size = 20): Promise<PaginatedResponse<Post>> => {
    try {
      const response = await api.get<PaginatedResponse<Post>>(`/posts/user/${userId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new post
  createPost: async (postData: CreatePostRequest): Promise<Post> => {
    try {
      const response = await api.post<Post>('/posts', postData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update existing post
  updatePost: async (postId: number, postData: CreatePostRequest): Promise<Post> => {
    try {
      const response = await api.put<Post>(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete post
  deletePost: async (postId: number): Promise<void> => {
    try {
      await api.delete(`/posts/${postId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Like a post
  likePost: async (postId: number): Promise<void> => {
    try {
      await api.post(`/posts/${postId}/like`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unlike a post
  unlikePost: async (postId: number): Promise<void> => {
    try {
      await api.delete(`/posts/${postId}/like`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};