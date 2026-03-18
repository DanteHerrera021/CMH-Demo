export default function Footer() {
  return (
    <footer className="bg-ui-surface py-10 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 md:px-10 xl:px-16 text-center text-slate-500">
        <p>CMH v0.1 • &copy; {new Date().getFullYear()} Captivate Exhibits</p>
      </div>
    </footer>
  );
}
