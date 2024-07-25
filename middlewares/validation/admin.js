import { check } from "express-validator"
import { resultChecker } from "./resultChecker.js"

const adminLoginFields = [
    check('email', 'Email field is empty.')
        .exists(),
    check('email', 'Invalid Email')
        .isEmail(),
    check('password', 'Password should be minimum of 8 characters.')
        .isLength({ min: 8 })
]

// const forgotPassword = [
//     check('email', 'Email field is empty.')
//         .exists(),
//     check('email', 'Invalid Email')
//         .isEmail(),
// ]


// const resetPassword = [
//     check('password', 'Password should be minimum of 8 characters.')
//     .isLength({ min: 8 })
// ]

const changePassword = [
    check('id').exists().withMessage('UserId not found').isMongoId().withMessage('Invalid UserId'),
    check('password', 'Password should be minimum of 8 characters.')
    .isLength({ min: 8 })]
export const adminLoginValidations = [adminLoginFields, resultChecker]
// export const forgotPasswordValidation = [forgotPassword, resultChecker]
// export const resetPasswordValidations = [resetPassword, resultChecker]
export const changePasswordValidation = [changePassword, resultChecker]

