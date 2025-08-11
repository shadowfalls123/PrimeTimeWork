// Auth middleware for lambda-micro
export const requireLoggedInUser = (handler) => async (req, res) => {
    console.log("Inside requireLoggedInUser request ", req);
    const userid = req.event.requestContext.authorizer.jwt.claims.username;
    if (userid) {
      return await handler(req, res); // Allow access to the actual handler
    } else {
      res.status(401).json({ message: "Unauthorized access" });
    }
  };