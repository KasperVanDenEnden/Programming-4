const jwt = require("jsonwebtoken");

const privateKey = "secretstring";

jwt.sign(
  { id: 1 },
  privateKey,
  function (err, token) {
    if (err) console.log(err);
    if (token) console.log(token);
  }
);
