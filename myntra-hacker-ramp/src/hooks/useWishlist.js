import { useState, useEffect } from 'react';

// Default moods definition (outside component to prevent recreation)
const defaultMoods = [
  { id: 'general', name: 'General', color: '#6b7280', items: [] },
  { id: 'party', name: 'Party', color: '#f59e0b', items: [] },
  { id: 'college', name: 'College', color: '#10b981', items: [] }
];

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [moods, setMoods] = useState(defaultMoods); // Initialize with default moods

  // Load wishlist from localStorage on mount
  useEffect(() => {
    console.log('useWishlist useEffect running...'); // Debug log
    try {
      const savedWishlist = localStorage.getItem('myntra-wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
      
      const savedMoods = localStorage.getItem('myntra-wishlist-moods');
      console.log('Saved moods from localStorage:', savedMoods); // Debug log
      
      if (savedMoods) {
        const parsedMoods = JSON.parse(savedMoods);
        console.log('Parsed moods:', parsedMoods); // Debug log
        
        // Merge saved moods with defaults (in case new defaults were added)
        const mergedMoods = [...defaultMoods];
        parsedMoods.forEach(savedMood => {
          const existingIndex = mergedMoods.findIndex(m => m.id === savedMood.id);
          if (existingIndex >= 0) {
            mergedMoods[existingIndex] = savedMood; // Update existing
          } else {
            mergedMoods.push(savedMood); // Add new custom mood
          }
        });
        
        setMoods(mergedMoods);
      }
      // If no saved moods, keep the default ones already initialized
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      // Keep default moods on error
    }
  }, []);

  // Save wishlist to localStorage whenever wishlistItems changes
  useEffect(() => {
    try {
      localStorage.setItem('myntra-wishlist', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlistItems]);

  // Save moods to localStorage whenever moods changes
  useEffect(() => {
    console.log('Moods state changed, saving to localStorage:', moods); // Debug log
    try {
      localStorage.setItem('myntra-wishlist-moods', JSON.stringify(moods));
    } catch (error) {
      console.error('Error saving moods to localStorage:', error);
    }
  }, [moods]);

  // Add item to wishlist
  const addToWishlist = (product, moodId = 'general') => {
    setWishlistItems(prevItems => {
      // Check if item already exists
      const existingItem = prevItems.find(item => item.product._id === product._id);
      
      if (existingItem) {
        return prevItems; // Don't add duplicate
      }

      const newItem = {
        id: `wishlist-${product._id}-${Date.now()}`,
        product,
        moodId,
        addedAt: new Date().toISOString()
      };

      return [...prevItems, newItem];
    });

    // Add to mood's items list
    setMoods(prevMoods => 
      prevMoods.map(mood => 
        mood.id === moodId 
          ? { ...mood, items: [...mood.items, product._id] }
          : mood
      )
    );
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    const item = wishlistItems.find(item => item.product._id === productId);
    
    setWishlistItems(prevItems => 
      prevItems.filter(item => item.product._id !== productId)
    );

    // Remove from mood's items list
    if (item) {
      setMoods(prevMoods => 
        prevMoods.map(mood => 
          mood.id === item.moodId 
            ? { ...mood, items: mood.items.filter(id => id !== productId) }
            : mood
        )
      );
    }
  };

  // Move item between moods
  const moveToMood = (productId, newMoodId) => {
    const item = wishlistItems.find(item => item.product._id === productId);
    if (!item) return;

    const oldMoodId = item.moodId;

    // Update wishlist item's mood
    setWishlistItems(prevItems =>
      prevItems.map(item =>
        item.product._id === productId
          ? { ...item, moodId: newMoodId }
          : item
      )
    );

    // Update moods
    setMoods(prevMoods =>
      prevMoods.map(mood => {
        if (mood.id === oldMoodId) {
          return { ...mood, items: mood.items.filter(id => id !== productId) };
        }
        if (mood.id === newMoodId) {
          return { ...mood, items: [...mood.items, productId] };
        }
        return mood;
      })
    );
  };

  // Create new mood
  const createMood = (name, color = '#6b7280') => {
    const newMood = {
      id: `mood-${Date.now()}`,
      name,
      color,
      items: []
    };
    setMoods(prevMoods => [...prevMoods, newMood]);
    return newMood.id;
  };

  // Delete mood (moves items to general)
  const deleteMood = (moodId) => {
    if (moodId === 'general') return; // Can't delete general mood
    
    const mood = moods.find(m => m.id === moodId);
    if (!mood) return;

    // Move all items from this mood to general
    mood.items.forEach(productId => {
      moveToMood(productId, 'general');
    });

    // Remove the mood
    setMoods(prevMoods => prevMoods.filter(m => m.id !== moodId));
  };

  // Get items by mood
  const getItemsByMood = (moodId) => {
    return wishlistItems.filter(item => item.moodId === moodId);
  };

  // Toggle item in wishlist
  const toggleWishlist = (product, moodId = 'general') => {
    const isInWishlist = wishlistItems.some(item => item.product._id === product._id);
    
    if (isInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product, moodId);
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
    // Reset all moods to empty
    setMoods(prevMoods => 
      prevMoods.map(mood => ({ ...mood, items: [] }))
    );
  };

  // Get total items count
  const getTotalItems = () => {
    return wishlistItems.length;
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product._id === productId);
  };

  // Move item from wishlist to cart
  const moveToCart = (productId, addToCartFunction) => {
    const wishlistItem = wishlistItems.find(item => item.product._id === productId);
    if (wishlistItem) {
      addToCartFunction(wishlistItem.product);
      removeFromWishlist(productId);
    }
  };

  return {
    wishlistItems,
    moods,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    getTotalItems,
    isInWishlist,
    moveToCart,
    moveToMood,
    createMood,
    deleteMood,
    getItemsByMood
  };
};