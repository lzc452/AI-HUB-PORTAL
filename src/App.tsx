import { Outlet } from "react-router-dom";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return <><Outlet /><LoginDialog /><Toaster position="bottom-right" /></>;
}
