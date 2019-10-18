import mysql from "mysql";
import util from "util";

export default function() {
  return new Promise((resolve, reject) => {
    let connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true
    });

    connection.connect(err => {
      if (!!err) {
        console.log("Error to connect DB");
        return reject(err);
      }
      console.log("Successful connection to the database DB");
      connection.query = util.promisify(connection.query);
      connection.end = util.promisify(connection.end);
      return resolve(connection);
    });
  });
}
