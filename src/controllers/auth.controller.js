//
// Authentication controller
//
const assert = require("assert");
const jwt = require("jsonwebtoken");
const dbconnection = require("../../database/dbconnection");
// const validateEmail = require('../util/emailvalidator')
const logger = require("../config/config").logger;
const jwtSecretKey = require("../config/config").jwtSecretKey;

module.exports = {
  login(req, res, next) {
    dbconnection.getConnection((err, connection) => {
      if (err) {
        logger.error("Error getting connection from dbconnection");
        res.status(500).json({
          status: 500,
          message: err.toString(),
          datetime: new Date().toISOString(),
        });
      }

      if (connection) {
        // 1. Kijk of deze useraccount bestaat.
        connection.query(
          "SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?",
          [req.body.emailAdress],
          (err, rows, fields) => {
            connection.release();
            if (err) {
              logger.error("Error: ", err.toString());
              res.status(500).json({
                status: 500,
                message: err.toString(),
                datetime: new Date().toISOString(),
              });
            }

            if (rows) {
              console.log(rows.length)
              // if ( rows.length === 0) {
              //   res.status(404).json({
              //     status: 404,
              //     message: "User does not exist"
              //   })
              //   next()
              // }

              // 2. Er was een resultaat, check het password.
              if (
                rows &&
                rows.length === 1 &&
                rows[0].password == req.body.password
              ) {
                logger.info(
                  "passwords DID match, sending userinfo and valid token"
                );
                // Extract the password from the userdata - we do not send that in the response.
                const { password, ...userinfo } = rows[0];
                // Create an object containing the data we want in the payload.
                const payload = {
                  userId: userinfo.id,
                };

                jwt.sign(
                  payload,
                  jwtSecretKey,
                  { expiresIn: "12d" },
                  function (err, token) {
                    logger.debug("User logged in, sending: ", userinfo);
                    res.status(200).json({
                      statusCode: 200,
                      results: { ...userinfo, token },
                    });
                  }
                );
              } else {
                if (rows.length === 0) {
                  res.status(404).json({
                        status: 404,
                        message: "User does not exist"
                      })
                } else {
                  logger.info("User not found or password invalid");
                  res.status(401).json({
                    status: 401,
                    message: "User not found or password invalid",
                    datetime: new Date().toISOString(),
                  });
                }

                
              }
            } else {
              logger.info("User does not exist");
              res.status(404).json({
                status: 404,
                message: "User does not exist",
                datetime: new Date().toISOString(),
              });
            }
          }
        );
      }
    });
  },

  //
  //
  //
  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    let {emailAdress,password} = req.body

    if (emailAdress.length == 0) {
      res.status(400).json({
        status: 400,
        message: "Email is missing",
       
      });
    }
    if (password.length == 0) {
      res.status(400).json({
        status: 400,
        message: "Password is missing",
       
      });
    }


    try {
      assert(
        typeof emailAdress === "string",
        "email must be a string."
      );
      assert(
        typeof password === "string",
        "password must be a string."
      );
      next();
    } catch (ex) {
      res.status(400).json({
        status: 400,
        message: ex.toString(),
       
      });
    }
  },
  loginRegex(req,res,next) {
    const { emailAdress, password } = req.body;

    let regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // password: eight characters including one uppercase letter, one lowercase letter, and one number or special character.
    let regexPassword = /^(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    if (!regexMail.test(emailAdress)) {
      const error = {
        status: 400,
        message: "Email is not a valid format",
      };
      next(error);
    }
    logger.info("Email matched regex")
    if (!regexPassword.test(password)) {
      const error = {
        status: 400,
        message:
          "Make sure the password contains: eight characters including one uppercase letter, one lowercase letter, and one number or special character.",
      };
      next(error);
    }
    logger.info("Password matched regex")
    next()
  },

  //
  //
  //
  validateToken(req, res, next) {
    logger.info("validateToken called");
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn("Authorization header missing!");
      res.status(401).json({
        status: 401,
        message: "Authorization header missing!",
        datetime: new Date().toISOString(),
      });
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn("Not authorized");
          res.status(401).json({
            status: 401,
            message: "Not authorized",
            datetime: new Date().toISOString(),
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          // User heeft toegang. Voeg UserId uit payload toe aan
          // request, voor ieder volgend endpoint.
          req.userId = payload.userId;
          next();
        }
      });
    }
  },
};
