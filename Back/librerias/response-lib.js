export function success(body) {
  return buildResponse(200, body);
}

export function fail(body) {
  return buildResponse(500, body);
}

export function validationFail(body) {
  return buildResponse(422, body);
}

function status(code) {
  let message = "OK";
  switch (code) {
    case 500:
    case 422:
      message = "error";
      break;
    case 200:
      message = "ok";
      break;
  }
  return message;
}

function buildResponse(statusCode, data) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      data: data,
      status: status(statusCode),
      message: data && data.message ? data.message : ""
    })
  };
}
