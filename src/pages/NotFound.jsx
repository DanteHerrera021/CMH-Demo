import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-[10rem] font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
      <Link to="/">
        <Button text="Go Back Home" className="bg-brand-primary text-white" />
      </Link>
    </div>
  );
}
