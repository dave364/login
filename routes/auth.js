const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();


const User = require('../models/User');

// Ruta de registro
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe en la base de datos por su correo electrónico
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // El usuario ya está registrado
      return res.redirect('/auth/register');
    }

    // Generar el hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario con el hash de la contraseña
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    res.redirect('/auth/login');
  } catch (error) {
    next(error);
  }
});

// Ruta de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para el inicio de sesión con GitHub
router.get('/github', passport.authenticate('github'));

// Ruta para el callback de GitHub después del inicio de sesión
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/auth/login' }),
  (req, res) => {
    // Lógica para redirigir o mostrar información después del inicio de sesión exitoso con GitHub
    res.redirect('/'); // Por ejemplo, redirige al inicio de tu aplicación
  }
);

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

module.exports = router;
