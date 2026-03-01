"use client";

import { useState } from "react";
import { UserPlus, Trash2, ArrowUpDown } from "lucide-react";

import { adminUsers, type AdminUser } from "./mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "@/hooks/use-toast";

type Role = AdminUser["role"];

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: Role;
  }>({
    name: "",
    email: "",
    role: "Sub-admin",
  });

  const toggleRole = (id: string) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              role: u.role === "Admin" ? "Sub-admin" : "Admin",
            }
          : u
      )
    );

  const removeUser = (id: string) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  const addUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast({
        title: "Invalid input",
        description: "Name and Email are required.",
      });
      return;
    }

    setUsers((prev) => [
      ...prev,
      { ...newUser, id: Date.now().toString() },
    ]);

    setNewUser({
      name: "",
      email: "",
      role: "Sub-admin",
    });

    setShowAdd(false);

    toast({ title: "User added" });
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-[#8fff00]/90 px-4 py-2 text-sm font-bold text-black transition-all hover:bg-[#8fff00]"
        >
          <UserPlus className="h-4 w-4" />
          Add Admin
        </button>
      </div>

      {/* Table */}
      <div className="glass overflow-x-auto rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/30"
              >
                <td className="p-4 font-medium text-foreground">
                  {u.name}
                </td>

                <td className="p-4 text-muted-foreground">
                  {u.email}
                </td>

                <td className="p-4">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      u.role === "Admin"
                        ? "bg-[#8fff00]/15 text-[#8fff00] border-[#8fff00]/30"
                        : "bg-cyan-400/15 text-cyan-400 border-cyan-400/30"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Change Role"
                      onClick={() => toggleRole(u.id)}
                      className="rounded-md p-1.5 transition-colors hover:bg-muted"
                    >
                      <ArrowUpDown className="h-4 w-4 text-cyan-400" />
                    </button>

                    <button
                      title="Remove"
                      onClick={() => removeUser(u.id)}
                      className="rounded-md p-1.5 transition-colors hover:bg-muted"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Admin Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Admin
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#8fff00]/50"
            />

            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#8fff00]/50"
            />

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role: e.target.value as Role,
                })
              }
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#8fff00]/50"
            >
              <option value="Admin">Admin</option>
              <option value="Sub-admin">Sub-admin</option>
            </select>

            <button
              onClick={addUser}
              className="w-full rounded-lg bg-[#8fff00]/90 py-2.5 text-sm font-bold text-black hover:bg-[#8fff00]"
            >
              Add User
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}