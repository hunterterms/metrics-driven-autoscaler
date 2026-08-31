const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
// defining a "req duration" measurement
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

// runs for every single req
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () =>
    end({ method: req.method, route: req.path, status_code: res.statusCode }),
  );
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics()); // prometheues reads everything in register.metrics() registry
});

app.listen(PORT, () => console.log(`catalog-service listening on ${PORT}`));
