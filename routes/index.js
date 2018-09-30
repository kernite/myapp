//tutti gli handles delle pagine
var fs      = require('fs');
var YQL     = require('yql');
var jade = require('jade');

// handler for homepage
exports.home = function(req, res) {
   var list = {coso:[
       {"title":"Yahoo finanza", "link":"scrap01"},
       {"title":"Ricerca mercatpoli", "link":"scrap02"},
       {"title":"immobiliare ville con giardino", "link":"scrap03"},
       {"title":"yahoo finanza", "link":"scrap04"}
       ]}
   res.render('home', {  "lista": list });
};
 
 
 
exports.link = function(req, res) {
			//recupero e modifica di un file
			var numero = "";
			fs.readFile("test.txt", 'utf-8', function (error, data) {
				// Write headers.
				 
				// Increment the number obtained from file.
				data = parseInt(data) + 1;
				numero= data;
				// Write incremented number to file.
				fs.writeFile('test.txt', data);
		    });
		    
   var link = "http://i.imgur.com/kmbjB.png";
   res.send("<html><body><img src='" + link + "'></body></html>");
};



//yahoo finanza il primo che serve da esempio
exports.scrap01 = function(req, res) {
    //descrizione del canale
    var RSS={           "title":"Immobiliare",
                        "link":"http://www.immobiliare.it",
                        "description":"ville con giardino " ,
                        "image":"http://www.immobiliare.it/img2/statiche/n1/n1-2012.jpg"
    };
             //recupero dati da origine
            var url='https://it.finance.yahoo.com/';
            var classe= '[@class="yom-top-story-content-0"]';
            var richiesta= "SELECT * FROM html WHERE url='"+url+"'  AND xpath='//*"+classe+"/span/ul/li'";
            
			new YQL.exec(richiesta, function(response) {
               if (response.error) {
                    results = "impossibile raccogliere i dati richiesti";
               } else {
            
            //formattazione dei dati ricevuti
                var dati = response.query.results.li;
                var results =[];
                dati.forEach (function(item){ 
                    if(item.div.a){
                        if(item.div.a.content){
        				      
                            if(item.div.a) { 
                                var coso= {"title": item.div.a.content,
                                            "description": "<![CDATA["+""+"]]>" ,
                                            "content": "",
                                            "link": "https://it.finance.yahoo.com" +item.div.a.href,
                                            "pubDate": new Date(),
                                            "author": item.div.cite
                                            };
                                results.push(coso);//costruisco l'obj dei dati da render
                            }
                        }
                    }
                 });
// var stampa=JSON.stringify(results);
// console.log("risultantee= "+stampa); 
                }
                res.type('xml'); // <-- Type of the file
                // res.header('Content-Type', 'application/xml');
				res.render('scrap01', {"RSS": RSS,  "results": results });
			});
};
 

//****************************
//scansione della pagina di ricerca mercatopoli, solo la prima
//****************************
exports.scrap02 = function(req, res) {
//descrizione del canale
    var chiavi= ['candelabri','vasi'] ;    
    var pagina = 1; 
    var altrapagina=true;
    
    //recupero dati da origine iterando nelle pagine di ricerca
    
    var key=chiavi[0];
    var url='http://vetrina.mercatopoli.it/index.php?id=3419&sf=go&eio_vetrina_key='+key;
    var classe= '//*[@class="list_item_article"]';
    var richiesta= "SELECT * FROM html WHERE url='"+url+"'  AND xpath='"+classe+"'";
            console.log("eseguito>>> "+richiesta);
    
    var RSS={           "title":"Mercatopoli",
                        "link":url,
                        "description":"elenco oggetti ricercati: " ,
                        "image":"http://ragusa.mercatopoli.it/componenti/eio_minisito/slide/1.jpg"
    };
            
			new YQL.exec(richiesta, function(response) {
               if (response.error) {
                    results = "impossibile raccogliere i dati richiesti";
               } else {
            
            //formattazione dei dati ricevuti
                    var dati = response.query.results.div;
                    var results =[];
                    if (dati.length<15){altrapagina=false;}
                    dati.forEach (function(item){ 
                        if(item.div[1].a.b){
             				      
                                     var coso= {"title":item.div[1].a.b,
                                                "description": "<![CDATA["+item.div[2].div[0].content+" euro]]>" ,
                                                "content": "",
                                                "link":"http://vetrina.mercatopoli.it/"+item.div[0].a[0].href  ,
                                                "enclosure":{"url":item.div[0].table.tbody.tr.td.div.img.src,
                                                            "length":"0",
                                                            "type":"image/jpeg"},
                                                "pubDate": new Date(),
                                                "author": item.div[1].div.div.content
                                                };
                                    results.push(coso);//costruisco l'obj dei dati da render
                        }
                    });
 
                }
                res.type('xml'); // <-- Type of the file
                // res.header('Content-Type', 'application/xml');
    	        res.render('scrap01', {"RSS": RSS,  "results": results });
    	        fs.writeFile('test.xml', results);
 			});
  };
  
