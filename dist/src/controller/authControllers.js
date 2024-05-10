"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordWithToken = exports.resetPassword = exports.logout = exports.login = exports.register = exports.validateLogin = exports.validateRegister = void 0;
const authService_1 = require("../services/authService");
const express_validator_1 = require("express-validator");
const nodemailer_1 = __importDefault(require("nodemailer"));
const hashPassword_1 = require("../utils/hashPassword");
const client_1 = require("../../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.validateRegister = [
    (0, express_validator_1.check)('email').isEmail().withMessage('Must be a valid email'),
    (0, express_validator_1.check)('password').isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
    (0, express_validator_1.check)('name').exists().withMessage('Name is required'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        next();
    },
];
exports.validateLogin = [
    (0, express_validator_1.check)('email').exists().withMessage('Email is required'),
    (0, express_validator_1.check)('password').exists().withMessage('Password is required'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        next();
    },
];
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if a user with the provided email already exists
        const existingUser = yield client_1.prisma.user.findUnique({ where: { email: req.body.email } });
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }
        // Hash the password
        const hashedPassword = yield (0, hashPassword_1.hashPassword)(req.body.password);
        // Create the user
        const user = yield client_1.prisma.user.create({
            data: {
                email: req.body.email,
                password: hashedPassword,
                name: req.body.name,
                resetPassword: null,
            },
        });
        // Create a transporter
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Define the email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Welcome to Lotus App',
            text: `Hi ${user.name}, welcome to Lotus app! We're glad you're here. Enjoy your stay!`,
        };
        // Send the email
        yield transporter.sendMail(mailOptions);
        res.status(201).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, token } = yield (0, authService_1.loginUser)(req.body.email, req.body.password);
        res.status(200).json({ user, token });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const resetToken = yield (0, authService_1.generateResetToken)(email);
        // Create a transporter
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Define the email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Your reset token is: ${resetToken}`,
        };
        // Send the email
        yield transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset successful', resetToken });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.resetPassword = resetPassword;
// Send an email to the user with the reset token
// ...
const updatePasswordWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword, resetToken } = req.body;
        // Find the user with the provided email and reset token
        const user = yield client_1.prisma.user.findUnique({
            where: { email, resetToken },
        });
        // If the user was not found, send an error response
        if (!user) {
            return res.status(400).json({ error: 'Invalid reset token' });
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the user's password in the database
        yield client_1.prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updatePasswordWithToken = updatePasswordWithToken;
// 
