"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { SessionGuard } from "./SessionGuard";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionGuard />
      {children}
    </Provider>
  );
}