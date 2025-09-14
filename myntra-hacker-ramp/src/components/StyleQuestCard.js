export default function StyleQuestCard({ icon, title, reward, progress }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="bg-purple-100 text-purple-600 p-3 rounded-full">{icon}</div>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{reward}</span>
      </div>
      <h3 className="font-bold text-lg text-gray-800 mt-4">{title}</h3>
      <div className="mt-auto pt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 text-right">{progress}% complete</p>
        <button className="bg-purple-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4 hover:bg-purple-700 transition-colors duration-300">
          Create a Look
        </button>
      </div>
    </div>
  );
}