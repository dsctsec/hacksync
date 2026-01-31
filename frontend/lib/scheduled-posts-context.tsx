"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { ScheduledPost } from "@/lib/calendar-data"
import { samplePosts } from "@/lib/calendar-data"

const STORAGE_KEY = "socialnest-scheduled-posts"

interface ScheduledPostsContextType {
  posts: ScheduledPost[]
  addPost: (post: ScheduledPost) => void
  removePost: (postId: string) => void
  updatePost: (postId: string, updates: Partial<ScheduledPost>) => void
  clearPosts: () => void
}

const ScheduledPostsContext = createContext<ScheduledPostsContextType | undefined>(undefined)

export function ScheduledPostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load posts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const postsWithDates = parsed.map((post: any) => ({
          ...post,
          scheduledFor: new Date(post.scheduledFor),
        }))
        setPosts(postsWithDates)
      } else {
        // Initialize with sample posts if no stored data
        setPosts(samplePosts)
      }
    } catch (error) {
      console.error("Failed to load scheduled posts from localStorage:", error)
      setPosts(samplePosts)
    }
    setIsInitialized(true)
  }, [])

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
      } catch (error) {
        console.error("Failed to save scheduled posts to localStorage:", error)
      }
    }
  }, [posts, isInitialized])

  const addPost = useCallback((post: ScheduledPost) => {
    setPosts((prev) => [...prev, post])
  }, [])

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
  }, [])

  const updatePost = useCallback((postId: string, updates: Partial<ScheduledPost>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    )
  }, [])

  const clearPosts = useCallback(() => {
    setPosts([])
  }, [])

  return (
    <ScheduledPostsContext.Provider
      value={{
        posts,
        addPost,
        removePost,
        updatePost,
        clearPosts,
      }}
    >
      {children}
    </ScheduledPostsContext.Provider>
  )
}

export function useScheduledPosts() {
  const context = useContext(ScheduledPostsContext)
  if (context === undefined) {
    throw new Error("useScheduledPosts must be used within a ScheduledPostsProvider")
  }
  return context
}
