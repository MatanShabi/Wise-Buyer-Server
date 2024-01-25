import initApp from "./app";
import https from 'https';
import http from 'http';
import fs from 'fs';
import swaggerUI from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"

initApp().then((app) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Wise Buyer - REST API",
        version: "1.0.1",
        description: "REST server including authentication using JWT and refresh token",
      },
      servers: [{ url: `http://localhost:${process.env.HTTPS_PORT}`, },],
    },
    apis: ["./src/routes/*.ts"],
  };
  const specs = swaggerJsDoc(options);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

  if (process.env.NODE_ENV !== 'production') {
    http.createServer(app).listen(process.env.PORT, () => {
      console.log(`Server running in development mode on http://localhost:${process.env.PORT}`);
    });
  } else {
    const options2 = {
      key: fs.readFileSync('../client-key.pem'),
      cert: fs.readFileSync('../client-cert.pem')
    };
    https.createServer(options2, app).listen(process.env.HTTPS_PORT, () => {
      console.log(`Server running in production mode on https://localhost:${process.env.HTTPS_PORT}`);
    });
  }
});
