### CPU baseline

| Metric | Value |
|---|---|
| p95 latency | 11.93s |
| Max latency | 12.38s |
| Error rate | 0% |
| Peak CPU | 15% |
| Max replicas reached | 1 (never scaled) |
| HPA target | 50% |

### KEDA queue depth

| Metric | Value |
|---|---|
| p95 latency | 5.32s |
| Max latency | 5.67s |
| Error rate | 0% |
| Peak CPU | 13% |
| Max replicas reached | 4 |
| HPA target | 5 (avg queue depth per pod) |