"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const cors_1 = __importDefault(require("cors"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('typescript + express server');
});
app.use('/auth', authRoutes_1.default);
app.use(errorMiddleware_1.errorMiddleware);
exports.default = app;
