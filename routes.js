const express = require('express');
const router = express.Router();

const users = [
  { email: 'adminCoder@coder.com', password: 'adminCod3r123', role: 'admin' },
  { email: 'user@example.com', password: 'user123', role: 'user' }
];

function requireLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    req.session.user = user;
    res.redirect('/products');
  } else {
    res.redirect('/login');
  }
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const { email, password, role } = req.body;
  users.push({ email, password, role: role || 'user' });
  res.redirect('/login');
});

router.get('/products', requireLogin, (req, res) => {
  const { email, role } = req.session.user;
  res.render('products', { email, role });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
