const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");
const assert = require("assert");
const logger = require("../config/config").logger;
const { is } = require("express/lib/request");

let meals = [];
let id = 0;

let controller = {
  validateMeal:(req,res,next) =>{
    let {isActive,isVega,isVegan,isToTakeHome,dateTime,price,imageUrl,cookId,name,description} = req.body

    try {
      assert(typeof name === "string", "Name must be a string");
      assert(typeof description === "string", "Description must be a string");
      assert(typeof dateTime === "string", "dateTime must be a string");
      assert(typeof price === "string", "price must be a string");
      assert(typeof imageUrl === "string", "imageUrl must be a string");
      assert(typeof cookId === "number", "cookId must be a number");

      assert(typeof isActive === 'boolean', "isActive must be a boolean")
      assert(typeof isVega === 'boolean', "isVega must be a boolean")
      assert(typeof isVegan === 'boolean', "isVegan must be a boolean")
      assert(typeof isToTakeHome === 'boolean', "isToTakeHome must be a boolean")
      
      logger.info(`Alle meal inputs hebben de juiste type`)

      next()
    } catch (err) {
      logger.error(`Niet alle meal inputs hebben de juiste type`)
      const error = {
        status:400,
        message: err.message
      }
      next(error)
    }
  },
  addMeal: (req, res) => {
   dbconnection.getConnection((err,connection)=> {
    if (err) throw err;
      const {name, description, dateTime, price, imageUrl, cookId, isActive, isVega, isVegan, isToTakeHome} = req.body

      connection.query( "SELECT COUNT(name) as count FROM user WHERE name = ? AND description =? AND price = ? AND dateTime = ?", [name, description, price, dateTime], (err,result,fields) =>{
        if (err) throw err;

        if (result[0] === 1) {
          logger.error("Meal already exists")
          res.status(404).json({
            status:404,
            message: "Meal already exists"
          })
        } else {
            connection.query("INSERT INTO meal (name, description, dateTime, price, imageUrl, cookId, isActive, isVega, isVegan, isToTakeHome) VALUES (?,?,?,?,?,?,?,?,?,?)", [name,description,price,dateTime,imageUrl,cookId,isActive,isVega,isVegan,isToTakeHome], (err,result,fields) => {
              if (err) throw err;
              logger.info("New meal is added to the database")
              connection.query("Select from user WHERE name = ? AND description =? AND price = ? AND dateTime = ?", [name, description, price, dateTime], (err,result,fields) => {
                if (err) throw err;

                connection.release();
                logger.info("New meal will be returned")
                res.status(201).json({
                  status: 201,
                  result: result[0],
                });
                res.end();
              })

            })


        }

      })
   })
  },
  getAllMeals: (req, res, next) => {
    const queryParams = req.query;
    logger.info(queryParams);
    // const {} = queryParams
    // logger.info(` = ${} &  = ${}`  )

    let queryString = `SELECT id, name FROM meal;`;
    logger.info(queryString);

    dbconnection.getConnection((err, connection) => {
      if (err) {
        next(err);
      }
      // if querystring is finished place it below instead of the hardcoded query
      connection.query(queryString, (err, result, fields) => {
        if (err) {
          next(err);
        }
        connection.release();
        logger.info("All meals that have been found are returned")
        res.status(200).json({
          status: 200,
          result: result,
        });
      });
    });
  },
  getMealById: (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        "SELECT COUNT(id) as count FROM meal WHERE id = ?",
        [id],
        (err, result, fields) => {
          if (err) throw err;
          if (result[0].count === 1) {
            logger.info(`Meal with ${id} has been found`)
            connection.query(
              "SELECT * FROM meal WHERE id = ?",
              [id],
              (err, result, fields) => {
                connection.release();
                logger.info(`Meal with ${id} is returned`)
                res.status(200).json({
                  status: 200,
                  result: result[0],
                });

                res.end();
              }
            );
          } else {
            logger.error("Meal does not exist")
            res.status(404).json({
              status: 404,
              message: "Meal does not exist",
            });
          }
        }
      );
    });
  },
  deleteMeal: (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
      return next();
    }

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        "SELECT COUNT(id) as count FROM meal WHERE id = ?",
        [id],
        (err, result, fields) => {
          if (result[0].count === 0) {
            logger.error("Meal does not exist")
            res.status(404).json({
              status: 404,
              message: "Meal does not exist",
            });
          } else {
            logger.info(`Meal with ${id} has been found`)
            connection.query(
              "DELETE FROM meal WHERE id = ?",
              [id],
              (err, result, fields) => {
                if (err) throw err;
                
                connection.release();

                if (result.affectedRows === 1) {
                  logger.info(`Meal with ${id} is deleted`)
                  res.status(200).json({
                    status: 200,
                    message: "Meal has been deleted",
                  });
                }

                res.end();
              }
            );
          }
        }
      );
    });
  },
};

module.exports = controller;
