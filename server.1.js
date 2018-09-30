#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var YQL     = require('yql');
var jade    = require('jade');
var http    = require('http');
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.IP;
        self.port      = process.env.PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 0.0.0.0');
            self.ipaddress = "0.0.0.0";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application pages.
     */
    self.createRoutes = function() {
        self.routes = { };
        

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
	    self.routes['/help'] = function(req, res) {
            
			
			
			res.render('home', { title: 'Ninja Store'},function(err, html){
 				res.send(html);
				if (err) { res.redirect('/asciimo');}
            });
              
			  
			  
        };

		 self.routes['/rss'] = function(req, res) {
            var numero = "";
			
			fs.readFile("test.txt", 'utf-8', function (error, data) {
				// Write headers.
				 
				// Increment the number obtained from file.
				data = parseInt(data) + 1;
				numero= data;
				// Write incremented number to file.
				fs.writeFile('test.txt', data);
		    });
   
            var classe= '[@class="yom-top-story-content-0"]';
            var richiesta= "SELECT * FROM html WHERE url='https://it.finance.yahoo.com/'  AND xpath='//*"+classe+"/span/ul/li'"
            
			new YQL.exec(richiesta, function(response) {
               if (response.error) {
                  results = "impossibile raccogliere i dati richiesti";;
               } else {
                //response consists of JSON that you can parse
			      
 					var results = response.query.results.li[1].div.a.content;
 			   }
                    res.send('<!doctype html>\n<html lang="en">\n' + 
     	          '\n<meta charset="utf-8">\n<title>Test web page on node.js</title>\n' + 
                   '<style type="text/css">* {font-family:arial, sans-serif;}</style>\n' + 
                  '\n\n<h1>Pagina di prova RSS</h1>\n' +'\n\n<h2>Caricamenti file: '+numero+'</h2>\n'+
		          '\n\n<h2>Variabile indirizzo: '+results+ '</h2>\n'+
                  '<div id="content"><p>elenco di prova:</p><ul><li>England</li>'+
				  '<li>France</li><li>Sweden</li><li>Ukraine</li></ul></div>'+ 
		          '\n\n');
			   	
				//res.render('home', { title: 'Risultati' });
            });

			
            
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
 		
	    self.app.set('views', __dirname + '/views');
	    self.app.set('view defaultEngine', 'jade');
  		self.app.use(express.static(__dirname + '/public')); 
  		http.createServer(self.app);
         //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        //self.setupVariables(); //bloccato per funzionare su cloud9
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(process.env.PORT, process.env.IP, function() { //porta cambiata per funzionare su cloud9
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, process.env.PORT);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

