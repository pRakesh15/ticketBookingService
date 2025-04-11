import Jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // console.log(token);
    
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    Jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  export default authenticateToken