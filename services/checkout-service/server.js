const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
// defining a "req duration" measurement
const httpRequestDuration = new client.Histogram({
  // histogram measures 'time'
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

const queueDepth = new client.Gauge({
  // gauge measures, how many checkout req are currently in line, count that goes up and down
  name: "checkout_queue_depth",
  help: "Number of checkout requests currently waiting to be processed",
});
register.registerMetric(queueDepth);

const queue = [];

const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "3", 10);
let activeWorkers = 0;

function processNext() {
  if (activeWorkers >= CONCURRENCY || queue.length === 0) return;

  const job = queue.shift(); // shift() removes and returns the first item
  queueDepth.set(queue.length);
  activeWorkers++;

  const processingTimeMs = 200 + Math.random() * 300;
  setTimeout(() => {
    job.resolve({ orderId: job.id, status: "confirmed" });
    activeWorkers--;
    processNext();
  }, processingTimeMs);
}
setInterval(processNext, 20);

app.post("/checkout", (req, res) => {
  queue.push({
    id: Math.random().toString(36).slice(2, 10),
    resolve: (r) => res.json(r),
  });
  queueDepth.set(queue.length);
});

app.listen(PORT, () => console.log(`catalog-service listening on ${PORT}`));
