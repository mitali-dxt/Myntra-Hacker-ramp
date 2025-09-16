"use client";

import { useState, useEffect, useCallback } from 'react';

export function useCollabSession(initialSession, userName) {
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(!initialSession);
  const [error, setError] = useState(null);

  // Refresh session data from server
  const refreshSession = useCallback(async () => {
    if (!session?.code) return;
    
    try {
      const res = await fetch(`/api/collab?code=${session.code}`);
      if (res.ok) {
        const updatedSession = await res.json();
        setSession(updatedSession);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, [session?.code]);

  // Add item to cart
  const addItem = useCallback(async (productData, size = '', color = '', notes = '') => {
    if (!session?.code) return null;
    
    setLoading(true);
    try {
      const res = await fetch('/api/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addItem',
          code: session.code,
          productData,
          size,
          color,
          notes,
          userName
        })
      });

      if (res.ok) {
        const updatedSession = await res.json();
        setSession(updatedSession);
        return updatedSession;
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session?.code, userName]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId) => {
    if (!session?.code) return null;
    
    setLoading(true);
    try {
      const res = await fetch('/api/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeItem',
          code: session.code,
          itemId,
          userName
        })
      });

      if (res.ok) {
        const updatedSession = await res.json();
        setSession(updatedSession);
        return updatedSession;
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session?.code, userName]);

  // Vote on item
  const voteOnItem = useCallback(async (itemId, value) => {
    if (!session?.code) return null;
    
    setLoading(true);
    try {
      const res = await fetch('/api/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          code: session.code,
          itemId,
          userName,
          value
        })
      });

      if (res.ok) {
        const updatedSession = await res.json();
        setSession(updatedSession);
        return updatedSession;
      } else {
        throw new Error('Failed to vote');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session?.code, userName]);

  // Send message
  const sendMessage = useCallback(async (message) => {
    if (!session?.code || !message.trim()) return null;
    
    try {
      const res = await fetch('/api/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          code: session.code,
          message: message.trim(),
          userName
        })
      });

      if (res.ok) {
        const updatedSession = await res.json();
        setSession(updatedSession);
        return updatedSession;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [session?.code, userName]);

  // Auto-refresh session periodically
  useEffect(() => {
    if (!session?.code) return;

    const interval = setInterval(refreshSession, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refreshSession]);

  // Update session when initialSession changes
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  return {
    session,
    loading,
    error,
    refreshSession,
    addItem,
    removeItem,
    voteOnItem,
    sendMessage,
    setError
  };
}