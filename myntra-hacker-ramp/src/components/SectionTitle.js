export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold tracking-tight text-gray-800">{title}</h2>
      <p className="text-md text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}