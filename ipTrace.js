const ipInfo = require("ipinfo");
const db = require('./dbConnection');

module.exports = (req, res, next) => {
    try {
        ipInfo((err, cLoc) => {
            // console.log(cLoc);
            db.query(
                `SELECT * FROM states WHERE LOWER(name) = LOWER('${cLoc.region}'); `,
                (err, result) => {
                    if (result.length) {
                        req.state = {
                            id: result[0].id,
                            lat: cLoc.loc.substr(0, cLoc.loc.indexOf(',')),
                            lng: cLoc.loc.substr(1, cLoc.loc.indexOf(',')).substr(0, cLoc.loc.substr(1, cLoc.loc.indexOf(',')).indexOf(','))
                        };
                        next();
                    } else {
                        // add state name => add to database
                        db.query(
                            `INSERT INTO states(name) VALUES('${cLoc.region}')`,
                            (err, result) => {
                                if (err) {
                                    throw err;
                                    return res.status(400).send({
                                        msg: err
                                    });
                                }

                                req.state = {
                                    id: result.insertId,
                                    lat: cLoc.loc.substr(0, cLoc.loc.indexOf(',')),
                                    lng: cLoc.loc.substr(1, cLoc.loc.indexOf(',')).substr(0, cLoc.loc.substr(1, cLoc.loc.indexOf(',')).indexOf(','))
                                };
                                next();
                            }
                        );
                    }
                }
            );
        });
    } catch (error) {
        return res.status(400).json({
            message: "Invalid Token",
        });
    }
};