"use client";

import RegistrationToggle from "./RegistrationToggle";

/**
 * Render the Settings panel containing a heading and the registration toggle.
 *
 * @returns The React element for the Settings panel containing an `h2` labeled "Settings" and the `RegistrationToggle` component.
 */
export default function SettingsPanel() {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <RegistrationToggle />
        </div>
    );
}
