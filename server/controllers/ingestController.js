const { ingestEvent } = require("../services/ingestionService");

const ingestController = async (req, res, next) => {
  try {
    const result = await ingestEvent(req.validatedEvent);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { ingestController };
