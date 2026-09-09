/**
 * Core Type Definitions for "Building the Mind with Joss"
 */

export type Locale = "en" | "ti" | "am";

export type Role = "ADMIN" | "STUDENT";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseCategory = "FULL_STACK" | "ENGLISH";

export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Course {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  category: CourseCategory;
  level?: EnglishLevel;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: Date;
}

export interface Module {
  id: string;
  courseId: string;
  title: Record<Locale, string>;
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: Record<Locale, string>;
  description?: Record<Locale, string>;
  videoUrl?: string;
  durationMinutes?: number;
  order: number;
  isPublished: boolean;
}
