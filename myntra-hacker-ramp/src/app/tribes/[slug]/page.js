"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Heart, ShoppingCart, Star, Sparkles, Package, Crown, MessageCircle, ThumbsUp, Camera, Type, Send, X, Plus } from "lucide-react";

export default function TribeDetailPage({ params }) {
  const { slug } = params;
  const [data, setData] = useState(null);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [aiProducts, setAiProducts] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    fetchTribeData();
  }, [slug]);

  const fetchTribeData = async () => {
    try {
      const response = await fetch(`/api/tribes/${slug}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching tribe data:", error);
    }
  };

  const fetchAIProducts = async () => {
    if (!data?.tribe || aiProducts.length > 0) return;
    
    setLoadingAI(true);
    try {
      const response = await fetch('/api/ai/classify-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribeName: data.tribe.name,
          tribeDescription: data.tribe.description,
          tribeTags: data.tribe.tags,
          offset: 0,
          limit: 12
        })
      });
      const result = await response.json();
      setAiProducts(result.results || []);
    } catch (error) {
      console.error("Error fetching AI products:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchFeedPosts = async () => {
    if (!data?.tribe || feedPosts.length > 0) return;
    
    setLoadingFeed(true);
    try {
      const response = await fetch(`/api/tribes/${slug}/feed`);
      if (response.ok) {
        const result = await response.json();
        setFeedPosts(result.posts || []);
      }
    } catch (error) {
      console.error("Error fetching feed posts:", error);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "ai-recommended") {
      fetchAIProducts();
    } else if (tab === "feed") {
      fetchFeedPosts();
    }
  };

  async function join() {
    if (!data) return;
    setJoining(true);
    try {
      const me = await fetch('/api/auth', { 
        method: 'POST', 
        body: JSON.stringify({ action: 'me' }) 
      }).then(r => r.json());
      
      if (!me.user) { 
        location.href = '/auth/login'; 
        return; 
      }
      
      const res = await fetch('/api/tribes', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          action: 'join', 
          tribeId: data.tribe._id, 
          userId: me.user._id 
        })
      });
      
      const updated = await res.json();
      setData({ tribe: updated, isMember: true });
    } catch (error) {
      console.error("Error joining tribe:", error);
    } finally {
      setJoining(false);
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="text-slate-600 font-medium">Loading tribe...</div>
        </div>
      </div>
    );
  }

  const { tribe, isMember } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-slate-200 to-slate-300">
          {tribe.coverImage && (
            <Image 
              src={tribe.coverImage} 
              alt={tribe.name} 
              fill 
              className="object-cover"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Tribe Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{tribe.name}</h1>
                <p className="text-white/90 text-lg mb-4 max-w-2xl">{tribe.description}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{tribe.memberCount} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>{tribe.products?.length || 0} curated products</span>
                  </div>
                </div>
              </div>
              
              {/* Join Button */}
              <div className="hidden md:block">
                {isMember ? (
                  <div className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold">
                    <Crown className="w-5 h-5" />
                    <span>Member</span>
                  </div>
                ) : (
                  <button 
                    onClick={join} 
                    disabled={joining} 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Users className="w-5 h-5" />
                    <span>{joining ? 'Joining...' : 'Join Tribe'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Join Button */}
      <div className="md:hidden p-4">
        {isMember ? (
          <div className="flex items-center justify-center space-x-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold">
            <Crown className="w-5 h-5" />
            <span>Member</span>
          </div>
        ) : (
          <button 
            onClick={join} 
            disabled={joining} 
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold"
          >
            {joining ? 'Joining...' : 'Join Tribe'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Tags */}
        {tribe.tags && tribe.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tribe.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-white text-slate-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-2xl p-1 shadow-lg border border-slate-200">
            <button
              onClick={() => handleTabChange("feed")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === "feed"
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Community Feed</span>
            </button>
            <button
              onClick={() => handleTabChange("curated")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === "curated"
                  ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Crown className="w-5 h-5" />
              <span>Curated Products</span>
              {tribe.products?.length > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {tribe.products.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("ai-recommended")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === "ai-recommended"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>AI Recommended</span>
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="min-h-[400px]">
          {activeTab === "feed" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-pink-500" />
                  <span>Community Feed</span>
                </h2>
                
                {isMember && (
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Post</span>
                  </button>
                )}
              </div>
              
              {loadingFeed ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
                          <div className="h-3 bg-slate-200 rounded w-1/6" />
                        </div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
                      <div className="h-48 bg-slate-200 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : feedPosts.length > 0 ? (
                <div className="space-y-6">
                  {feedPosts.map(post => (
                    <TribePostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-12 h-12 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No posts yet</h3>
                  <p className="text-slate-600 mb-6">Be the first to share your style with the community!</p>
                  {isMember && (
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all"
                    >
                      Create First Post
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "curated" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
                <Crown className="w-6 h-6 text-amber-500" />
                <span>Curated Collection</span>
              </h2>
              
              {tribe.products && tribe.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {tribe.products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No curated products yet</h3>
                  <p className="text-slate-600">Check back later for hand-picked products!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "ai-recommended" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <span>AI Recommended</span>
              </h2>
              
              {loadingAI ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <div className="aspect-[3/4] bg-slate-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-slate-200 rounded" />
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-6 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : aiProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {aiProducts.map(({ product, score, reason }) => (
                    <AIProductCard 
                      key={product._id} 
                      product={product} 
                      score={score} 
                      reason={reason} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Recommendations Loading</h3>
                  <p className="text-slate-600">Our AI is analyzing products for this tribe...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          tribeSlug={slug}
          onPostCreated={(newPost) => {
            setFeedPosts([newPost, ...feedPosts]);
            setShowCreatePost(false);
          }}
        />
      )}
    </div>
  );
}

// Tribe Post Card Component
function TribePostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/tribes/posts/${post._id}`, {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        setLiked(result.liked);
        setLikesCount(result.likesCount);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/tribes/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchComments = async () => {
    if (comments.length > 0) return;
    try {
      const response = await fetch(`/api/tribes/posts/${post._id}`);
      if (response.ok) {
        const result = await response.json();
        setComments(result.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {post.user?.displayName?.[0] || post.user?.username?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">
              {post.user?.displayName || post.user?.username || 'Anonymous'}
            </h4>
            <p className="text-sm text-slate-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          {post.postType === 'image' && (
            <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold">
              OOTD
            </div>
          )}
          {post.postType === 'discussion' && (
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              Discussion
            </div>
          )}
        </div>

        {/* Post Content */}
        <p className="text-slate-700 mb-4">{post.content}</p>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="relative rounded-xl overflow-hidden mb-4">
            <Image
              src={post.imageUrl}
              alt="User post"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              unoptimized
            />
            
            {/* Tagged Products Overlay */}
            {post.taggedProducts && post.taggedProducts.length > 0 && (
              <div className="absolute inset-0">
                {post.taggedProducts.map((tag, index) => (
                  <div
                    key={index}
                    className="absolute w-6 h-6 bg-white rounded-full border-2 border-pink-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                    title={tag.product?.title}
                  >
                    <ShoppingCart className="w-3 h-3 text-pink-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tagged Products List */}
        {post.taggedProducts && post.taggedProducts.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-slate-700 mb-2">Products in this look:</h5>
            <div className="flex flex-wrap gap-2">
              {post.taggedProducts.map((tag, index) => (
                <div key={index} className="bg-slate-100 rounded-lg p-2 flex items-center space-x-2 text-sm">
                  <div className="w-8 h-8 bg-slate-200 rounded"></div>
                  <div>
                    <div className="font-medium text-slate-900">{tag.product?.title}</div>
                    <div className="text-slate-600">₹{tag.product?.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center space-x-6 pt-4 border-t border-slate-100">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              liked ? "text-red-500" : "text-slate-600 hover:text-red-500"
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span className="font-medium">{likesCount}</span>
          </button>
          
          <button
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) fetchComments();
            }}
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.commentsCount || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-slate-100 p-6 pt-4 bg-slate-50">
          {/* Add Comment */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {comment.user?.displayName?.[0] || comment.user?.username?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-medium text-slate-900 text-sm">
                      {comment.user?.displayName || comment.user?.username || 'Anonymous'}
                    </div>
                    <div className="text-slate-700 text-sm">{comment.content}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Create Post Modal Component
function CreatePostModal({ isOpen, onClose, tribeSlug, onPostCreated }) {
  const [postType, setPostType] = useState("text");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tribes/${tribeSlug}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType: postType === "image" ? "image" : "discussion",
          content: content.trim(),
          imageUrl: imageUrl || null,
          taggedProducts: []
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        setContent("");
        setImageUrl("");
        setPostType("text");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Create Post</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Post Type Selection */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPostType("text")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl border-2 font-semibold transition-all ${
                postType === "text"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <Type className="w-5 h-5" />
              <span>Discussion</span>
            </button>
            <button
              type="button"
              onClick={() => setPostType("image")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl border-2 font-semibold transition-all ${
                postType === "image"
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>OOTD</span>
            </button>
          </div>

          {/* Image URL Input */}
          {postType === "image" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/your-outfit.jpg"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {postType === "image" ? "Caption" : "What's on your mind?"}
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              placeholder={
                postType === "image" 
                  ? "Tell us about your outfit..." 
                  : "Start a discussion, ask for advice, or share your thoughts..."
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Share Post"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Regular Product Card Component
function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
      <div className="relative aspect-[3/4]">
        {product.images?.[0] && (
          <Image 
            src={product.images[0]} 
            alt={product.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
          <Heart className="w-5 h-5 text-slate-600 hover:text-red-500 transition-colors" />
        </button>

        {/* Discount Badge */}
        {product.mrp && product.price && product.mrp > product.price && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm text-slate-500 mb-1">{product.brand}</div>
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm text-slate-600">{product.rating}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="font-bold text-slate-900">₹{product.price?.toLocaleString()}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-sm text-slate-500 line-through">₹{product.mrp?.toLocaleString()}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center space-x-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}

// AI Product Card Component with score
function AIProductCard({ product, score, reason }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group relative">
      {/* AI Badge */}
      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center space-x-1">
        <Sparkles className="w-3 h-3" />
        <span>{Math.round(score * 100)}%</span>
      </div>

      <div className="relative aspect-[3/4]">
        {product.images?.[0] && (
          <Image 
            src={product.images[0]} 
            alt={product.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
          <Heart className="w-5 h-5 text-slate-600 hover:text-red-500 transition-colors" />
        </button>

        {/* Discount Badge */}
        {product.mrp && product.price && product.mrp > product.price && (
          <div className="absolute bottom-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm text-slate-500 mb-1">{product.brand}</div>
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
        
        {/* AI Reason */}
        {reason && (
          <div className="text-xs text-purple-600 mb-2 italic line-clamp-2">
            "{reason.split('.')[0]}."
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="font-bold text-slate-900">₹{product.price?.toLocaleString()}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-sm text-slate-500 line-through">₹{product.mrp?.toLocaleString()}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
