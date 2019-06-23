const Promise = require('bluebird');

// create test data
const records = [];
for (let i = 0; i < 100; i += 1) {
  const record = {
    index: i,
    subrecords: [],
  };
  for (let j = 0; j < 1000; j += 1) {
    record.subrecords.push({
      index: j,
    });
  }
  records.push(record);
}

// show memory usage
const showMemoryUsage = (step = '') => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory used ${step}: ${Math.round(used * 100) / 100} MB`);
};

const getRandomInt = (min, max) => {
  const mi = Math.ceil(min);
  const ma = Math.floor(max);
  return Math.floor(Math.random() * (ma - mi)) + mi;
};

// process a subrecord - creates a promise
// which resolves after a random amount of time between 500 and 3000 msec
// simmulate network request
const processSubRecord = sr => new Promise((resolve) => {
  setTimeout(() => {
    resolve(sr.index);
  }, getRandomInt(500, 3000));
});

// processing a record means that all subrecords should be processed
const processRecord = async (r) => {
  const resultAll = await Promise.all(r.subrecords.map(processSubRecord));
  showMemoryUsage(`after processing record ${r.index}`);
  return resultAll;
};

// main function that processes all records
const processAllRecords = async () => {
  showMemoryUsage('before processing all records');
  const resultAll = await Promise.all(records.map(processRecord));
  showMemoryUsage('after processing all records');
  return resultAll;
};

processAllRecords();
