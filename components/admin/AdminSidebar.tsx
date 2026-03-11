"use client";

type AdminSidebarProps = {
  activeSection: string;
  onChangeSection: (section: string) => void;
};

export default function AdminSidebar({
  activeSection,
  onChangeSection,
}: AdminSidebarProps) {
  const menu = [
    { id: "games", label: "Game Control" },
    { id: "teams", label: "Team Control" },
    { id: "progress", label: "Team Progress" },
    { id: "logs", label: "Activity Logs" },
  ];

  return (
    <aside className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Admin</h2>
      </div>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeSection(item.id)}
            className={`px-3 py-2 rounded-md text-left transition ${
              activeSection === item.id
                ? "bg-white text-gray-900 font-medium"
                : "hover:bg-gray-800 text-white"
            }`} 
          >
            {item.label}
          </button>
        ))}
      </nav>
      
    </aside>
  );
}