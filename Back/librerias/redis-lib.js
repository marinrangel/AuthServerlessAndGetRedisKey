import redis from "redis";

export default function() {
  return new Promise((resolve, reject) => {
    let client = redis.createClient({
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST
    });

    client.on("error", function(err) {
      console.log("Something went wrong " + err);
      return reject(err);
    });

    return resolve(client);
  });
}
