const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const conf = require("../settings.json");

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

export const auth = async (event, context, callback) => {
  const token = event.authorizationToken.replace("Bearer ", "");
  
  if (!token) 
    return callback(null, "Unauthorized");
  
  jwt.verify(token, conf.jwtSecret, (err, decoded) => {
    if (err) 
      return callback(null, "Unauthorized");

    return callback(null, generatePolicy(decoded.id, "Allow", event.methodArn));
  });
};
