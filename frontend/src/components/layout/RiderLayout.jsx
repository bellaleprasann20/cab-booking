
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function RiderLayout() {
  return (
    <div className="min-h-screen bg-[#080d18] text-white">
      <Navbar />
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
