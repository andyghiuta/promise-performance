# Promise performance improvements in Node.js (v8.10.0)

The script tries to emulate processing a matrix of records. EG:
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
Memory usage dropped by about 30%, now uses ~66.5MB but still doesn't seem to free up. Why? Because we technically have all the promises in flight at the same time and each one is an object which uses some memory. https://stackoverflow.com/questions/46654265/promise-all-consumes-all-my-ram

```console
Memory used after processing all records: 66.58 MB
process: 3166.903ms
```

## Step 2
We need to limit the number of Promises in flight at a particular moment. This we surely increase the processing time, but will hopefully decrease memory usage. We're more interested in the latter for this particular case.
Changes:
Replace `Promise.all` with blubird's [Promise.map](http://bluebirdjs.com/docs/api/promise.map.html)

This:
```javascript
// main function that processes all records
const processAllRecords = async () => {
  console.time('Process time');
  showMemoryUsage('before processing all records');
  const resultAll = await Promise.all(records.map(processRecord));
  showMemoryUsage('after processing all records');
  console.timeEnd('Process time');
  return resultAll;
};
```

Becomes:
```javascript
const processAllRecords = async () => {
  console.time('Process time');
  showMemoryUsage('before processing all records');
  const resultAll = await Promise.map(
    records,
    processRecord,
    { concurrency: 10 },
  );
  showMemoryUsage('after processing all records');
  console.timeEnd('Process time');
  return resultAll;
};
```
Setting the `concurrency` option for `Promise.map` ensures we are not having more than the amount set at the same time in flight. 

Result:
```
Memory used after processing all records: 19.05 MB
Process time: 30126.845ms
```

# Conclusion
Processing a lot of data asynchronously could lead to memory being bloated. Bluebird library helps by giving the option to batch the request in subsets and ensure GC kicks in between batches.
