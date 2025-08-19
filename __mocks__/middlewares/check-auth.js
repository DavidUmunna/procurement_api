module.exports = (req, res, next) => {
  // always pass auth in tests
  req.user = { id:'68306b205302544582c59f35',role:'admin' };
  next();
};