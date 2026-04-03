import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { toastError, toastSuccess } from "../utils/toastHandler";
import Button from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function getEmailFromRole(role) {
    return role === "admin" ? "admin@captivate.app" : "employee@captivate.app";
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!password) {
      toastError("Please enter a password.");
      return;
    }

    setLoading(true);

    try {
      const email = getEmailFromRole(role);
      await signInWithEmailAndPassword(auth, email, password);

      toastSuccess("Logged in successfully.");
      navigate("/home");
    } catch (err) {
      console.error(err);
      toastError("Invalid password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ui-text">Sign In</h1>
          <p className="mt-2 text-sm text-ui-muted">
            Access the Captivate Media Hub dashboard.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-ui-border bg-ui-surface p-6 shadow-sm"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-ui-muted">
                User Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ui-muted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-ui-border bg-ui-surface px-3 py-2 text-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                placeholder="Enter password"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                text={loading ? "Signing in..." : "Sign In"}
                rounded="sm"
                className="bg-brand-primary text-white"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
