"use client";

import RegistrationToggle from "./RegistrationToggle";

export default function SettingsPanel() {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <RegistrationToggle />
        </div>
    );
}
