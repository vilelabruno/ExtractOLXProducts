var express = require('express');
var app = express();

var ExtractBot = require('./controller/ExtractBot');
app.use('/ExtractBot', ExtractBot);
module.exports = app;