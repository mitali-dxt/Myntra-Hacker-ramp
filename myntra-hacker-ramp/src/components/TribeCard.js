import Link from 'next/link';
export default function TribeCard({ icon, title, description, bgColor }) {
  return (
    <div className={`p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center ${bgColor}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-lg text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm mt-2 mb-4 flex-grow">{description}</p>
      <button className="bg-white text-pink-500 font-bold py-2 px-4 rounded-full w-full hover:bg-pink-50 transition-colors duration-300">
        <Link href="/tribes">Join Now</Link>
      </button>
    </div>
  );
}