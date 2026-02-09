const Workspace = require("../models/workspace");

const subscriptionMiddleware = (feature) => {
  return async (req, res, next) => {
    try {
      // only apply for workspace creation
      if (feature !== "workspace") {
        return next();
      }

      // Pro users → unlimited
      if (req.user.subscriptionPlan === "pro") {
        return next();
      }

      // Free users → max 15 workspaces
      const workspaceCount = await Workspace.countDocuments({
        owner: req.user.userId,
      });

      if (workspaceCount >= 15) {
        return res.status(403).json({
          message: "Upgrade to Pro to create more than 15 workspaces",
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Subscription check failed" });
    }
  };
};

module.exports = subscriptionMiddleware;
