// middlewares/authorizeType.js

function authorizeType(allowedTypes) {
  return (request, response, next) => {
    if (!allowedTypes.includes(request.user.type)) {
      // عشان تتحقق هل اله صلاحيه يدخل او لا مثلا اللي مسمحوله ال admin  و هاد rider بحكيله stop
      return response.status(403).json({ message: "Access denied" }); // 403 forbidden غير مصرح الك
    }
    next();
  };
}

module.exports = authorizeType;