//********************************  
//scansione multipagina per immobiliare.it
//********************************
exports.scrap03 = function(req, res) {
    var results =[];
    var npagine =0;
    var contatore =1;

//descrizione del canale
    var RSS={           "title":"Immobiliare",
                        "link":"http://www.immobiliare.it",
                        "description":"ville con giardino " ,
                        "image":"http://www.immobiliare.it/img2/statiche/n1/n1-2012.jpg"
    };

    
    //pageCount recupero il numero di pagine
    var url='http://www.immobiliare.it/ricerca.php?idCategoria=1&idContratto=1&idTipologia=12&sottotipologia=&idTipologiaStanza=&idFasciaPrezzo=&idNazione=IT&idRegione=&idProvincia=&idComune=&idLocalita=&idAreaGeografica=&prezzoMinimo=&prezzoMassimo=&balcone=&balconeOterrazzo=&boxOpostoauto=&stato=&terrazzo=&bagni=&mappa=&foto=&boxAuto=&riscaldamenti=&giardino=10&superficie=&superficieMinima=&superficieMassima=&raggio=&locali=&localiMinimo=&localiMassimo=&criterio=rilevanza&ordine=desc&map=0&tipoProprieta=&arredato=&inAsta=&noAste=&aReddito=&fumatore=&animali=&franchising=&flagNc=&gayfriendly=&internet=&sessoInquilini=&vacanze=&categoriaStanza=&fkTipologiaStanza=&ascensore=&classeEnergetica=&verticaleAste=&pag=1&vrt=45.444235041018,8.884506225586;45.455314263478,8.984069824219;45.482280661639,8.973083496094;45.508271755945,8.997116088867;45.54531238321,9.000549316406;45.577522694837,9.001235961914;45.599146119878,8.980293273926;45.620761214967,8.944244384766;45.608994029539,8.899269104004;45.586653601467,8.875579833984;45.60202861384,8.825454711914;45.630845408684,8.802108764648;45.64860838388,8.760223388672;45.578964515663,8.71696472168;45.524630364755,8.774642944336;45.463983441273,8.828201293945;45.444235041018,8.884506225586';
    var classe= '//*[@id="pageCount"]';
    var richiesta= "SELECT * FROM html WHERE url='"+url+"'  AND xpath='"+classe+"'";
 	new YQL.exec(richiesta, function(response) {
        if (response.error) {
                    npagine = 1;
        } else {
            //formattazione dei dati ricevuti
             npagine =2;//response.query.results.div.strong[1];
        }
    console.log("num pagine>>> "+npagine);
     
     
        //recupero dati da origine iterando nelle pagine di ricerca
         function uploader(i) {
            if( i <= npagine ) {
                var url='http://www.immobiliare.it/ricerca.php?idCategoria=1&idContratto=1&idTipologia=12&sottotipologia=&idTipologiaStanza=&idFasciaPrezzo=&idNazione=IT&idRegione=&idProvincia=&idComune=&idLocalita=&idAreaGeografica=&prezzoMinimo=&prezzoMassimo=&balcone=&balconeOterrazzo=&boxOpostoauto=&stato=&terrazzo=&bagni=&mappa=&foto=&boxAuto=&riscaldamenti=&giardino=10&superficie=&superficieMinima=&superficieMassima=&raggio=&locali=&localiMinimo=&localiMassimo=&criterio=rilevanza&ordine=desc&map=0&tipoProprieta=&arredato=&inAsta=&noAste=&aReddito=&fumatore=&animali=&franchising=&flagNc=&gayfriendly=&internet=&sessoInquilini=&vacanze=&categoriaStanza=&fkTipologiaStanza=&ascensore=&classeEnergetica=&verticaleAste=&pag='+i+'&vrt=45.444235041018,8.884506225586;45.455314263478,8.984069824219;45.482280661639,8.973083496094;45.508271755945,8.997116088867;45.54531238321,9.000549316406;45.577522694837,9.001235961914;45.599146119878,8.980293273926;45.620761214967,8.944244384766;45.608994029539,8.899269104004;45.586653601467,8.875579833984;45.60202861384,8.825454711914;45.630845408684,8.802108764648;45.64860838388,8.760223388672;45.578964515663,8.71696472168;45.524630364755,8.774642944336;45.463983441273,8.828201293945;45.444235041018,8.884506225586';
                var classe= '//*[@class="annuncio_title"]';
                var richiesta= "SELECT * FROM html WHERE url='"+url+"'  AND xpath='"+classe+"'";
                console.log("pagina>>> "+i);
                 
                new YQL.exec(richiesta, function(response) {
                   if (response.error) {
                        results = "impossibile raccogliere i dati richiesti";
                        console.log('>>>>error: '+response.error);
                   } else {
                        //formattazione  dati ricevuti in results, verso link pagine
                        var dati = response.query.results.div;
                        var numeroitems =dati.length;
                        console.log("items>>> "+numeroitems);
                        dati.forEach (function(item){ 
                            if(item.strong.a){
                 				      
                                        // var coso= {"title":item.strong.a.content,
                                                    // "description": "<![CDATA[  euro]]>" ,
                                                    // "content": "",
                                                    // "link":item.strong.a.href  ,
                                                    // "enclosure":{"url":"",
                                                    //             "length":"0",
                                                    //             "type":"image/jpeg"},
                                                    // "pubDate": new Date(),
                                                    // "author": "immobiliare"
                                                    // };
                                        //results.push(coso);//costruisco l'obj dei dati da render
                                        
                                      
                                        //recupero i dati dalla pagina dell'annuncio
                                        var url=item.strong.a.href;
                                        var classe= '//*[@id="sx"]';
                                        var richiesta= "SELECT * FROM html WHERE url='"+url+"'  AND xpath='"+classe+"'";
                                       
                                        //var contatore =0;
                                        
                                        new YQL.exec(richiesta, function(response) {
                                           if (response.error) {
                                                results = "impossibile raccogliere i dati richiesti";
                                                console.log('>>>>error: '+response.error);
                                           } else {
                                                 //formattazione dei dati ricevuti in results
                                                var dati = response.query.results.div;
                                                //compilo l'oggetto con le proprietà immobile
                                                console.log("casa>>>__ "+dati.div[0].div.div[1].div[0].div[1].strong.content);
                                                for(i=0;i<dati.div.length;i++){
                                                    if(dati.div[i].id=="dettagli"){ 
                                                        var param = dati.div[i].div.table[0].tbody.tr;
                                                    }
                                               
                                                }
                                                //console.log("casa>>> "+JSON.stringify(param));
                                                var parametri={};
                                                console.log("numero righe>>> "+param.length);
                                                
                                                for (i=0;i<param.length;i++){
                                                    if(!param[i]){console.log("saltato>>> "+i);}
                                                    else{
                                                        //console.log('>>>>prarametro: '+i+" "+param[i].td[0].content.slice(0,-2).replace(/ /g, "_")+" - "+param[i].td[1]);
                                                        parametri[param[i].td[0].content.slice(0,-2).replace(/ /g, "_")] = param[i].td[1];
                                                        
                                                        if (!param[i].td[2].content){console.log("saltato>>> b"+i);}
                                                        else{
                                                            //console.log('>>>>prarametro: '+i+"b "+param[i].td[2].content.slice(0,-2).replace(/ /g, "_")+" - "+param[i].td[3]);
                                                            parametri[param[i].td[2].content.slice(0,-2).replace(/ /g, "_")] = param[i].td[3];
                                                        }
                                                    }
                                                }
                                                
                                                
                                                    if(dati.div){
                                                        
                                                            var piani = "";
                                                            if( parametri.Totale_Piani){piani = parametri.Totale_Piani}
                                                            var proprieta = "";
                                                            if(parametri.Terreno_proprietà){proprieta= parametri.Terreno_proprietà}
                                                                var coso= {"title":dati.div[0].div.div[1].div[0].div[1].strong.content  ,
                                                                            "description": "<![CDATA[ "+  dati.div[0].div.div[1].div[1].div[0].content+" "+dati.div[0].div.div[1].div[1].div[0].strong.content+", estensione proprieta: "+ proprieta +", Piani: "+ piani+" ]]>" ,
                                                                            "content":"",
                                                                            "link":url ,
                                                                            "enclosure":{"url":dati.div[2].div[3].div[0].div.div[1].div[2].img.src,
                                                                                        "length":"0",
                                                                                        "type":"image/jpeg"},
                                                                            "pubDate": new Date(),
                                                                            "author": "immobiliare"
                                                                            };
                                                                results.push(coso);//costruisco l'obj dei dati da render
                                                                if(contatore == numeroitems){
                                                                    console.log("items caricati>>>  "+contatore);
                                                                    contatore=1;
                                                                    uploader(i+1); 
                                                                    
                                                                 }else{
                                                                     //console.log("contatore>>>  "+contatore);
                                                                     contatore++;}
                                                    }
                                                }
                                        }); 
                            }
                        });
                   }
                });
                                        
            }else{
                //qui ho l'oggetto results con tutti i dati da usare
                res.type('xml'); // <-- Type of the file
                //renderizzo pagina per salvare file
                var xml = jade.renderFile('views/scrap01.jade', {"RSS": RSS,  "results": results });
                //console.log("file>>>  "+xml);
  				fs.writeFile('public/immobiliare.xml', xml);
                 // renderizzo la pagina come risposta;
                res.render('scrap01', {"RSS": RSS,  "results": results } );
            
                
            }
        }
         uploader(1); // avvio il ciclo di recupero dei link nelle pagine
  	});
    
};

