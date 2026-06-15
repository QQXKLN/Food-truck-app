const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const buildPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ error: true, message: 'El correo ya esta registrado' });
    }

    const newUser = await User.create({ name, email, password });

    res.status(201).json({
      error: false,
      message: 'Usuario registrado con exito',
      data: buildPublicUser(newUser)
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error en el servidor', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Credenciales incorrectas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: true, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      error: false,
      message: 'Login exitoso',
      token,
      user: buildPublicUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error en el servidor', details: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({
        error: false,
        message: 'Si el correo existe, se genero una solicitud de recuperacion.'
      });
    }

    const resetToken = jwt.sign(
      {
        id: user.id,
        purpose: 'password-reset',
        passwordSignature: user.password.slice(-16)
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const response = {
      error: false,
      message: 'Solicitud de recuperacion generada.'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.data = { resetToken };
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error al solicitar recuperacion', details: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ error: true, message: 'Token de recuperacion invalido' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.password.slice(-16) !== decoded.passwordSignature) {
      return res.status(401).json({ error: true, message: 'Token de recuperacion invalido o expirado' });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ error: false, message: 'Contrasena actualizada con exito' });
  } catch (error) {
    res.status(401).json({ error: true, message: 'Token de recuperacion invalido o expirado' });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword
};
