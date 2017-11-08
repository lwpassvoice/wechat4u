const redis_config = require('./config.js').redis_config;

const redis = require("redis"),
  client = redis.createClient(redis_config.port, redis_config.host);

function redis_set(key, value, expire) {
  return new Promise((resolve, reject) => {
    client.set(key, value, function (err, response) {
      if (err) {
        console.log("err:", err);
        reject(err)
      } else {
        console.log(response);
        if (expire) {
          client.expire(key, expire)
        }
        resolve(response)
      }
    });
  })
}

function redis_get(key) {
  return new Promise((resolve, reject) => {
    client.get(key, function (err, response) {
      if (err) {
        console.log("err:", err);
        reject(err)
      } else {
        console.log(response);
        resolve(response)
      }
    });
  })
}

function redis_hmset(key, value, expire) {
  return new Promise((resolve, reject) => {
    client.hmset(key, value, function (err, response) {
      if (err) {
        console.log("err:", err);
        reject(err)
      } else {
        console.log(response);
        if (expire) {
          client.expire(key, expire)
        }
        resolve(response)
      }
    });
  })
}

function redis_hgetall(key) {
  console.log('redis_hgetall', key)
  return new Promise((resolve, reject) => {
    client.hgetall(key, function (err, response) {
      if (err) {
        console.log("err:", err);
        reject(err)
      } else {
        console.log('redis_hgetall ', response);
        resolve(response)
      }
    });
  })
}

function redis_lpush(key, value) {
  return new Promise((resolve, reject) => {
    client.lpush(key, value, function (err, response) {
      if (err) {
        console.log("lpush err:", err);
        reject(err)
      } else {
        console.log("lpush ", response);
        resolve(response)
      }
    });
  })
}

function redis_sadd(key, value) {
  return new Promise((resolve, reject) => {
    client.sadd(key, value, function (err, response) {
      if (err) {
        console.log("redis_sadd err:", err);
        reject(err)
      } else {
        console.log("redis_sadd ", response);
        resolve(response)
      }
    });
  })
}

function redis_sismember(key, value) {
  return new Promise((resolve, reject) => {
    client.multi()
      .sismember(key, value)
      .exec(function (err, response) {
        if (err) {
          console.log("redis_sismember err:", err);
          reject(err)
        } else {
          console.log("redis_sismember ", response);
          resolve(response[0])
        }
      });
  })
}


module.exports = {
  redis_set,
  redis_get,
  redis_hmset,
  redis_hgetall,
  redis_lpush,
  redis_sadd,
  redis_sismember
}