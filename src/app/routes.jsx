import React from "react";
import { createHashRouter, Navigate } from "react-router-dom";

import Shell from "../components/layout/Shell";
import Home from "../pages/Home";
// import Library from "../pages/Library";
// import Upload from "../pages/Upload";
import Image, { imageLoader } from "../pages/Image";
import NotFound from "../pages/NotFound";

const router = createHashRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />
  },
  {
    element: <Shell />,
    children: [
      {
        path: "/home",
        element: <Home />
      },
      {
        path: "/image/:id",
        element: <Image />,
        loader: imageLoader
      },
      // {
      //   path: "/library",
      //   element: <Library />,
      // },
      // {
      //   path: "/upload",
      //   element: <Upload />,
      // },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);

export default router;
