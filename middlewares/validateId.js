// This file exports a function that returns middleware based on the route type

const idGroups = {
  public: ['viewer123', 'viewer456'],
  team: ['team01', 'team02'],
  developer: ['admin123']
};

function checkIdFor(type) {
  return (req, res, next) => {
    const id = req.params.id;
    if (idGroups[type].includes(id)) {
      next();
    } else {
      res.status(403).send('❌ Unauthorized or Invalid ID');
    }
  };
}

module.exports = checkIdFor;
