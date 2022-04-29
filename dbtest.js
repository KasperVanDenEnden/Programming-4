const mysql = require("mysql");
require("dotenv").config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

pool.getConnection(function (err, connection) {
  if (err) throw err; // not connected!

  // Use the connection
  connection.query(
    "SELECT id, name FROM meal",
    function (error, results, fields) {
      // When done with the connection, release it.
      connection.release();

      // Handle error after the release.
      if (error) throw error;

      // Don't use the connection here, it has been returned to the pool.
      console.log("results = ", results);

      pool.end((err) => {
        console.log("pool was closed");
      });
    }
  );
});



pool.on("acquire", function (connection) {
  console.log("Connection %d acquired", connection.threadId);
});

//   pool.on('connection', function (connection) {
//     connection.query('SET SESSION auto_increment_increment=1')
//   });

//   pool.on('enqueue', function () {
//     console.log('Waiting for available connection slot');
//   });

  pool.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId);
  });
