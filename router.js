const express = require('express');
const router = express.Router();
const db = require('./dbConnection');
const { signupValidation, loginValidation, postValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer')
const auth = require('./middleware');
const path = require('path');
const ipInformation = require("./ipTrace");

router.post('/register', signupValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array({ onlyFirstError: true })
    });
  }
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: 'This user is already in use!'
        });
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err
            });
          } else {
            // has hashed pw => add to database
            db.query(
              `INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${db.escape(
                req.body.email
              )}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    msg: err
                  });
                }
                return res.status(201).send({
                  msg: 'The user has been registerd with us!'
                });
              }
            );
          }
        });
      }
    }
  );
});


router.post('/login', loginValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array({ onlyFirstError: true })
    });
  }
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: 'Email or password is incorrect!'
        });
      }
      // check password
      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            throw bErr;
            return res.status(401).send({
              msg: 'Email or password is incorrect!'
            });
          }
          if (bResult) {
            const token = jwt.sign({ id: result[0].id }, 'the-super-strong-secrect', { expiresIn: '1h' });
            return res.status(200).send({
              msg: 'Logged in Successfully!',
              token,
              user: result[0]
            });
          }
          return res.status(401).send({
            msg: 'Username or password is incorrect!'
          });
        }
      );
    }
  );
});

router.get('/get-user', auth, async (req, res) => {
  await db.query('SELECT * FROM users where id=?', req.user.id, function (error, results, fields) {
    if (error) throw error;
    return res.send({ error: false, data: results[0], message: 'User Fetch Successfully.' });
  });
});

//! Use of Multer
var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, './images/')     // './images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
    callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: storage
});

router.post('/upload-image', auth, postValidation, ipInformation, upload.single('image'), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array({ onlyFirstError: true })
    });
  }
  if (!req.file) {
    console.log("No file upload");
  } else {
    var imgsrc = 'http://localhost:3000/images/' + req.file.filename;
    db.query(
      `INSERT INTO posts(user_id, title, path) VALUES('${req.user.id}', '${req.body.title}', '${imgsrc}')`,
      (err, result) => {
        if (err) {
          throw err;
          return res.status(400).send({
            msg: err
          });
        }
        db.query(
          `INSERT INTO post_states(state_id,post_id,lat,lng) VALUES('${req.state.id}','${result.insertId}','${req.state.lat}','${req.state.lng}')`,
          (err, result) => {
            if (err) {
              throw err;
              return res.status(400).send({
                msg: err
              });
            }
            return res.status(201).send({
              url: imgsrc,
              msg: 'File Uploded Successfully.'
            });
          }
        );
      }
    );
  }
});

router.get('/get-post', auth, async (req, res) => {
  await db.query(`SELECT a.*, c.lat, c.lng FROM posts a
  JOIN post_states c ON c.post_id = a.id WHERE a.user_id=?`, req.user.id, function (error, results, fields) {
    if (error) throw error;
    return res.send({ error: false, data: results, message: 'User Post Get Successfully.' });
  });
});

router.get('/get-nearby-posts', auth, ipInformation, async (req, res) => {
  await db.query(`select post_states.post_id,posts.title,posts.path,post_states.lat,post_states.lng, round( 
    ( 3959 * acos( least(1.0,  
      cos( radians('${req.state.lat}') ) 
      * cos( radians(post_states.lat) ) 
      * cos( radians(post_states.lng) - radians('${req.state.lng}') ) 
      + sin( radians('${req.state.lat}') )
      * sin( radians(post_states.lat) 
    ) ) ) 
  ), 1) as distance
  from post_states JOIN posts ON posts.id=post_states.post_id WHERE post_states.state_id=? having distance < 1 order by distance`, req.state.id, function (error, results, fields) {
    if (error) throw error;
    return res.send({ error: false, data: results, message: 'Near By Posts Get Successfully.' });
  });
});

module.exports = router;
