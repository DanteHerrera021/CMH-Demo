export default function Card({ title, value, icon }) {
  return (
    <div className="shadow p-4 rounded-lg flex items-center gap-4 bg-ui-surface">
      <div>{icon}</div>
      <div>
        <h2 className="text-2xl font-bold">{value}</h2>
        <p className="text-slate-500">{title}</p>
      </div>
    </div>
  );
}
