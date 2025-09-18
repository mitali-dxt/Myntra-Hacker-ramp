"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Heart, ThumbsUp, ShoppingBag } from 'lucide-react';

export default function LiveChat({ session, userName, sendMessage }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update messages from session
  useEffect(() => {
    if (session?.messages) {
      setMessages(session.messages);
    }
  }, [session?.messages]);

  const emojis = ['😍', '❤️', '👍', '🔥', '✨', '🛍️', '👗', '👠', '💄', '💅', '🎉', '😂', '😊', '👌', '💯'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage, userName);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const sendQuickReaction = (emoji) => {
    const message = {
      id: Date.now(),
      user: userName,
      message: emoji,
      timestamp: new Date(),
      type: 'reaction'
    };
    setMessages(prev => [...prev, message]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg._id || msg.id} className={`flex ${msg.userName === userName ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs ${
              msg.type === 'system' 
                ? 'bg-slate-100 text-slate-600 text-center w-full' 
                : msg.userName === userName 
                  ? 'bg-gradient-to-r from-slate-600 to-slate-800 text-white' 
                  : 'bg-stone-100 text-stone-800'
            } rounded-2xl px-4 py-2 shadow-sm`}>
              {msg.type !== 'system' && msg.userName !== userName && (
                <div className="text-xs font-semibold mb-1 text-amber-600">{msg.userName}</div>
              )}
              <div className={`${msg.type === 'reaction' ? 'text-2xl' : 'text-sm'}`}>
                {msg.message}
              </div>
              <div className={`text-xs mt-1 ${
                msg.userName === userName ? 'text-white/70' : 'text-gray-500'
              }`}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">Quick Reactions</span>
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {['❤️', '👍', '🔥', '😍', '🛍️'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendQuickReaction(emoji)}
              className="flex-shrink-0 w-10 h-10 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-lg transition-all duration-300 transform hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="relative">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-12 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-all duration-300"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-full flex items-center justify-center hover:from-slate-700 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-lg border border-gray-200 p-3 z-10">
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="w-10 h-10 hover:bg-gray-100 rounded-xl flex items-center justify-center text-lg transition-all duration-300 transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Typing Indicator */}
        <div className="mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
}