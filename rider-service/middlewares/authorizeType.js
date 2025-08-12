


function authorizeType(allowedTypes) {
  return (request, respone, next) => {
    if (!allowedTypes.includes(request.user.type)) {
      return response.status(403).json({ message: "Access denied" });
    }
    next();
  };
}


module.exports = authorizeType; // للاستيراد و التصدير