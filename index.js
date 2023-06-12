const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');

// Importar el modelo User
const User = require('./models/User');

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb+srv://castrodavid9872:ItNaMTm4F5cwWs0v@cluster364da.jqgneo9.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a la base de datos:'));
db.once('open', () => {
  console.log('Conexión exitosa a la base de datos');
});

// Configuración de Express y middlewares
const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de la sesión
app.use(
  session({
    secret: 'mi_secreto',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://castrodavid9872:ItNaMTm4F5cwWs0v@cluster364da.jqgneo9.mongodb.net/?retryWrites=true&w=majority' }),
  })
);

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      // Buscar al usuario en la base de datos por su email
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Credenciales inválidas' });
      }

      // Verificar la contraseña hasheada utilizando bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return done(null, false, { message: 'Credenciales inválidas' });
      }

      // Autenticación exitosa, devolver el usuario autenticado
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);


passport.use(
  new GitHubStrategy(
    {
      clientID: 'Iv1.ce7d9857832de97b',
      clientSecret: '1684a195b22265a67821a35b62b4a65499e284e7',
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Verificar si profile y profile.emails están definidos
        if (!profile || !profile.emails || profile.emails.length === 0) {
          return done(null, false, { message: 'No se pudo obtener el correo electrónico del perfil de usuario' });
        }

        // Buscar o crear al usuario con los datos de GitHub
        let user = await User.findOne({ githubId: profile.id });
        const email = profile.emails[0].value;

        if (!user) {
          // El usuario no existe, crearlo con los datos de GitHub
          user = new User({
            githubId: profile.id,
            name: profile.displayName,
            email: email,
          });
          await user.save();
        }

        // Autenticación exitosa, devolver el usuario autenticado
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);



passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Buscar al usuario en la base de datos por su ID
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Rutas
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
