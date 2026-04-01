"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";
import Link from "next/link";

type AdminSidebarProps = {
  activeSection: string;
  onChangeSection: (section: string) => void;
};

export default function AdminSidebar({
  activeSection,
  onChangeSection,
}: AdminSidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const menu = [
    { id: "games", label: "Game Control" },
    { id: "teams", label: "Team Control" },
    { id: "progress", label: "Team Progress" },
    { id: "logs", label: "Activity Logs" },
    { id: "settings", label: "Settings" },
  ];

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      dispatch(clearUser());
      router.replace("/login");
    }
  }

  return (
    <aside className="h-full flex flex-col">

      <Link href="/" className="mb-6 block">
        <h2 className="text-xl font-semibold hover:text-blue-300 ">
          Home
        </h2>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeSection(item.id)}
            className={`px-3 py-2 rounded-md text-left transition ${activeSection === item.id
                ? "bg-white text-gray-900 font-medium"
                : "hover:bg-gray-800 text-white"
              }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-md border border-red-400 px-3 py-2 text-left text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          Logout
        </button>
      </div> */}
    </aside>
  );
}
