const { check } = require('express-validator');

exports.signupValidation = [
    check('name', 'Name is requied').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().not().isEmpty(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }).not().isEmpty()
]

exports.loginValidation = [
    check('email', 'Please include a valid email').isEmail().not().isEmpty(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }).not().isEmpty()
]

exports.postValidation = [
    check('title', 'Title is requied').not().isEmpty(),
    check('image', 'File is required').not().isEmpty()
]