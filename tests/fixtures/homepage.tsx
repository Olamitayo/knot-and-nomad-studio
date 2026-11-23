import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { StudioHomepage } from "../../src/features/three/homepage/StudioHomepage";
import "../../src/styles.css";
const root = createRootRoute({ component: () => <Outlet /> });
const routeTree = root.addChildren([
  createRoute({
    getParentRoute: () => root,
    path: "/tests/fixtures/homepage.html",
    component: () => <StudioHomepage />,
  }),
  ...["/custom-order", "/custom-studio", "/lookbook"].map((path) =>
    createRoute({ getParentRoute: () => root, path, component: () => <h1>Destination page</h1> }),
  ),
]);
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={createRouter({ routeTree })} />,
);
