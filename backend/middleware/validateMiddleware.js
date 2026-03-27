const validate = (schema) => (req, res, next) => {
  try {
    // Check if the request body matches the schema
    schema.parse(req.body);
    next(); // If successful, move on to the actual route!
  } catch (err) {
    // If it fails, send back a clean, comma-separated list of what went wrong
    const errorMessages = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({ message: errorMessages });
  }
};

module.exports = validate;