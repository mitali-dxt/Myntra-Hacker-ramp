export default function TribeCard({ icon, title, description, bgColor, memberCount, productCount, coverImage, slug }) {
  return (
    <div className={`rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden ${bgColor} group cursor-pointer`}>
      {/* Cover Image Section */}
      {coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
          
          {/* Icon overlay on image */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      )}
      
      <div className={`p-6 flex flex-col flex-grow ${!coverImage ? 'items-center text-center' : ''}`}>
        {/* Icon for cards without cover image */}
        {!coverImage && (
          <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        )}
        
        <h3 className={`font-bold text-lg text-gray-800 group-hover:text-gray-900 mb-3 ${!coverImage ? 'text-center' : ''}`}>
          {title}
        </h3>
        
        {/* Trimmed description - max 2 lines */}
        <p className={`text-gray-600 text-sm mb-4 flex-grow line-clamp-2 leading-relaxed ${!coverImage ? 'text-center' : ''}`}>
          {description}
        </p>
        
        {/* Stats */}
        {(memberCount || productCount) && (
          <div className={`flex items-center gap-4 mb-4 text-xs text-gray-500 ${!coverImage ? 'justify-center' : ''}`}>
            {memberCount && (
              <span className="flex items-center gap-1">
                <span>👥</span>
                {memberCount} members
              </span>
            )}
            {productCount && (
              <span className="flex items-center gap-1">
                <span>🛍️</span>
                {productCount} products
              </span>
            )}
          </div>
        )}
        
        <div className="bg-white text-pink-500 font-bold py-2 px-4 rounded-full w-full hover:bg-pink-50 transition-colors duration-300 text-center">
          Explore Tribe
        </div>
      </div>
    </div>
  );
}