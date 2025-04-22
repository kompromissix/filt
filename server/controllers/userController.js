const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Basket} = require('../models/models')
require('dotenv').config()
const sequelize = require('../db')

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {email, password, role} = req.body;
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или пароль'));
        }

        try {
            // Проверяем существование пользователя
            const candidate = await User.findOne({where: {email}});
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }

            // Хешируем пароль
            const hashPassword = await bcrypt.hash(password, 5);
            
            // Создаем пользователя
            const user = await User.create({
                email,
                password: hashPassword,
                role
            });
            
            // Создаем корзину (правильно указываем user_id)

            // Генерируем токен
            const token = generateJwt(user.id, user.email, user.role);
            return res.json({token});

        } catch (err) {
            console.error('Registration error:', err);
            return next(ApiError.internal('Ошибка при регистрации'));
        }
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})
    }
}

module.exports = new UserController()
