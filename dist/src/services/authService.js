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
exports.updatePassword = exports.resetPassword = exports.generateResetToken = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const emailService_1 = require("./emailService");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });
    yield (0, emailService_1.sendEmail)(email, 'Welcome to Our App', 'Thank you for registering!');
    res.json(user);
});
exports.registerUser = registerUser;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('User not found');
    const validPassword = yield bcrypt_1.default.compare(password, user.password);
    if (!validPassword)
        throw new Error('Invalid password');
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
});
exports.loginUser = loginUser;
const generateResetToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('User not found');
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    yield prisma.user.update({
        where: { email },
        data: { resetToken },
    });
    return resetToken;
});
exports.generateResetToken = generateResetToken;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const resetToken = yield (0, exports.generateResetToken)(email);
        yield (0, emailService_1.sendEmail)(email, 'Password Reset', `Your reset token is: ${resetToken}`);
        res.json({ message: 'Reset token sent to email' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
exports.resetPassword = resetPassword;
const updatePassword = (email, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash the new password using bcrypt
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    // Update the user's password in the database using Prisma
    const user = yield prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    // Return the updated user
    return user;
});
exports.updatePassword = updatePassword;
