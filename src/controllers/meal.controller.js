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
      

      next()
    } catch (err) {
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
          //meal bestaal al
          res.status(404).json({
            status:404,
            message: "Meal already exists"
          })
        } else {
            connection.query("INSERT INTO meal (name, description, dateTime, price, imageUrl, cookId, isActive, isVega, isVegan, isToTakeHome) VALUES (?,?,?,?,?,?,?,?,?,?)", [name,description,price,dateTime,imageUrl,cookId,isActive,isVega,isVegan,isToTakeHome], (err,result,fields) => {
              if (err) throw err;

              connection.query("Select from user WHERE name = ? AND description =? AND price = ? AND dateTime = ?", [name, description, price, dateTime], (err,result,fields) => {
                if (err) throw err;

                connection.release();

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
    console.log(queryParams);
    // const {} = queryParams
    // console.log(` = ${} &  = ${}`  )

    let queryString = `SELECT id, name FROM meal;`;
    console.log(queryString);

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
            connection.query(
              "SELECT * FROM meal WHERE id = ?",
              [id],
              (err, result, fields) => {
                connection.release();

                res.status(200).json({
                  status: 200,
                  result: result[0],
                });

                res.end();
              }
            );
          } else {
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
            res.status(404).json({
              status: 404,
              message: "Meal does not exist",
            });
          } else {
            connection.query(
              "DELETE FROM meal WHERE id = ?",
              [id],
              (err, result, fields) => {
                if (err) throw err;

                connection.release();

                if (result.affectedRows === 1) {
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