//****************************
//scraper di ebay
//****************************
exports.scrap04 = function(req, res) {
    var results =[];
    var keywords=encodeURIComponent(req.query.q);//.replace(/\s/g, '+');
    var filtri= req.query.f;
    var limitepagine=15;
    var pagina=0;
    var url ='http://www.ebay.it/sch/i.html?_from=R40&_sacat=0&_mPrRngCbx=1&_udlo=&_udhi=200&_nkw='+keywords+'&LH_PrefLoc=2&_sop=10';
               
//descrizione del canale
    var RSS={           "title":"ebay - "+ req.query.q,
                        "link":url,
                        "description":" Ricecerca di : "+ req.query.q ,
                        "image":"http://ir.ebaystatic.com/rs/v/fxxj3ttftm5ltcqnto1o4baovyl.png"
    };

       
        //recupero dati da origine iterando nelle pagine di ricerca
        function uploader(url) {
            if( url != "fine" ) {
                
                var classe= '//*[@id="mainContent"]';
                var richiesta= "SELECT * FROM html WHERE url='"+url+"' AND xpath='"+classe+"'";
                console.log("pagina>>> "+url);
                 
                new YQL.exec(richiesta, function(response) {
                   if (response.error) {
                        results = "impossibile raccogliere i dati richiesti";
                        console.log('>>>>error: '+response.error);
                   } else {
                        //formattazione  dati ricevuti in results, cerco link pagine
                         var dati = response.query.results.div["w-root"].div.div[1].ul.li;

                        var numeroitems =dati.length;
                        console.log("items nella pagina>>> - "+numeroitems);
                        dati.forEach(function(item){ 
                            if(item){
                                //applico il filtro
                                var procedi=filtra(item.h3.a.content,filtri);
                                console.log("filtri>>> - "+procedi);
                                if(procedi){
                                
                                        if(item.div.div){ if(item.div.div.a[0]){var imgurl=item.div.div.a[0].img.src}else{ imgurl=item.div.div.a.img.src}}
                                        if( item.ul[0].li[2].span.span){var spedizione=item.ul[0].li[2].span.span.content}else{spedizione=""}
                                        var coso= {"title":item.h3.a.content,
                                                    "description": "<![CDATA[ "+ item.ul[0].li[0].span.content+" euro "+ spedizione+" ]]>" ,
                                                    "content": "",
                                                    "link":item.h3.a.href  ,
                                                    "enclosure":{"url":imgurl,
                                                                "length":"0",
                                                                "type":"image/jpeg"},
                                                    "pubDate": new Date(),
                                                    "author": "ebay"
                                                    };
                                        results.push(coso);//costruisco l'obj dei dati da render
                                }
                            }
                        });
                        if (response.query.results.div.div[3].table.tbody.tr.td[2].a.href.substring(0, 4)=="http" && pagina< limitepagine){
                            pagina++;
                            uploader(response.query.results.div.div[3].table.tbody.tr.td[2].a.href); 
                         }else{uploader("fine")}
                    }
                });
             }else{
                //qui ho l'oggetto results con tutti i dati da usare
                res.type('xml'); // <-- Type of the file
                // renderizzo la pagina come risposta;
                res.render('scrap01', {"RSS": RSS,  "results": results } );
             }
        }
    uploader(url); // avvio il ciclo di recupero dei link nelle pagine
 };

  
 
