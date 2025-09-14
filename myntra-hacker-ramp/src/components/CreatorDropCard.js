export default function CreatorDropCard({ creatorName, collectionName, imageUrl }) {
  return (
    <div className="flex-shrink-0 w-64 md:w-72 mr-6 group transform hover:-translate-y-2 transition-transform duration-300">
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img src={imageUrl} alt={creatorName} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="p-4 bg-white">
          <p className="font-bold text-lg text-gray-800">{creatorName}'s Edit</p>
          <p className="text-sm text-gray-500">{collectionName}</p>
        </div>
      </div>
    </div>
  );
}