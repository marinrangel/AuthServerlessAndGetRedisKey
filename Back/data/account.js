import { fail, success } from "../librerias/response-lib";
import MySQL from "../librerias/mysql-lib";
import { log } from "util";

export const getBalance = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let body = event.body ? JSON.parse(event.body) : event;
  let _con = new MySQL();

  return _con
    .then(async con => {
      let sql = `
        SET @V_IdUserProfile = ?;
        SET @V_Email = ?;
        CALL CF_CryptoScreener.CF_CS_FUN_UserProfileGet (@V_IdUserProfile, @V_Email);
      `;

      let results = await con.query(sql, [body.IdUserProfile, ""]);
      let _user = results[results.length - 2][0];

      await con.end();

      if (!_user) fail(_user);

      return { key: _user.APIKEY, secret: _user.APISECRET };
    })
    .then(balance)
    .then(promises => {
      return {
        prices: promises[0],
        balance: promises[1]
      };
    })
    .then(success)
    .catch(fail);
};

const balance = ({ key, secret }) => {
  const binance = require("node-binance-api")().options({
    APIKEY: key,
    APISECRET: secret,
    useServerTime: true
  });

  const prices = new Promise(function(resolve, reject) {
    binance.prices((error, ticker) => {
      if (error) reject(error);

      resolve(ticker);
    });
  });

  const balance = new Promise(function(resolve, reject) {
    binance.balance((error, ticker) => {
      if (error) reject(error);

      resolve(ticker);
    });
  });

  return Promise.all([prices, balance]);
};
