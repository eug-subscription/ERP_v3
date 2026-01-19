import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { QueryProvider } from "./providers/QueryProvider";

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
}
