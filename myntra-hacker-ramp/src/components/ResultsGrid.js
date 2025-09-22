'use client';

export default function ResultsGrid({ results }) {
  if (!results || results.length === 0) {
    return null; 
  }

  return (
    <div className="w-full max-w-7xl mt-12">
      <h2 className="text-2xl font-bold mb-6">Search Results</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {results.map((item, index) => (
          <div key={item.product_id || index} className="group bg-white rounded-lg shadow-md overflow-hidden">
            <div className="w-full aspect-[3/4] bg-gray-200">
              <img 
                src={item.image_url} 
                alt={item.product_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm truncate">{item.brand}</h3>
              <p className="text-xs text-gray-600 truncate">{item.product_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}