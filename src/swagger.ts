import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PotatoDB API",
      version: "1.0.0",
      description: "API documentation for PotatoDB",
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL,
      },
    ],
  },
  apis: ["./src/controllers/*.ts"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
};
