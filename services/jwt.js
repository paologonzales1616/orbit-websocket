const fs = require("fs");
const jwt = require("jsonwebtoken");
const publicKEY = fs.readFileSync(process.env.PUBLIC_KEY, "utf8");

module.exports = {
  verifyToken: token => {
    const verifyOptions = {
      algorithm: ["RS256"]
    };

    try {
      return jwt.verify(token, publicKEY, verifyOptions);
    } catch (error) {
      return false;
    }
  },
  decodeToken: token => jwt.verify(token, publicKEY)
};
