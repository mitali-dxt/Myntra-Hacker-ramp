"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminSubmissions() {
  const [quest, setQuest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const challengeId = params.challengeId;

  useEffect(() => {
    checkAuth();
    fetchQuestDetails();
    fetchSubmissions();
  }, [challengeId]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "me" })
      });
      const data = await res.json();
      
      if (!data.user || data.user.role !== "ADMIN") {
        router.push("/auth/login");
        return;
      }
    } catch (error) {
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestDetails() {
    try {
      const res = await fetch(`/api/quests/${challengeId}`);
      if (res.ok) {
        const data = await res.json();
        setQuest(data);
      }
    } catch (error) {
      console.error("Failed to fetch quest details:", error);
    }
  }

  async function fetchSubmissions() {
    try {
      const res = await fetch(`/api/admin/submissions/${challengeId}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push("/admin")}
          className="text-pink-600 hover:text-pink-800 mb-4 flex items-center"
        >
          ← Back to Dashboard
        </button>
        
        {quest && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quest.title}</h1>
            <p className="text-gray-600 mb-4">{quest.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Status: <span className="font-medium">{quest.status}</span></span>
              <span>Submissions: {submissions.length}</span>
              {quest.prizeDiscountPercentage > 0 && (
                <span>Prize: {quest.prizeDiscountPercentage}% discount</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Submissions ({submissions.length})
          </h2>
        </div>

        {submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No submissions yet for this quest.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {submissions.map((submission, index) => (
              <div key={submission._id} className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-200 relative">
                  {submission.imageUrl ? (
                    <img
                      src={submission.imageUrl}
                      alt={submission.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-medium text-gray-800">
                    #{index + 1}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-sm">
                    {submission.voteCount} votes
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{submission.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{submission.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>by {submission.userId?.displayName || submission.userId?.username}</span>
                    <span>{new Date(submission.submissionDate).toLocaleDateString()}</span>
                  </div>
                  
                  {submission.myntraProducts && submission.myntraProducts.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Products: {submission.myntraProducts.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}