import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { forceLogout } from "@/store/slices/authSlice";

/**
 * Hook that automatically logs out the user if they exit fullscreen.
 * Can be easily toggled on/off during development by commenting out the call.
 *
 * Usage:
 * - Enable: Call this hook in your component:
 *   useFullscreenExitLogout();
 * - Disable: Comment out the line to disable during development
 *
 * @example
 * export default function DashboardPage() {
 *   // useFullscreenExitLogout(); // Uncomment to enable logout on fullscreen exit
 *   return <div>...</div>;
 * }
 */
export function useFullscreenExitLogout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Check for fullscreen element across all browser prefixes
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      // If no element is fullscreen, user exited fullscreen
      if (!isFullscreen) {
        dispatch(forceLogout());
        alert("Session ended. You exited fullscreen mode.");
      }
    };

    // Listen for fullscreen change events (with browser prefixes)
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [dispatch]);
}
