'use client';

import { useState } from 'react';
import { Search, Image as ImageIcon, X } from 'lucide-react';

export default function SearchForm({ onSearch, isLoading }) {
  const [textQuery, setTextQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    document.getElementById('image-upload-input').value = null;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!textQuery && !imageFile) {
      alert('Please enter a text query or upload an image.');
      return;
    }
    onSearch({ textQuery, imageFile });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="relative flex flex-col sm:flex-row items-center gap-4">

        {/* Image Upload Area */}
        <div className="flex-shrink-0">
          <label htmlFor="image-upload-input" className="cursor-pointer w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-pink-500 hover:bg-gray-50 transition-colors">
            {previewUrl ? (
              <div className="relative w-full h-full">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <ImageIcon className="text-gray-400" size={32} />
            )}
          </label>
          <input id="image-upload-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Text Input */}
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder="Describe what you're looking for..."
            className="w-full h-14 bg-gray-100 rounded-md pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isLoading} className="w-full sm:w-auto h-14 px-8 bg-pink-500 text-white font-bold rounded-md hover:bg-pink-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
          {isLoading ? '...' : 'Search'}
        </button>
      </div>
    </form>
  );
}