"use client";

import { Crown, User, Clock } from 'lucide-react';

export default function ParticipantsList({ session, userName }) {
  const participants = session.participants || [];
  const hostId = session.hostId; // Get host ID from session

  return (
    <div className="p-4 h-full">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 mb-2">Participants ({participants.length})</h3>
        <p className="text-xs text-gray-500">Everyone shopping together</p>
      </div>

      <div className="space-y-3">
        {participants.map((participant, index) => {
          // Handle both string and object formats for backward compatibility
          const participantName = typeof participant === 'string' ? participant : participant.userName;
          const participantId = typeof participant === 'string' ? participant : participant.userId;
          
          return (
            <div key={participantId || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {participantName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 text-sm">{participantName}</span>
                  {(participantId === hostId || participantName === hostId) && (
                    <Crown className="w-4 h-4 text-amber-500" />
                  )}
                  {participantName === userName && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">You</span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
        <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
          <Crown className="w-4 h-4 mr-2 text-amber-500" />
          Session Info
        </h4>
        <div className="space-y-2 text-sm text-slate-700">
          <div>Host: {hostId || 'Unknown'}</div>
          <div>Code: <span className="font-mono font-bold">{session.code}</span></div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Created: {new Date(session.createdAt || session.created_at || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}