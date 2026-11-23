import React from "react";
import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { Header } from "../../src/components/Header";
import "../../src/styles.css";
const root = createRootRoute({
  component: () => (
    <>
      <Header />
      <main style={{ minHeight: 2000 }}>
        <Outlet />
      </main>
    </>
  ),
});
const paths = [
  "/tests/fixtures/navigation.html",
  "/",
  "/shop",
  "/custom-studio",
  "/lookbook",
  "/about",
  "/contact",
  "/custom-order",
];
const routeTree = root.addChildren(
  paths.map((path) =>
    createRoute({ getParentRoute: () => root, path, component: () => <h1>Page content</h1> }),
  ),
);
const router = createRouter({ routeTree });
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
