import { fail, success } from "../librerias/response-lib";
import Redis from "../librerias/redis-lib";

export const getMarket = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  var red = new Redis();

  return red
    .then(getRedis)
    .then(success)
    .catch(fail);
};

const getRedis = red => {
  return new Promise((resolve, reject) => {
    try {
      red.get("Market", (err, object) => {
        if (red) red.quit();

        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(object));
        }
      });
    } catch (error) {
      if (red) red.quit();

      console.log("error", error);
      reject(error);
    }
  });
};