//****************************
//scraper di finanza.com
//****************************
 
exports.scrap05 = function(req, res) {
    var results =[];
    var filtri= req.query.f; // ?q=knob+bronze&f=Affari&f=borsa&f=unicredit&f=draghi&f=disney&f=street&f=borse
    var limitepagine=15;
    var pagina=0;
    var url='http://www.finanza.com/notizie/notiziario/';
 
   
    
               
//descrizione del canale
    var RSS={           "title":"Finanaza.com " ,
                        "link":url,
                        "description":" Finanza " + new Date() ,
                        "image":"http://immagini.finanza.com/immagini/sito/logo-finanazacom.jpg"
    };
             //recupero dati da origine
            
            var classe= '//*[@class="div_articolo"]';
            var richiesta= "SELECT * FROM html WHERE url='"+url+"' AND xpath='"+classe+"'";
            
			new YQL.exec(richiesta, function(response) {
               if (response.error) {
                    results = "impossibile raccogliere i dati richiesti";
                    console.log('>>>>error: '+response.error);
               } else {
            
            //formattazione dei dati ricevuti
                var dati = response.query.results.div;
                var results =[];
                dati.forEach (function(item){ 
                    if(item.h2.a.content){
                            //applico il filtro
                            var procedi=filtra(item.h2.a.content.toLowerCase(),filtri);
                            //console.log("filtri>>> - "+procedi);
                            if(procedi){
                                        var coso= {"title":item.h2.a.content,
                                                    "description": "<![CDATA[ "+ item.p+" ]]>" ,
                                                    "content": "",
                                                    "link":"http://www.finanza.com/"+item.h2.a.href  ,
                                                    "enclosure":{"url":"http://www.finanza.com/"+item.img.src,
                                                                "length":"0",
                                                                "type":"image/jpeg"},
                                                    "pubDate": item.span[1].content,
                                                    "author": item.span[0].content
                                                    };
                                                    
                                results.push(coso);//costruisco l'obj dei dati da render
                            }
                    }
                 });
// var stampa=JSON.stringify(results);
// console.log("risultantee= "+stampa); 
                }
                res.type('xml'); // <-- Type of the file
                // res.header('Content-Type', 'application/xml');
				res.render('scrap01', {"RSS": RSS,  "results": results });
			    //renderizzo pagina per salvare file
                var xml = jade.renderFile('views/scrap01.jade', {"RSS": RSS,  "results": results });
                //console.log("file>>>  "+xml);
  				fs.writeFile('public/finanza.xml', xml);

			});
};
 
