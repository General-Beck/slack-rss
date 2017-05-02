var express = require('express');
var router = express.Router();
var rss = require('rss');
var Slack = require('slack-node');

router.get('/:channel_name', function(req, res, next) {
 	apiToken = process.env.SLACK_API_KEY;
  	slack = new Slack(apiToken);

  	slack.api('groups.list', function(err, response) {
  		for(var c=0; c< response.groups.length; c++) {
  			var channel = response.groups[c];

  			if(channel.id == req.params.channel_name) {
  				var feed = new rss({
  					title:"#" + channel.id,
  					description:"The links that have been posted to the #"+channel.id +" on Slack",
  					site_url: 'https://github.com/gozman/slack-rss',
  					ttl: '30',
  				});

  				slack.api('groups.history', {'channel':channel.id,'count':process.env.HISTORY_LENGTH} ,function(err, response){
			  		for(var i = 0; i < response.messages.length; i++) {
			  			if(response.messages[i].attachments ) {  				
				  			for(var j = 0; j < response.messages[i].attachments.length; j++) {
				  				if(response.messages[i].attachments[j].title) {
				  					var link = response.messages[i].attachments[j];

				  					var t = new Date(response.messages[i].ts * 1000);

				  					feed.item({
				  						title: link.title,
				  						description: link.text,
				  						url: link.title_link,
				  						date: t,
										custom_elements: [{
                    									'media:thumbnail': {
                      										_attr: {
                        										'xmlns:media': "http://search.yahoo.com/mrss/",
                       											url: link.image_url
                      										}
                    									}
										}]
				  					});
				  				}
				  			}
			  			}
  					}

  				res.send(feed.xml({indent: true}));
				});
  			}
  		}
  	});
});

module.exports = router;
