/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to specified roles
 * @param  {...string} roles - e.g. 'student', 'recruiter', 'admin'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not authorized to access this resource. Required: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

export default authorizeRoles;
