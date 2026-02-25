"use client";

import { useEffect } from "react";

export default function DisableDevTools() {
  useEffect(() => {
    document.oncontextmenu = () => false;

    document.onkeydown = (e) => {
      if (e.ctrlKey && ["u", "U", "c", "C"].includes(e.key)) {
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