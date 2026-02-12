import { RouterProvider } from "@tanstack/react-router";
import { Toast } from "@heroui/react";
import { router } from "./router";
import { QueryProvider } from "./providers/QueryProvider";

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toast.Provider />
    </QueryProvider>
  );
}
