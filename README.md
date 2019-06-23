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

## Step 1
Looks like Bluebird could help: https://github.com/nodejs/node/issues/6673

Changes required:

```console
$ npm i bluebird
```

```javascript
const Promise = require('bluebird');
```
### Observation
Memory usage droped by about 30%, now uses ~66.5MB but still doesn't seem to free up. Why? Because we technically have all the promises in flight at the same time and each one is an object which uses some memory. https://stackoverflow.com/questions/46654265/promise-all-consumes-all-my-ram
