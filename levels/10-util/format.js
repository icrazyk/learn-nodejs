var util = require('util');
var str = util.format("My %s !!!!! %d %j", "строка", 123, { test: "Hello World" });
console.log(str);