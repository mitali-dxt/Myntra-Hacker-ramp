"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuestsPage() {
  const [quests, setQuests] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState({});
  const [votingSubmission, setVotingSubmission] = useState(null);
  const [votedSubmissions, setVotedSubmissions] = useState(new Set());
  const [productPopup, setProductPopup] = useState({ show: false, products: [] });
  const router = useRouter();

  const [submissionForm, setSubmissionForm] = useState({
    imageUrl: "",
    title: "",
    description: "",
    myntraProducts: ""
  });

  useEffect(() => {
    checkAuth();
    fetchQuests();
  }, []);

  // Debug effect to track popup state changes
  useEffect(() => {
    console.log("Popup state changed:", productPopup);
  }, [productPopup]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "me" })
      });
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuests() {
    try {
      const res = await fetch("/api/quests");
      const data = await res.json();
      setQuests(data);
    } catch (error) {
      console.error("Failed to fetch quests:", error);
    }
  }

  async function fetchSubmissions(questId) {
    try {
      const res = await fetch(`/api/quests/${questId}/submissions`);
      const data = await res.json();
      setSubmissions(data);
      
      // Extract product data for all submissions
      const productPromises = data.flatMap(submission => 
        (submission.myntraProducts || []).map(async (productUrl) => {
          if (productUrl.includes('myntra.com')) {
            try {
              const res = await fetch('/api/extract-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: productUrl })
              });
              if (res.ok) {
                const productInfo = await res.json();
                return { url: productUrl, data: productInfo };
              }
            } catch (error) {
              console.error('Error extracting product:', error);
            }
          }
          return { url: productUrl, data: null };
        })
      );
      
      const productResults = await Promise.all(productPromises);
      const productMap = {};
      productResults.forEach(result => {
        if (result.data) {
          productMap[result.url] = result.data;
        }
      });
      setProductData(productMap);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  }

  async function submitLook(e) {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(`/api/quests/${selectedQuest._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...submissionForm,
          myntraProducts: submissionForm.myntraProducts.split(",").map(p => p.trim()).filter(p => p)
        })
      });

      if (res.ok) {
        setShowSubmissionForm(false);
        setSubmissionForm({ imageUrl: "", title: "", description: "", myntraProducts: "" });
        fetchSubmissions(selectedQuest._id);
        alert("Submission successful!");
      } else {
        const error = await res.json();
        alert(error.error || "Submission failed");
      }
    } catch (error) {
      alert("Submission failed");
    }
  }

  async function voteForSubmission(submissionId) {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setVotingSubmission(submissionId);

    try {
      const res = await fetch(`/api/submissions/${submissionId}/vote`, {
        method: "POST"
      });

      if (res.ok) {
        // Add to voted submissions set
        setVotedSubmissions(prev => new Set([...prev, submissionId]));
        fetchSubmissions(selectedQuest._id);
        alert("Vote cast successfully! 🎉");
      } else {
        const error = await res.json();
        if (error.error === "You have already voted for this submission") {
          // If user already voted, add to the set
          setVotedSubmissions(prev => new Set([...prev, submissionId]));
        }
        alert(error.error || "Failed to vote");
      }
    } catch (error) {
      alert("Failed to vote");
    } finally {
      setVotingSubmission(null);
    }
  }

  function canUserVote(submission) {
    if (!user) return false;
    // Allow voting during both active and voting phases for better UX
    if (selectedQuest?.status !== 'voting' && selectedQuest?.status !== 'active') return false;
    if (submission.userId?._id === user._id) return false; // Can't vote for own submission
    if (votedSubmissions.has(submission._id)) return false; // Already voted
    return true;
  }

  function hasUserVoted(submissionId) {
    return votedSubmissions.has(submissionId);
  }

  function getUserSubmission() {
    if (!user) return null;
    return submissions.find(s => s.userId?._id === user._id);
  }

  function getLeaderboard() {
    return [...submissions]
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 5);
  }

  function showProductPopup(products, event) {
    console.log("showProductPopup called", products);
    event.preventDefault();
    event.stopPropagation();
    
    // Use the same logic as the working force popup
    setProductPopup(prev => ({
      show: true,
      products: products.map(url => ({ url, data: productData[url] }))
    }));
  }

  function hideProductPopup() {
    setProductPopup(prev => ({ show: false, products: [] }));
  }

  function getEnhancedBuyLink(originalUrl) {
    // Add /buy suffix to Myntra URLs for enhanced tracking
    if (originalUrl.includes('myntra.com') && !originalUrl.includes('/buy')) {
      return originalUrl + '/buy';
    }
    return originalUrl;
  }

  function getStatusColor(status) {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'voting': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'upcoming': return 'Coming Soon';
      case 'active': return 'Submit Now';
      case 'voting': return 'Vote Now';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (selectedQuest) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <button
          onClick={() => setSelectedQuest(null)}
          className="text-slate-600 hover:text-slate-800 mb-6 flex items-center"
        >
          ← Back to Quests
        </button>

        {/* Enhanced Quest Header */}
        <div className="relative overflow-hidden text-white rounded-2xl shadow-2xl mb-8"
            style={{ backgroundImage: 'url("/bg-quest.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
          
          <div className="relative p-8 lg:p-12">
            {selectedQuest.coverImageUrl && (
              <div className="mb-8 relative">
                <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg h-[20vh]">
                  <img
                    src={selectedQuest.coverImageUrl}
                    alt={selectedQuest.title}
                    className="w-full h-[20vh] object-cover"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div> */}
                </div>
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <span className="text-sm font-medium">🎯 Style Quest</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                {selectedQuest.title}
              </h1>
              <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                {selectedQuest.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    📅
                  </div>
                  <div className="font-semibold text-lg">Submission Period</div>
                </div>
                <div className="text-white/90">
                  {new Date(selectedQuest.submissionStartDate).toLocaleDateString()} - {new Date(selectedQuest.submissionEndDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    🗳️
                  </div>
                  <div className="font-semibold text-lg">Voting Ends</div>
                </div>
                <div className="text-white/90">
                  {new Date(selectedQuest.votingEndDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    🏆
                  </div>
                  <div className="font-semibold text-lg">Prize</div>
                </div>
                <div className="text-white/90">
                  {selectedQuest.prizeDiscountPercentage > 0 && (
                    <span className="inline-block bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold mr-2">
                      {selectedQuest.prizeDiscountPercentage}% Off
                    </span>
                  )}
                  {selectedQuest.prizeBadgeName && (
                    <span className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                      {selectedQuest.prizeBadgeName} Badge
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedQuest.status === 'active' && user && (
              <div className="text-center">
                <button
                  onClick={() => setShowSubmissionForm(true)}
                  className="bg-white text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🎨 Submit Your Look
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submission Form Modal */}
        {showSubmissionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Submit Your Look</h2>
              <form onSubmit={submitLook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={submissionForm.imageUrl}
                    onChange={e => setSubmissionForm({...submissionForm, imageUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://example.com/your-look.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Look Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionForm.title}
                    onChange={e => setSubmissionForm({...submissionForm, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="My Monsoon Magic Look"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={submissionForm.description}
                    onChange={e => setSubmissionForm({...submissionForm, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Describe your look and inspiration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Myntra Products (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={submissionForm.myntraProducts}
                    onChange={e => setSubmissionForm({...submissionForm, myntraProducts: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Product 1, Product 2, Product 3"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                  >
                    Submit Look
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submissions Gallery with Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                🏆 Leaderboard
              </h3>
              
              {getLeaderboard().length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No submissions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {getLeaderboard().map((submission, index) => (
                    <div key={submission._id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                      index === 0 ? 'bg-amber-50 border border-amber-200' :
                      index === 1 ? 'bg-slate-50 border border-slate-200' :
                      index === 2 ? 'bg-orange-50 border border-orange-200' :
                      'bg-gray-50'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {submission.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {submission.userId?.displayName || submission.userId?.username}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-amber-600">
                        {submission.voteCount || 0} ❤️
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* User's Submission Status */}
              {user && selectedQuest.status === 'active' && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Your Status</h4>
                  {getUserSubmission() ? (
                    <div className="text-sm text-slate-700">
                      ✅ You've submitted your look!
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700">
                      📝 Submit your look to participate
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Submissions Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">
                Submissions ({submissions.length})
                {selectedQuest.status === 'voting' && (
                  <span className="text-sm font-normal text-gray-600 ml-2">- Vote for your favorites!</span>
                )}
                {selectedQuest.status === 'active' && (
                  <span className="text-sm font-normal text-green-600 ml-2">- Submit your look and vote for others!</span>
                )}
              </h2>

              {submissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">👗</div>
                  <div className="text-lg font-medium mb-2">No submissions yet</div>
                  <div>Be the first to submit your amazing look!</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {submissions.map((submission, index) => (
                    <div key={submission._id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="aspect-square bg-gray-200 relative">
                        <img
                          src={submission.imageUrl}
                          alt={submission.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-bold text-gray-800 shadow">
                          #{index + 1}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white rounded px-3 py-1 text-sm flex items-center">
                          ❤️ {submission.voteCount || 0}
                        </div>
                        {submission.userId?._id === user?._id && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                            Your Look
                          </div>
                        )}
                        
                        {/* Products indicator */}
                        {submission.myntraProducts && submission.myntraProducts.length > 0 && (
                          <button
                            onClick={(e) => showProductPopup(submission.myntraProducts, e)}
                            className="absolute bottom-2 right-2 bg-slate-600 hover:bg-slate-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                            title={`View ${submission.myntraProducts.length} products`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-900 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                              {submission.myntraProducts.length}
                            </span>
                          </button>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 text-lg">{submission.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{submission.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="font-medium">by {submission.userId?.displayName || submission.userId?.username}</span>
                          <span>{new Date(submission.submissionDate).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Voting Button */}
                        {canUserVote(submission) && (
                          <button
                            onClick={() => voteForSubmission(submission._id)}
                            disabled={votingSubmission === submission._id}
                            className="w-full bg-gradient-to-r from-slate-600 to-slate-800 text-white py-2 rounded-md hover:from-slate-700 hover:to-slate-900 transition-all duration-300 font-medium disabled:opacity-50"
                          >
                            {votingSubmission === submission._id ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Voting...
                              </span>
                            ) : (
                              "💖 Vote for This Look"
                            )}
                          </button>
                        )}

                        {/* Already Voted Button */}
                        {hasUserVoted(submission._id) && user && submission.userId?._id !== user._id && (selectedQuest.status === 'voting' || selectedQuest.status === 'active') && (
                          <button
                            disabled
                            className="w-full bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 rounded-md text-center text-sm font-medium cursor-not-allowed"
                          >
                            ✅ You Voted for This Look
                          </button>
                        )}
                        
                        {submission.userId?._id === user?._id && (selectedQuest.status === 'voting' || selectedQuest.status === 'active') && (
                          <div className="w-full bg-slate-100 text-slate-700 py-2 rounded-md text-center text-sm font-medium">
                            Your Submission • {submission.voteCount || 0} votes
                          </div>
                        )}
                        
                        {!canUserVote(submission) && !hasUserVoted(submission._id) && submission.userId?._id !== user?._id && (selectedQuest.status === 'voting' || selectedQuest.status === 'active') && (
                          <div className="w-full bg-gray-100 text-gray-500 py-2 rounded-md text-center text-sm">
                            {!user ? "Login to vote" : "Voting not available"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {productPopup.show === true && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">
          {console.log("Actually rendering popup now!")}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={hideProductPopup}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto relative z-[9999] mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                🛍️ Featured Products ({productPopup.products.length})
              </h3>
              <button 
                onClick={hideProductPopup}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {productPopup.products.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {item.data ? (
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.data.images[0]} 
                        alt={item.data.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.data.name}
                        </h4>
                        <p className="text-gray-600 text-xs mb-2">
                          {item.data.brand} • <span className="font-bold text-green-600">{item.data.price}</span>
                        </p>
                        <a 
                          href={getEnhancedBuyLink(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-gradient-to-r from-slate-600 to-slate-800 text-white text-xs px-4 py-2 rounded-full hover:from-slate-700 hover:to-slate-900 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          🛒 Buy Now
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-500 text-sm mb-3">Product details not available</div>
                      <a 
                        href={getEnhancedBuyLink(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-slate-500 hover:bg-slate-600 text-white text-xs px-4 py-2 rounded-full transition-all duration-300 font-medium"
                      >
                        🔗 View Product
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239333ea' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-20 animate-bounce delay-1000"></div>
        
        <div className="container mx-auto px-4 lg:px-8 py-16 relative">
          <div className="text-center mb-16">
            {/* Animated Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="animate-pulse mr-2">✨</span>
              Welcome to Style Quests
              <span className="animate-pulse ml-2">✨</span>
            </div>
            
            {/* Main Title with Gradient */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent animate-pulse">
                Style
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                Quests
              </span>
              <div className="inline-block ml-4">
                <span className="text-4xl animate-bounce">🎨</span>
              </div>
            </h1>
            
            {/* Subtitle with Animation */}
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8 font-medium">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Ignite your fashion creativity and win big! 
              </span>
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent font-bold">
                Complete style challenges to unlock exclusive discounts and badges.
              </span>
            </p>
            
            {/* Call to Action Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1">
                <span className="flex items-center">
                  🚀 Start Your Journey
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button className="group bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1">
                <span className="flex items-center">
                  🏆 View Leaderboard
                  <svg className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </button>
            </div> */}
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl font-black text-slate-700 mb-2">1000+</div>
                <div className="text-gray-700 font-semibold">Active Participants</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl font-black text-amber-600 mb-2">50+</div>
                <div className="text-gray-700 font-semibold">Style Challenges</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="text-3xl font-black text-slate-800 mb-2">₹10L+</div>
                <div className="text-gray-700 font-semibold">Prizes Won</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 lg:px-8 pb-8">
        {/* Enhanced Authentication Banner */}
        {!user && (
          <div className="relative bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 mb-12 text-center overflow-hidden shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            <div className="relative">
              <div className="text-2xl mb-4">🎭</div>
              <h3 className="text-white text-xl font-bold mb-3">Join the Fashion Revolution!</h3>
              <p className="text-slate-100 mb-6 text-lg">
                <a href="/auth/login" className="underline font-bold hover:text-white transition-colors duration-300">Login</a> 
                <span className="mx-2">or</span>
                <a href="/auth/signup" className="underline font-bold hover:text-white transition-colors duration-300">Sign up</a> 
                <span className="block mt-2">to participate in Style Quests and vote for your favorites!</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/auth/signup" className="bg-white text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  🚀 Get Started Free
                </a>
                <a href="/auth/login" className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  👋 Welcome Back
                </a>
              </div>
            </div>
          </div>
        )}

      {/* Quest Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {['upcoming', 'active', 'voting'].map(status => {
          const statusQuests = quests.filter(q => q.status === status);
          if (statusQuests.length === 0) return null;
          
          const getStatusIcon = (status) => {
            switch (status) {
              case 'upcoming': return '🚀';
              case 'active': return '⚡';
              case 'voting': return '🗳️';
              default: return '📝';
            }
          };
          
          const getStatusGradient = (status) => {
            switch (status) {
              case 'upcoming': return 'from-slate-500 to-slate-700';
              case 'active': return 'from-emerald-500 to-emerald-700';
              case 'voting': return 'from-amber-500 to-amber-700';
              default: return 'from-gray-400 to-gray-600';
            }
          };
          
          return (
            <div key={status} className="group relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getStatusGradient(status)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 capitalize group-hover:text-slate-700 transition-colors duration-300">
                      {status} Quests
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className={`bg-gradient-to-r ${getStatusGradient(status)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm`}>
                        {statusQuests.length} Quest{statusQuests.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {status === 'upcoming' && "🌟 Get ready for upcoming challenges and prepare your creative looks"}
                  {status === 'active' && "🎨 Submit your amazing looks now and showcase your style"}
                  {status === 'voting' && "💝 Vote for your favorite submissions and support creators"}
                </p>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((statusQuests.length / quests.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getStatusGradient(status)} h-2 rounded-full transition-all duration-500 group-hover:bg-opacity-80`}
                      style={{ width: `${(statusQuests.length / quests.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quests Grid */}
      {quests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🎨</div>
          <div className="text-xl text-gray-600 mb-4 font-medium">No quests available at the moment</div>
          <p className="text-gray-500">Check back soon for exciting style challenges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quests.map((quest, index) => (
            <div
              key={quest._id}
              className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
              onClick={() => {
                setSelectedQuest(quest);
                fetchSubmissions(quest._id);
              }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400 via-amber-500 to-slate-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              
              {/* Image Section with Overlay */}
              <div className="relative h-56 overflow-hidden">
                {quest.coverImageUrl ? (
                  <>
                    <img
                      src={quest.coverImageUrl}
                      alt={quest.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400/80 to-amber-600/80 flex items-center justify-center text-white text-2xl font-bold" style={{display: 'none'}}>
                      <span className="text-center px-4">{quest.title}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-500 via-amber-500 to-slate-700 flex items-center justify-center text-white relative overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                      }}></div>
                    </div>
                    <div className="relative text-center px-4">
                      <div className="text-3xl mb-2">✨</div>
                      <span className="text-xl font-bold">{quest.title}</span>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${getStatusColor(quest.status)} border border-white/20`}>
                    {getStatusText(quest.status)}
                  </span>
                </div>
                
                {/* Quest Number */}
                <div className="absolute top-4 left-4">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/30">
                    {index + 1}
                  </div>
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-gray-900 font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View Details →
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6 relative">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-slate-700 transition-colors duration-300">
                  {quest.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {quest.description}
                </p>
                
                {/* Date Information */}
                <div className="mb-4">
                  {quest.status === 'upcoming' && (
                    <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Starts: {new Date(quest.submissionStartDate).toLocaleDateString()}
                    </div>
                  )}
                  {quest.status === 'active' && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ends: {new Date(quest.submissionEndDate).toLocaleDateString()}
                    </div>
                  )}
                  {quest.status === 'voting' && (
                    <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 8h10m-5 4v6m-3-6h6" />
                      </svg>
                      Voting ends: {new Date(quest.votingEndDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {/* Prize Section */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  {quest.prizeDiscountPercentage > 0 && (
                    <span className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      🎁 {quest.prizeDiscountPercentage}% Off
                    </span>
                  )}
                  {quest.prizeBadgeName && (
                    <span className="inline-flex items-center bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      🏆 {quest.prizeBadgeName}
                    </span>
                  )}
                  {!quest.prizeDiscountPercentage && !quest.prizeBadgeName && (
                    <span className="text-xs text-gray-400 italic">Amazing prizes await!</span>
                  )}
                </div>
                
                {/* Decorative Element */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-amber-100 to-transparent rounded-tl-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>
    </div>
  );
}


