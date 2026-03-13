import { Link } from "react-router-dom";
import logo from "../../assets/imgs/captivate-exhibits-header.png";
import { Settings } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-ui-surface shadow">
      <div className="mx-auto px-6 md:px-10 xl:px-16">
        <div className="flex justify-between items-center h-[75px]">
          <div className="h-[75%]">
            <Link to="/home" className="h-full">
              <img src={logo} alt="Captivate Media Hub" className="h-full" />
            </Link>
          </div>
          <div>
            <Link to="/settings">
              <Settings
                size={36}
                strokeWidth="1.5"
                className="cursor-pointer hover:text-gray-900 hover:rotate-45 hover:scale-110 transition-transform duration-200"
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
