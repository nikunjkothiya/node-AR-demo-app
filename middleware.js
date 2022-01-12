const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer') ||
            !req.headers.authorization.split(' ')[1]
        ) {
            return res.status(422).json({
                message: "Please provide the token new",
            });
        }

        const theToken = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Invalid Token",
        });
    }
};