module.exports = (req, res, next) => {
    res.locals.flash = req.session.flash || {};
    delete req.session.flash;
    next();
  };
  
  // Add a method to set flash messages
  const setFlash = (req, type, message) => {
    req.session.flash = { type, message };
  };
  module.exports.setFlash = setFlash;
  