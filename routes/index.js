// Example route
const router = require('express').Router();

/* GET index */
router.get('/', (_req, res) => {
  res.json({ Hello: 'World!' });
});

module.exports = router;
