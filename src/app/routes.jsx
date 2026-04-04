import { createHashRouter, Navigate } from "react-router-dom";

import Shell from "../components/layout/Shell";
import Home from "../pages/Home";
import Library from "../pages/Library";
import Upload from "../pages/Upload";
import Image from "../pages/Image";
import NotFound from "../pages/NotFound";
import Settings from "../pages/Settings";
import { imageLoader } from "../loaders/imageLoader";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Login from "../pages/Login";
import Tags from "../pages/Tags";
import Categories from "../pages/Categories";
import Forbidden from "../pages/Forbidden";
import AdminRoute from "../components/layout/AdminRoute";

const router = createHashRouter([
  {
    element: <Shell />,
    children: [
      {
        path: "/login",
        element: <Login />
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <Navigate to="/home" replace />
          },
          {
            path: "/home",
            element: <Home />
          },
          {
            path: "/image/:id",
            element: <Image />,
            loader: imageLoader
          },
          {
            path: "/library",
            element: <Library />
          },
          {
            path: "/upload",
            element: <Upload />
          },
          {
            path: "/settings",
            element: <Settings />
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: "/settings/tags",
                element: <Tags />
              },
              {
                path: "/settings/categories",
                element: <Categories />
              }
            ]
          }
        ]
      },
      {
        path: "*",
        element: <NotFound />
      },
      {
        path: "/Forbidden",
        element: <Forbidden />
      }
    ]
  }
]);

export default router;
