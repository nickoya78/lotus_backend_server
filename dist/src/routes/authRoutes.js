"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authControllers_1 = require("../controller/authControllers");
const router = express_1.default.Router();
router.use((0, cors_1.default)());
router.post('/register', authControllers_1.validateRegister, authControllers_1.register);
router.post('/login', authControllers_1.validateLogin, authControllers_1.login);
router.post('/logout', authControllers_1.logout);
router.post('/resetPassword', authControllers_1.resetPassword);
router.post('/updatePasswordWithToken', authControllers_1.updatePasswordWithToken); // Change this line
exports.default = router;
