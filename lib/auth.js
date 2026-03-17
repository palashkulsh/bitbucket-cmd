/*global requirejs,define,fs*/
/**
 * support for filling default auth data while prompting for new repo
 * */
define([
  'commander',
  'fs',
  'rc',
  'path',
  './config',
  'colors'
], function (program, fs, rc, path, config, colors) {

  var Auth = {
    answers: {},

    checkConfig: function () {
	var rcConfig = rc('bitbucketconfig');
      if(!rcConfig.repo_level ){
        console.log('Ops! Seems like your config is out of date. Please reset you configuration.');
        return false;
      } else if (!rcConfig.repo_level[process.cwd()]) {
        console.log('Seems like your ' + process.cwd() + ' is not yet configured. Please set your configuration.');
        return false;
      }else{
        Object.keys(rcConfig).forEach(function(eachKey){
          config[eachKey] = rcConfig[eachKey];
        });
        return true;
      }
    },

    ask: function (question, callback, password, nonMandatory) {
      var that = this;
      if (password) {
        program.password(question, function (answer) {
          if (answer.length > 0) {
            callback(answer);
          } else {
            that.ask(question, callback, true);
          }
        });
      } else {
        program.prompt(question, function (answer) {
          if (answer.length > 0) {
            callback(answer);
          } else if(nonMandatory) {
            return callback();
          } else {
            that.ask(question, callback);
          }
        });
      }
    },

      askDetails: function(callback){
	  var that = this;
	  that.ask('Team subdir URL: https://api.bitbucket.org/2.0/repositories/+ ',  function (answer) {
              that.answers.team = answer;
              that.answers.url = 'https://api.bitbucket.org/2.0/repositories/';
              that.ask('Username: ', function (answer) {
		            that.answers.user = answer;
		            that.ask('Password: ', function (answer) {
                      that.answers.pass = answer;
                      process.stdin.destroy();
                      var reply = that.saveConfig();
                      if (callback) {
			  return callback(reply);
                      }
		  }, true);
              });
          });
      },
      
    setConfig: function (callback) {
      var that = this;
      if (this.checkConfig()) {
        return callback(true);
      } else {
        var configFile = rc('bitbucketconfig');
        if(configFile && configFile.default && configFile.default.auth){
            console.log('default config for bitbucket cmd found on your system');
	    that.ask('Use default best config [y/n]', function(answer){
		if(answer !== 'n' ){
		    return that.setDefaultConfig(callback);
		}
		that.askDetails(callback);
	    }, true);
        }else {
	    that.askDetails(callback);
	}            
      }
    },

    setDefaultConfig: function(callback){
      var that = this;
      var configFile = rc('bitbucketconfig');
      that.answers.url = configFile.default.auth.url;
      that.answers.finalurl = configFile.default.auth.finalurl;
      that.answers.user = configFile.default.auth.user;
      that.answers.token = configFile.default.auth.token;
      that.answers.team = configFile.default.auth.team;
      //setting default target branch for root level
      that.answers.default_dest_branch = configFile.default.default_dest_branch;
      var reply = that.saveConfig();
      if(callback){
        return callback(reply);
      } else {
        return reply;
      }
    },
          
    clearConfig: function () {
      var that = this;
      var rcConfig = rc('bitbucketconfig');
      if (!fs.existsSync(rcConfig.config)) {
        console.log('There is no stored data. Skipping.');
      } else {
        program.confirm('Are you sure you want to delete config at location '+rcConfig.config+'? ', function (answer) {
          if (answer) {
            fs.unlinkSync(rcConfig.config);
            console.log('Configuration deleted successfully!');
          }
          process.stdin.destroy();
        });
      }
    },

    saveConfig: function () {
      var configFile = rc('bitbucketconfig');
      var auth;
      if (this.answers.url) {
        if (!/\/$/.test(this.answers.url)) {
          this.answers.url += '/';
        }
      }
      if (this.answers.user && this.answers.pass) {
        this.answers.token = this.answers.user + ':' + this.answers.pass;
        delete this.answers.pass;
      }
      auth = {
        url: this.answers.url,
        user: this.answers.user,
        token: this.answers.token,
        team: this.answers.team,
        repo_name: path.basename(process.cwd())
      };
      
      configFile.default = configFile.default || {};
      configFile.default.auth = configFile.default.auth || auth;
      configFile.default.reviewers = configFile.default.reviewers;
      configFile.default.default_dest_branch = 'master';
      var configPath = path.join(config.getHomePath(),'.'+'bitbucketconfig'+'rc');
      if(!configFile.default.reviewers){
        configFile.default.reviewers = [{username:"danielnv18"},{ uuid:"{140cc970-81cc-4rdf-8fff-571ssgas28d2}"}];
        console.log('please go to '.red+' '+configPath+' and overwrite your reviewer names instead of danielnv18 and jmsv23 . Its important'.red);
      }
      configFile.repo_level = configFile.repo_level || {};
      configFile.repo_level[process.cwd()] = {
        reviewers: [],
        auth: auth
      };
      fs.writeFileSync(configPath, JSON.stringify(configFile, null, 2));
      console.log('Information stored!');      
      return this.checkConfig();
    }
  };
  return Auth;

});
