var winston = require('winston');
var path = require('path');
var ENV = process.env.NODE_ENV;

function getLogger(module)
{
  var sep = path.sep;
  var path_label = module.filename.split(sep).slice(-2).join(sep);

  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: ENV == 'development' ? 'debug' : 'error',
        label: path_label
      })
    ]
  });
}

module.exports = getLogger;