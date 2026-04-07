"use client";

import { useEffect } from "react";

/**
 * Installs global handlers that disable the right-click context menu and a set of common developer-tools keyboard shortcuts, and removes those handlers when the component unmounts.
 *
 * @returns `null` — the component renders nothing
 */
export default function DisableDevTools() {
  useEffect(() => {
    document.oncontextmenu = () => false;

    document.onkeydown = (e) => {
      if (e.ctrlKey && ["u", "U", "c", "C", "v", "V"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && ["i", "I", "c", "C", "j", "J"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
      if (e.metaKey && e.altKey && ["i", "I"].includes(e.key)) {
        e.preventDefault();
      }
    };

    return () => {
      document.oncontextmenu = null;
      document.onkeydown = null;
    };
  }, []);

  return null;
}