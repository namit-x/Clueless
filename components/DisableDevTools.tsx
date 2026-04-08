"use client";

import { useEffect } from "react";

export default function DisableDevTools() {
  useEffect(() => {
    const isProd = process.env.NODE_ENV === "production";

    // ── 1. Right-click ──────────────────────────────────────────────────────
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // ── 2. DevTools keyboard shortcuts ─────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I / J / C  (Chromium DevTools / Inspector / Console)
      if (e.ctrlKey && e.shiftKey && /^[ijcIJC]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+K  (Firefox console)
      if (e.ctrlKey && e.shiftKey && /^[kK]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      // Ctrl+U  (view source)
      if (e.ctrlKey && /^[uU]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      // Cmd+Option+I  (macOS DevTools)
      if (e.metaKey && e.altKey && /^[iI]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    if (isProd) {
      // ── 3. Suppress all console output ───────────────────────────────────
      // Prevents teams from reading game state or network responses in the console.
      const noop = () => {};
      (
        [
          "log", "warn", "error", "info", "debug",
          "table", "trace", "dir", "dirxml",
          "group", "groupCollapsed", "groupEnd",
          "count", "countReset", "time", "timeEnd",
          "timeLog", "assert", "clear", "profile", "profileEnd",
        ] as (keyof Console)[]
      ).forEach((method) => {
        try {
          (console as any)[method] = noop;
        } catch {
          // read-only in some environments — ignore
        }
      });

      // ── 4. Debugger trap ─────────────────────────────────────────────────
      // When DevTools is open with the Sources panel active, the browser
      // pauses on every tick, making the app unresponsive under inspection.
      // Has no performance impact when DevTools is closed.
      const trapId = setInterval(() => {
        // eslint-disable-next-line no-debugger
        debugger;
      }, 100);

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
        clearInterval(trapId);
      };
    }

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
