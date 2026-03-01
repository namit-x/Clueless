"use client";

import { useState } from "react";
import { eventSettings } from "./mockData";
import { toast } from "@/hooks/use-toast";

type EventSettings = {
  eventName: string;
  eventDescription: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationOpen: boolean;
};

export default function EventSettingsTab() {
  const [form, setForm] = useState<EventSettings>({
    ...eventSettings,
  });

  const handleSave = () => {
    // Later: call API here
    toast({
      title: "Settings saved",
      description: "Event settings have been updated.",
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass space-y-6 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Event Settings
        </h3>

        <Field label="Event Name">
          <input
            value={form.eventName}
            onChange={(e) =>
              setForm({ ...form, eventName: e.target.value })
            }
            className="input-style"
          />
        </Field>

        <Field label="Event Description">
          <textarea
            rows={3}
            value={form.eventDescription}
            onChange={(e) =>
              setForm({
                ...form,
                eventDescription: e.target.value,
              })
            }
            className="input-style resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Min Team Size">
            <input
              type="number"
              value={form.minTeamSize}
              onChange={(e) =>
                setForm({
                  ...form,
                  minTeamSize: Number(e.target.value) || 0,
                })
              }
              className="input-style"
            />
          </Field>

          <Field label="Max Team Size">
            <input
              type="number"
              value={form.maxTeamSize}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxTeamSize: Number(e.target.value) || 0,
                })
              }
              className="input-style"
            />
          </Field>
        </div>

        {/* Registration Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">
            Registration Open
          </span>

          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                registrationOpen: !form.registrationOpen,
              })
            }
            className={`relative h-6 w-11 rounded-full transition-colors ${
              form.registrationOpen
                ? "bg-[#8fff00]"
                : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                form.registrationOpen
                  ? "left-[22px]"
                  : "left-0.5"
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-[#8fff00]/90 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#8fff00]"
        >
          Save Settings
        </button>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .input-style {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--muted) / 0.5);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
          transition: border-color 0.2s;
        }

        .input-style:focus {
          border-color: rgba(143, 255, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}