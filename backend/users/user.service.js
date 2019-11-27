const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'donde.curso.uncoma@gmail.com',
        pass: 'DdondeCcurso45123'
    }
});

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    userParam.nombre = userParam.nombre.replace(/ /g, '.');
    userParam.apellido = userParam.apellido.replace(/ /g, '.');
    userParam.username = userParam.nombre.toLowerCase() + '.' + userParam.apellido.toLowerCase();
    var re = new RegExp(userParam.username, 'g')

    // validate email
    const userEmail = await User.findOne({
        email: userParam.email,
    });
    console.log(userEmail)
    if (userEmail) {
        throw 'Email "' + userParam.email + '" está en uso.';
    }

    const users = await User.find({
        username: re,
    });

    if (users.length > 0) {
        userParam.username = userParam.nombre.toLowerCase() + '.' + userParam.apellido.toLowerCase() + users.length;
    } else {
        userParam.username = userParam.nombre.toLowerCase() + '.' + userParam.apellido.toLowerCase();
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();

    // var mailOptions = {
    //     from: 'donde.curso.uncoma@gmail.com',
    //     to: userParam.email,
    //     subject: '¿DONDE CURSO? - USUARIO',
    //     text: 'Su nombre de usuario para ingresar es: ' + userParam.username
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });

    return {
        message: 'Success',
        obj: { success: true }
    }
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}