var fs = require('fs'),
	os = require('os'),
	path = require('path'),
	child = require('child_process'),
	execSync = child.execSync,
	fileDir = 'linkFiles',
	files = fs.readdirSync(fileDir,'utf8'),
	jsdom = require("jsdom"),
	jQuery = "http://code.jquery.com/jquery.js",
	dbName = 'test',
	pageDataTblName = 'pageData',
	dbStructure = 'create table '+pageDataTblName+'(title text, desc text, keywords text, h1 text, ogDesc text, ogImg text, ogTitle text, itmPrpDesc text, itmPrpTitle text, itmPrpAbout text, itmPrpHeadline text, itmPrpImage text)';

/*
	
https://www.npmjs.com/package/jsdom
https://github.com/tmpvar/jsdom
	
var url = 'http://www.crocs.com/c/men',
var url = 'http://www.crocs.com/p/crocs-classic/10001.html',
var url = 'https://www.washingtonpost.com/local/trafficandcommuting/in-gentrified-shaw-old-timers-offer-advice-to-young--and-sometimes-naive--newcomers/2016/11/20/a1247940-ada4-11e6-a31b-4b6397e625d0_story.html';

*/

for (var i in files) {
	var filePath = fileDir+path.sep+files[i];
	if(/\.txt/.test(filePath)){
		var lineReader = require('readline').createInterface({
		  input: require('fs').createReadStream(filePath)
		});

		lineReader.on('line', function (url) {
		  	// url may not be a url and fail
			getUrlData(url,jQuery,function(err,data){
				if(err){
					console.log(err);
				}else{
					putDataInDB(data, dbName, dbStructure, function(err, data){
						if(err){
							console.log(err);
						}
					});
				}
			});
		  
		});
	}
}

function getUrlData(url, jQuery, cb){
	jsdom.env(
	  url,
	  [jQuery],
	  function (err, window) {
		  if(err){
			  cb(err, null);
		  }else{
			  var data = {
			  	title : window.document.title ? window.document.title.trim() : '',
			  	desc : getMeta('description', window),
			  	keywords : getMeta('keywords', window),			  	
				h1 : window.$("h1") && window.$("h1").text() ? window.$("h1").text().trim() : '',
			  	ogDesc : getOg('description', window),
				ogImg : getOg('image', window),
				ogTitle : getOg('title', window),
				itmPrpDesc : getItemProp('description', window),
				itmPrpTitle : getItemProp('title', window),
				itmPrpAbout : getItemProp('about', window),
				itmPrpHeadline : getItemProp('headline', window),
				itmPrpImage : getItemProp('image', window),
				// TODO: category : use algorithms to determine category
			  	url : url
			  };

			  cb(null,data);
		  }
	  }
	);
}

function putDataInDB(data, dbName, dbStructure, cb){
	// using sqlite3 and not escaping text correctly, temporary solution
	if(!fs.existsSync(dbName)){
		execSync("sqlite3 "+dbName+" '"+dbStructure+"'"+os.EOL, {cwd: './'});
	}
	var pageDataArr = [data.title, data.desc, data.keywords, data.h1, data.ogDesc, data.Img, data.ogTitle, data.itmPrpDesc, data.itmPrpTitle, data.itmPrpAbout, data.itmPrpHeadline, data.itmPrpImage];
	var cleanArr=[];
	for (var len=pageDataArr.length, i = 0; i<len;i++){
		if(pageDataArr[i] && pageDataArr[i].trim()){
			cleanArr.push(pageDataArr[i].replace(/"|'|,/g,''));
		}else{
			cleanArr.push('');
		}
	}
	var pageDataStr = JSON.stringify(cleanArr).replace(/\[|\]/g, '');
	execSync("sqlite3 "+dbName+" 'insert into "+pageDataTblName+" values("+pageDataStr+")';"+os.EOL, {cwd: './'});
	// https://cloud.google.com/datastore/docs/reference/libraries#client-libraries-install-nodejs
	// https://github.com/mapbox/node-sqlite3
	// http://stackoverflow.com/questions/30080535/escape-a-string-in-node-js-to-insert-it-in-a-sqlite3-database
	// http://www.thegeekstuff.com/2012/09/sqlite-command-examples/
	// sqlite3 test 'select * from pageData';
}

function getMeta(name, window){
  if(window.$("meta[name='"+name+"']") && window.$("meta[name='"+name+"']").attr("content") && window.$("meta[name='"+name+"']").attr("content").trim()){
	  return window.$("meta[name='"+name+"']").attr("content").trim();
  }
  return '';
}
function getOg(name, window){
  if(window.$("meta[property='og:"+name+"']") && window.$("meta[property='og:"+name+"']").attr("content") && window.$("meta[property='og:"+name+"']").attr("content").trim()){
	  return window.$("meta[property='og:"+name+"']").attr("content").trim();
  }
  return '';
}
function getItemProp(itemProp, window){
  if(window.$("[itemprop="+itemProp+"]") && window.$("[itemprop="+itemProp+"]").length){
	  if( window.$(window.$("[itemprop="+itemProp+"]")[0]).attr('content') && window.$(window.$("[itemprop="+itemProp+"]")[0]).attr('content').trim()){
		  return window.$(window.$("[itemprop="+itemProp+"]")[0]).attr('content').trim();
	  }else if(itemProp === 'image'){
		  if(window.$(window.$("[itemprop="+itemProp+"]")[0]).attr('href') && window.$(window.$("[itemprop="+itemProp+"]")[0]).attr('href').trim()){
			  return window.$(window.$("[itemprop="+itemProp+"]")[0]).attr('href').trim();
		  }else if(window.$(window.$("[itemprop="+itemProp+"]")[0]).find('a').length && window.$(window.$(window.$("[itemprop="+itemProp+"]")[0]).find('a')[0]).attr('href').trim()){
			  return window.$(window.$(window.$("[itemprop="+itemProp+"]")[0]).find('a')[0]).attr('href').trim();
		  }
		return '';
	  }else if(window.$(window.$("[itemprop="+itemProp+"]")[0]).text() && window.$(window.$("[itemprop="+itemProp+"]")[0]).text().trim()){
	  	return window.$(window.$("[itemprop="+itemProp+"]")[0]).text().trim();
	  }
	  
	  return '';
  }
  return '';
}