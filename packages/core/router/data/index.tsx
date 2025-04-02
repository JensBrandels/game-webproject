import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { RoutePage } from "@viking/router-page";
import { Home } from "@viking/home-page";
import { SelectionScreen } from "@viking/selection-screen";
import { GameScreen } from "@viking/game-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoutePage />,
    children: [{ path: "/", element: <Home /> }],
  },
  { path: "/selectionscreen", element: <SelectionScreen /> },
  { path: "/game", element: <GameScreen /> },
  { path: "*", element: "Under construction" },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
