export default function CreatorDropCard({ creatorName, collectionName, imageUrl, startsAt, endsAt, productCount }) {
  // Default status for when dates are not provided
  const getStatus = () => {
    if (!startsAt || !endsAt) {
      return { text: 'Available', color: 'bg-gray-500', textColor: 'text-gray-600' };
    }
    
    const now = new Date();
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    
    const isActive = now >= startDate && now <= endDate;
    const isUpcoming = now < startDate;
    const isEnded = now > endDate;
    
    if (isUpcoming) return { text: 'Coming Soon', color: 'bg-blue-500', textColor: 'text-blue-600' };
    if (isActive) return { text: 'Live Now', color: 'bg-green-500', textColor: 'text-green-600' };
    if (isEnded) return { text: 'Ended', color: 'bg-gray-500', textColor: 'text-gray-600' };
    
    // Fallback
    return { text: 'Available', color: 'bg-gray-500', textColor: 'text-gray-600' };
  };
  
  const status = getStatus();
  
  return (
    <div className="flex-shrink-0 w-64 md:w-72 mr-6 group transform hover:-translate-y-2 transition-transform duration-300">
      <div className="rounded-lg overflow-hidden shadow-lg relative">
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 ${status.color} text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg`}>
          {status.text}
        </div>
        
        <img src={imageUrl} alt={creatorName} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300" />
        
        <div className="p-4 bg-white">
          <p className="font-bold text-lg text-gray-800">{creatorName}'s Edit</p>
          <p className="text-sm text-gray-500 mb-2">{collectionName}</p>
          
          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className={`${status.textColor} font-semibold`}>{status.text}</span>
            {productCount && (
              <span className="flex items-center gap-1">
                🛍️ {productCount} items
              </span>
            )}
          </div>
          
          {/* Date Info */}
          {(startsAt || endsAt) && (
            <div className="mt-2 text-xs text-gray-400">
              {startsAt && endsAt && (
                <>
                  {new Date() < new Date(startsAt) && (
                    <span>Starts: {new Date(startsAt).toLocaleDateString()}</span>
                  )}
                  {new Date() >= new Date(startsAt) && new Date() <= new Date(endsAt) && (
                    <span>Ends: {new Date(endsAt).toLocaleDateString()}</span>
                  )}
                  {new Date() > new Date(endsAt) && (
                    <span>Ended: {new Date(endsAt).toLocaleDateString()}</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}