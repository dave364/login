const express = require('express');
const exphbs  = require('express-handlebars');
const session = require('express-session');
const routes = require('./routes');

const app = express();
const PORT = 3000;

// Configuración del motor de plantillas Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});