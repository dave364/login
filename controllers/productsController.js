// Controlador para la página de productos
const productsPage = (req, res) => {
    // Verificar si el usuario ha iniciado sesión
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
  
    // Obtener los datos del usuario de la sesión
    const { username, role } = req.session.user;
  
    // Renderizar la vista de productos con el mensaje de bienvenida y los datos del usuario
    res.render('products', { username, role });
  };
  
  module.exports = {
    productsPage
  };
  