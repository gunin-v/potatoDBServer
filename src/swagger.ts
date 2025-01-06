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
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/services/products/fetch.ts"], // Укажите пути к файлам с аннотациями Swagger
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
};
