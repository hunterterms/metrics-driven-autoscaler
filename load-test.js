import http from "k6/http";

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "1m", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  http.post("http://localhost/checkout", JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
}
