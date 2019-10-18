import { fail, success } from "../librerias/response-lib";
import MySQL from "../librerias/mysql-lib";

const conf = require("../settings.json");
const bcrypt = require("bcryptjs-then");
const jwt = require("jsonwebtoken");

export const register = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let body = event.body ? JSON.parse(event.body) : event;
  body.IdUserProfile = "";
  body.Status = 1;

  return adminUser(body);
};

export const admin = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let body = event.body ? JSON.parse(event.body) : event;

  return adminUser(body);
};

export const login = async (event, context) => {
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

      let results = await con.query(sql, ["", body.Email]);

      let _user = results[results.length - 2][0];

      await con.end();

      if (_user) {
        let _valido = await comparePassword(
          body.Password,
          _user.Password,
          _user.IdUserProfile
        );

        _user.token = _valido;
      } else {
        return Promise.reject(new Error("User not found."));
      }

      return _user;
    })
    .then(success)
    .catch(fail);
};

const adminUser = body => {
  let _con = new MySQL();

  return _con
    .then(async con => {
      var _password = await bcrypt.hash(body.Password ? body.Password : "", 10);

      let sql = `
        SET @V_IdUserProfile = ?;
        SET @V_UserName = ?;
        SET @V_Email = ?;
        SET @V_Password = ?;
        SET @V_APIKEY = ?;
        SET @V_APISECRET = ?;
        SET @V_Status = ?;
        CALL CF_CryptoScreener.CF_CS_FUN_UserProfileAdmin (@V_IdUserProfile, @V_UserName, @V_Email, @V_Password, @V_APIKEY, @V_APISECRET, @V_Status);
      `;

      let results = await con.query(sql, [
        body.IdUserProfile,
        body.UserName,
        body.Email,
        _password,
        body.APIKEY,
        body.APISECRET,
        body.Status
      ]);

      let _id = results[results.length - 2][0].V_LASTID;
      body.IdUserProfile = _id;

      await con.end();

      return body;
    })
    .then(success)
    .catch(fail);
};

const comparePassword = (eventPassword, userPassword, userId) => {
  return bcrypt
    .compare(eventPassword, userPassword)
    .then(passwordIsValid =>
      !passwordIsValid
        ? Promise.reject(new Error("The credentials do not match."))
        : signToken(userId)
    );
};

const signToken = async id => {
  return jwt.sign({ id: id }, conf.jwtSecret, {
    expiresIn: 86400 // expires in 24 hours
  });
};
