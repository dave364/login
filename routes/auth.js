const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/User');

// Ruta de registro
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { error: 'El usuario ya existe' });
    }

    // Generar el hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario en la base de datos
    const newUser = new User({
      username,
      password: hashedPassword
    });
    await newUser.save();

    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Error en el registro' });
  }
});

// Ruta de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar al usuario en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Credenciales inválidas' });
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render('login', { error: 'Credenciales inválidas' });
    }

    // Guardar los datos del usuario en la sesión
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Error en el inicio de sesión' });
  }
});

// Ruta de cierre de sesión
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;

