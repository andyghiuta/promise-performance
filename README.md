# Promise performance improvements in Node.js (v8.10.0)

The script triest to emulate processin a matrix of records. EG:
```javascript
const records = [[1, 2], [3, 4]];
```
To know when all records are processed, we need to know when each row has been processed and when all rows have been processed.

# Improvements
## Step 0 (no improvements)
The idea is to handle each record with a promise and for each row, `await Promise.all` the rows, returning only after all records in row have processed. 
Then for the entire set, `await Promise.all` the promises returned for the rows.

### Observation
Memory usage is high. Script uses ~99.8MB and does not free up memory after each row has processed. Quite interesting...

