import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/captivate-exhibits-header.png";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import Button from "../ui/Button";

export default function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Sign Out Error", error);
    }
  }

  return (
    <nav className="bg-ui-surface shadow">
      <div className="mx-auto px-6 md:px-10 xl:px-16">
        <div className="flex justify-between items-center h-[75px]">
          <div className="h-[75%]">
            <Link to="/home" className="h-full">
              <img src={logo} alt="Captivate Media Hub" className="h-full" />
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/settings">
              <Settings
                size={36}
                strokeWidth="1.5"
                className="cursor-pointer hover:text-gray-900 hover:rotate-45 hover:scale-110 transition-transform duration-200"
              />
            </Link>
            <Button
              text="Logout"
              rounded="sm"
              className="border border-brand-danger text-brand-danger hover:bg-brand-danger hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