//****************************
//scraper di radiocor
//****************************
 
exports.scrap07 = function(req, res) {
    var results =[];
    var filtri= req.query.f; // ?q=knob+bronze&f=Affari&f=borsa&f=unicredit&f=draghi&f=disney&f=street&f=borse
    var limitepagine=15;
    var pagina=0;
    var url='http://finanza-mercati.ilsole24ore.com/azioni/analisi-e-news/tutte-le-news/news-radiocor/news-radiocor.php';
 
                
//descrizione del canale
    var RSS={           "title":"Radiocor news 24 ore " ,
                        "link":url,
                        "description":" radiocor " + new Date() ,
                        "image":"http://www.radiocor.ilsole24ore.com/Content/images/radiocor1.png"
    };
             //recupero dati da origine
            
            var classe= '//*[@class="radiocor-spalla-sinistra"]';
            var richiesta= "SELECT * FROM html WHERE url='"+url+"' AND xpath='"+classe+"'";
            
			new YQL.exec(richiesta, function(response) {
               if (response.error) {
                    results = "impossibile raccogliere i dati richiesti";
                    console.log('>>>>error: '+response.error);
               } else {
            
            //formattazione dei dati ricevuti
                var dati = response.query.results.div.table.tbody.tr;
                var results =[];
                dati.forEach (function(item){ 
                    if(item.td[0].a){
                            //applico il filtro
                            var procedi=filtra(item.td[0].a.content.toLowerCase(),filtri);
                            //console.log("filtri>>> - "+procedi);
                            if(procedi){
                                        var coso= {"title":item.td[0].a.content,
                                                    "description": "<![CDATA[ "+ item.p+" ]]>" ,
                                                    "content": "",
                                                    "link":"http://finanza-mercati.ilsole24ore.com"+item.td[0].a.href  ,
                                                    "enclosure":{"url":"",
                                                                "length":"0",
                                                                "type":"image/jpeg"},
                                                    "pubDate":  item.td[0].div.span[0].content+" "+item.td[0].div.span[1].content,
                                                    "author": " radiocor "
                                                    };
                                                    
                                results.push(coso);//costruisco l'obj dei dati da render
                            }
                    }
                 });
// var stampa=JSON.stringify(results);
// console.log("risultantee= "+stampa); 
                }
                res.type('xml'); // <-- Type of the file
                // res.header('Content-Type', 'application/xml');
				res.render('scrap01', {"RSS": RSS,  "results": results });
			    //renderizzo pagina per salvare file
                var xml = jade.renderFile('views/scrap01.jade', {"RSS": RSS,  "results": results });
                //console.log("file>>>  "+xml);
  				fs.writeFile('public/radiocor.xml', xml);

			});
};


