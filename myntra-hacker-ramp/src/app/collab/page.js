"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import SessionCreator from '@/components/collab/SessionCreator';
import CollabRoom from '@/components/collab/CollabRoom';

export default function CollabPage() {
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const joinCode = searchParams.get('join');

  useEffect(() => {
    // If there's a join code in URL, auto-fill the join form
    if (joinCode) {
      // This will be handled by SessionCreator component
    }
  }, [joinCode]);

  const handleSessionCreated = (newSession, user) => {
    setSession(newSession);
    setUserName(user);
  };

  const handleLeaveSession = () => {
    setSession(null);
    setUserName("");
    // Clear URL parameters
    window.history.replaceState({}, '', '/collab');
  };

  if (session) {
    return (
      <CollabRoom
        session={session}
        userName={userName}
        onLeave={handleLeaveSession}
      />
    );
  }

  return (
    <SessionCreator 
      onSessionCreated={handleSessionCreated}
      initialJoinCode={joinCode}
    />
  );
}


