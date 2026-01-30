const { handler } = require('../dist/lambda');

exports.handler = async (event, context, callback) => {
    return handler(event, context, callback);
};
