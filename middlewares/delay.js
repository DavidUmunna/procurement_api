const delay = (ms) => (req, res, next) => {
  setTimeout(next, ms);
};

module.exports={delay}