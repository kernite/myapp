#!/bin/env node
// elenco moduli richiesti
var express = require('express');
var fs      = require('fs');
var http    = require('http');
var path = require('path');
var request = require("request");
  
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/**
 *  Define the sample application.
 */
var routes = require('./routes/index');
//var users = require('./routes/users');

//impostazione dell'indirizzo del server
var ipaddress = process.env.IP;
var port      = process.env.PORT || 8080;
if (typeof  ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 0.0.0.0');
            ipaddress = "0.0.0.0";
    };
//creo unistanda di express che sarà la mia applicazione
var app = express();

// imposto la traduzione delle pagine html da JADE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 
/**********
*error handlers
*/
/// catch 404 and forwarding to error handler
/*app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
 */
// development error handler-- will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/*****************
 * create gestione dei link
*/
app.get('/', function(req, res) { res.redirect('/index');}); 
app.get('/index',  routes.home); 
app.get('/link', routes.link); 
app.get('/scrap01', routes.scrap01); //app.get('/scrap01.:name(rss|xml)', routes.scrap01); per avere estensione .xml o .rss
app.get('/scrap02', routes.scrap02);
app.get('/scrap03', routes.scrap03); 
app.get('/scrap04', routes.scrap04);
app.get('/scrap05', routes.scrap05); //finanza com
app.get('/scrap06', routes.scrap06); //ansa
app.get('/scrap07', routes.scrap07); //radiocor

//temporizzazione della creazione del file immobiliare
setInterval(function(){request("http://myapp-tgreblu.rhcloud.com/scrap03", function(error, response, body) {}); 
}, 24 * 60 * 60 * 1000); //  h*min*sec*ms   

setInterval(function(){request("http://myapp-tgreblu.c9users.io/scrap06", function(error, response, body) {}); 
},   5 * 60 * 1000); //  h*min*sec*ms   

setInterval(function(){request("http://myapp-tgreblu.rhcloud.com/scrap05?f=affari&f=borsa&f=borse&f=unicredit&f=draghi&f=disney&f=street&f=intesa&f=usa", function(error, response, body) {}); 
},   5 * 61 * 1000); //  h*min*sec*ms

setInterval(function(){request("http://myapp-tgreblu.rhcloud.com/scrap07?f=affari&f=borsa&f=borse&f=unicredit&f=draghi&f=disney&f=street&f=intesa&f=usa", function(error, response, body) {}); 
},   5 * 62 * 1000); //  h*min*sec*ms
/*****************
 * create HTTP server e Listen on provided port, on all network interfaces.
 */
var server = http.createServer(app);           
server.listen(port, ipaddress, function() { //porta cambiata per funzionare su cloud9
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), ipaddress, port);
        });

module.exports = app;