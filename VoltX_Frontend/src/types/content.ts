import { UserCard } from './user';

export interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  location?: string;
  type: string;
  riskLevel: string;
  author: UserCard;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
  mediaUrl?: string;
  location?: string;
  type: 'SOLO' | 'SQUAD';
  riskLevel: 'LOW' | 'MEDIUM' | 'HARD';
}

export interface Comment {
  id: number;
  content: string;
  author: UserCard;
  postId: number;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  maxParticipants: number;
  currentParticipants: number;
  riskLevel: string;
  organizer: UserCard;
  moderationStatus: string;
  lifecycleStatus: string;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  maxParticipants: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HARD';
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}