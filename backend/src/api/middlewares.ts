import express from "express"
import path from "path"
import type { MiddlewaresConfig } from "@medusajs/medusa"

export const config: MiddlewaresConfig = {
  routes: [
    {
      matcher: "/static/*",
      middlewares: [
        express.static(path.resolve(process.cwd(), "static"))
      ],
    },
  ],
}
