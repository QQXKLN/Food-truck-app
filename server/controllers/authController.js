const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ error: true, message: 'El correo ya está registrado' });
    }

    
    const newUser = await User.create({ name, email, password });

    res.status(201).json({
      error: false,
      message: 'Usuario registrado con éxito',
      data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error en el servidor', details: error.message });
  }
};

module.exports = {
  register,
  login
};