//****************************
//scraper di ansa.it notizie ultima ora
//****************************
 
exports.scrap06 = function(req, res) {
    var results =[];
    var filtri= req.query.f; // ?q=knob+bronze&f=Affari&f=borsa&f=unicredit&f=draghi&f=disney&f=street&f=borse
    var limitepagine=15;
    var pagina=0;
    var url='http://www.ansa.it/sito/notizie/topnews/index.shtml';
 
   
    
               
//descrizione del canale
    var RSS={           "title":"ansa.it " ,
                        "link":url,
                        "description":" Ultima ora " + new Date() ,
                        "image":"http://ir.ebaystatic.com/rs/v/fxxj3ttftm5ltcqnto1o4baovyl.png"
    };
             //recupero dati da origine
            
            var classe= '//*[@class="news small"]';
            var richiesta= "SELECT * FROM html WHERE url='"+url+"' AND xpath='"+classe+"'";
            
			new YQL.exec(richiesta, function(response) {
               if (response.error) {
                    results = "impossibile raccogliere i dati richiesti";
                    console.log('>>>>error: '+response.error);
               } else {
            
            //formattazione dei dati ricevuti
                var dati = response.query.results.article;
                var results =[];
                dati.forEach (function(item){ 
                    if(item.header.h3.a.content){
                            //applico il filtro
                            var procedi=true;//filtra(item.h2.a.content.toLowerCase(),filtri);
                            //console.log("filtri>>> - "+procedi);
                            if(procedi){
                                        var coso= {"title":item.header.h3.a.content,
                                                    "description": "<![CDATA[ "+ item.p.content+" ]]>" ,
                                                    "content": "",
                                                    "link":"http://www.ansa.it"+item.header.h3.a.href  ,
                                                    "enclosure":{"url":"http://wwwrb.ansa.it"+item.a.img["data-src"],
                                                                "length":"0",
                                                                "type":"image/jpeg"},
                                                    "pubDate": item.header.div.em.content,
                                                    "author": "ansa"
                                                    };
                                                    
                                results.push(coso);//costruisco l'obj dei dati da render
                            }
                    }
                 });
// var stampa=JSON.stringify(results);
// console.log("risultantee= "+stampa); 
                }
                res.type('xml'); // <-- Type of the file
                res.header('Content-Type', 'application/xml');
				res.render('scrap01', {"RSS": RSS,  "results": results });
				
                  //renderizzo pagina per salvare file
                var xml = jade.renderFile('views/scrap01.jade', {"RSS": RSS,  "results": results });
                //console.log("file>>>  "+xml);
  				fs.writeFile('public/ansa.xml', xml);
 			});
};



/****
funzione di filtro a cui passo il titolo come stringa e filtri come vettore di parole da ricercare
**/
function filtra(titolo, filtri ) {
    var filtro=false;
    if (typeof filtri === 'string'){
        if (titolo.indexOf(filtri) > -1) {
             filtro = true;// str contains arr[i]
             }
    }else{
        for (var i = 0, len = filtri.length; i < len; ++i) {
             if (titolo.indexOf(filtri[i]) > -1) {
                 filtro = true;// str contains arr[i]
                 }
        }
    }
    return filtro;
}  