import api, { handleApiError } from './api';
import { Comment, CreateCommentRequest, PaginatedResponse } from '../types';

export const commentService = {
  // Get comments for a post
  getCommentsByPost: async (postId: number, page = 0, size = 20): Promise<PaginatedResponse<Comment>> => {
    try {
      const response = await api.get<PaginatedResponse<Comment>>(`/comments/post/${postId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new comment
  createComment: async (postId: number, commentData: CreateCommentRequest): Promise<Comment> => {
    try {
      const response = await api.post<Comment>(`/comments/post/${postId}`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update comment
  updateComment: async (commentId: number, commentData: CreateCommentRequest): Promise<Comment> => {
    try {
      const response = await api.put<Comment>(`/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<void> => {
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};