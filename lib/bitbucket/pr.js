/*global requirejs,console,define,fs*/
// Dan Shumaker
// Documentation: https://developer.atlassian.com/bitbucket/api/2/reference/

var BASE_URL = 'https://bitbucket.org/';
define([
    'superagent',
    'cli-table',
    'moment',
    'path',
    '../../lib/config',
    'simple-git',
     'colors',
     'openurl',
     'commander',
     'async'
], function (request, Table, moment, path, config, git, colors, openurl, program, async) {

    function ask (question, callback, yesno, values, answer, optionalAnswer) {
       var that = this,
           options = options || {},
           issueTypes = [],
           i = 0;
       if(answer || answer===false){
         return callback(answer);
       }
       if (values && values.length > 0) {
         for (i; i < values.length; i++) {
           if (that.isSubTask) {
             if (values[i].subtask !== undefined) {
               if (values[i].subtask) {
                 issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
               }
             } else {
               issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
             }
           } else {
             if (!values[i].subtask) {
               issueTypes.push('(' + values[i].id + ') ' + (values[i].name?values[i].name :values[i].value));
             }
           }
         }
         console.log(issueTypes.join('\n'));
       }
       program.prompt(question, function (answer) {
         if (answer.length > 0) {
           callback(answer);
         } else {
           if (yesno) {
             callback(false);
           } else if(optionalAnswer) {
	       callback(optionalAnswer);
	   }else {
               ask(question, callback);
           }
         }
       }, options);
     }

     function getPRForCurrentBranch(options, cb){
       if(options.__branch){
         getPullRequests(options, cb);
       } else if (options.__pr_id) {
         getPullRequests(options, cb);
       } else {
         var conf = getConfig();
         git(conf.currentPath).status(function (err, statusRes){
           if(err){
             console.log(err);
             return cb();
           }
           options.__branch = statusRes.current;
           return getPullRequests(options, cb);
         });
       }
     }

     function createPullReq(options, conf, destBranch, sourceBranch, cb){
       console.log("Create Pull Request");
       var reviewers = conf.currentConfig.reviewers.length ? conf.currentConfig.reviewers : conf.default.reviewers;
       var json_package;
       json_package = {
         "destination": {
           "branch": {
             "name": destBranch
           }
         },
         "source": {
           "branch": {
             "name": sourceBranch
           }
         },
         "title": options.message,
         "description": options.message,
         "reviewers": reviewers
       };
       console.log(conf.finalUrl, json_package)
       request
       .post(conf.finalUrl)
       .send(json_package)
       .set('Content-Type', 'application/json')
       .set('Authorization', 'Basic ' + conf.finalToken)
       .end(function (res) {
         if (!res.ok) {
           console.log(res.text);
           //return console.log((res.body.errorMessages || [res.error]).join('\n'));
           return cb(new Error((res.body.errorMessages || [res.error]).join('\n')));
         }
         //return console.log("\n\nView PR @ " + getConfig(null, res.body.id).viewUrl);
         pullrequest.open({open: res.body.id},function(){});
         return cb(null, "\n\nView PR @ " + getConfig(null, res.body.id).viewUrl)
       });
     }

  

  function fillTemplate(templateString, templateVars){
    return new Function("return `"+templateString +"`;").call(templateVars);
  }
  
     function getConfig(type,prId, path){
       var currentPath = path || process.cwd() ;
       var currentConfig = config.repo_level[currentPath] || config.default;
       var endPoint = [currentConfig.auth.team, currentConfig.auth.repo_name].join('/');
       var finalUrl = currentConfig.auth.url + endPoint;
       debugger
       if(currentConfig.auth.finalurl){
         let templateVars = {
           team : currentConfig.auth.team,
           repo_name : currentConfig.auth.repo_name
         }
         finalurl = fillTemplate(currentConfig.auth.finalurl, templateVars);
       }
       var finalToken = new Buffer(currentConfig.auth.token).toString('base64');
       var viewUrl = BASE_URL + endPoint;
       var urlArr = [];
       if (prId){
         urlArr.push(prId);         
       }
       if (type){
         urlArr.push(type.toLowerCase());
       }
       viewUrl = [viewUrl, 'pull-requests', urlArr.join('/')].join('/');
       finalUrl = [finalUrl, 'pullrequests', urlArr.join('/')].join('/');
       return {
         repo_name: currentConfig.auth.repo_name,
         username: currentConfig.auth.user,
         default: config.default,
         currentPath: currentPath,
         currentConfig: currentConfig,
         endPoint: endPoint,
         finalUrl: finalUrl,
         finalToken: finalToken,
         viewUrl: viewUrl
       };
     }

     function getPullRequests(options, callback){
       /***
        * https://developer.atlassian.com/bitbucket/api/2/reference/meta/filtering
        * */
       var conf = getConfig(null, null, options.__overridePath);
       var query = '?fields=%2Bvalues.reviewers.nickname,values.id,values.title,values.state,values.destination.branch.name,values.source.branch.name,values.author.nickname&q=state="open"';
            if (options.list) {
              var user = options.list !== true && isNaN(options.list) ?  options.list : conf.username;
              query = '?fields=%2Bvalues.reviewers.nickname,values.id,values.title,values.state,values.destination.branch.name,values.source.branch.name,values.author.nickname&pagelen=50&q=state="open" AND author.username="'+user+'"';
            }              
            if (options.merged) {
              query = '?q=state+%3D+%22MERGED%22&fields=%2Bvalues.reviewers.nickname,values.id,values.title,values.state,values.destination.branch.name,values.source.branch.name,values.author.nickname&pagelen=50';
            }       
            if (options.review) {
              query = '?fields=%2Bvalues.reviewers.nickname,values.id,values.title,values.state,values.destination.branch.name,values.source.branch.name,values.author.nickname&pagelen=50&q=reviewers.username="'+conf.username+'" AND state="OPEN"';
            }       
            if (options.__branch) {
              query = '?fields=%2Bvalues.reviewers.nickname,values.id,values.title,values.state,values.destination.branch.name,values.source.branch.name,values.author.nickname&pagelen=50&q=source.branch.name="'+options.__branch+'" AND state="OPEN"';
            }
            if (options.__pr_id) {
              query = '?fields=%2Bvalues.reviewers.nickname,values.id,values.title,values.state,values.destination.branch.name,values.source.branch.name,values.author.nickname&pagelen=50&q=id='+ options.__pr_id;
            }
       
            var pullrequests, table;
            i = 0;
            console.log(conf.finalUrl+query)
            request
            .get(conf.finalUrl + query)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Basic ' + conf.finalToken)
            .end(function (res) {
              if (!res.ok) {
                return callback(res.body.errorMessages || [res.error].join('\n'));
              }
              var pull_requests = res.body.values;
              return callback(null, pull_requests);
            });
     }
     
    var pullrequest = {
      getPRForCurrentBranch: function getPRForCurrentBranch(options, cb){
        if(options.__branch){
          getPullRequests(options, cb);
        } else{
          var conf = getConfig();
          git(conf.currentPath).status(function (err, statusRes){
            if(err){
              console.log(err);
              return cb();
            }
            options.__branch = statusRes.current;
            return getPullRequests(options, function(err, res){
                     console.log(JSON.stringify( res, null, 4));
                     return cb(err, res);
                   });
          });
        }
      },

        globalList: function(options, cb){
          if(config &&  config.repo_level){
            options.list=1;   //to only show my diffs
            async.forEachOfSeries(config.repo_level, function(value, key, callback){
              options.__overridePath = key;
              console.log(options.__overridePath)
              pullrequest.list(options, callback);
            }, cb)
          } else{
            return cb();
          }
        },
        
      list: function (options, cb) {
        var conf =  getConfig(null, null, options.__overridePath);
          git(conf.currentPath).status(function(err, statusRes){
            if(err){
              console.log('Can not get current working directory status');
              return cb();
            }
            var currentBranch = statusRes.current;
            
            getPullRequests(options, function(err, pull_requests){
              if(err){
                console.log(err);              
                return cb();
              }
              table = new Table({
                head: ['ID', 'Author', 'Source', 'Destination', 'Title', 'State', 'Reviewers', 'Url'],
                chars: {
                  'top': '═' ,
                  'top-mid': '╤' ,
                  'top-left': '╔' ,
                  'top-right': '╗',
                  'bottom': '═' ,
                  'bottom-mid': '╧' ,
                  'bottom-left': '╚' ,
                  'bottom-right': '╝',
                  'left': '║' ,
                  'left-mid': '╟' ,
                  'mid': '─' ,
                  'mid-mid': '┼',
                  'right': '║' ,
                  'right-mid': '╢' ,
                  'middle': '│'
                },
                style: {
                  'padding-left': 1,
                  'padding-right': 1,
                  head: ['cyan']
                }
              });

              for (i = 0; i < pull_requests.length; i += 1) {
                title = pull_requests[i].title;
                reviewers = pull_requests[i].reviewers.map(function (elem) {
                              return elem.nickname;
                            }).join(",");

                if (title.length > 50) {
                  title = title.substr(0, 47) + '...';
                }
                var color = i % 2==0? 'blue': 'yellow';
                if(currentBranch === pull_requests[i].source.branch.name){
                  pull_requests[i].source.branch.name = '* '+pull_requests[i].source.branch.name.grey;
                }
                table.push([
                  pull_requests[i].id.toString()[color],
                  pull_requests[i].author.nickname[color],
                  pull_requests[i].source.branch.name[color],
                  pull_requests[i].destination.branch.name[color],
                  title[color],
                  pull_requests[i].state[color],
                  reviewers[color],
                  getConfig(null, pull_requests[i].id).viewUrl[color].underline.red
                ]);
              }
              console.log(conf.repo_name.blue)
              if (pull_requests.length > 0) {
                console.log(table.toString());
              } else {
                console.log('No pull_requests');
              }
              return cb();
            });
          });
        },

        //MERGE POST https://api.bitbucket.org/2.0/repositories/dan_shumaker/backup_tar_test/pullrequests/3/merge
      merge: function (options, cb) {
        console.log('getting pull req');
        if(options.merge === true){
          //that means pr_num was not specefied 
          //hence do nothing
        } else {
          //else set the pr_id to the pr number supplied
          options.__pr_id = options.merge;
        }
        var conf = getConfig();
        //get name of current branch
        git(conf.currentPath).status(function (err, statusRes){
          if(err){
            console.log(err);
            return cb();
          }
          var currentBranch = statusRes.current;
          getPRForCurrentBranch(options, function(err, pullreqs){
            if(err){
              console.log(err);
              return cb(err);
            }
            if( pullreqs && pullreqs[0]){
              options.merge = pullreqs[0].id;            
            } else {
              console.log('invalid pull request provided');
              return cb(new Error('invalid pull request provided'));
            }
            var conf = getConfig('MERGE', options.merge);
            var remoteBranch = 'origin';
            console.log("merge");
            var json_package = {
              close_source_branch: true,
              message: options.message,
              //type: what should be here
              merge_strategy: options.merge_strategy || 'squash'
            }
            console.log(conf.finalUrl)
            request
            .post(conf.finalUrl)
            .send(json_package)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Basic ' + conf.finalToken)
            .end(function (res) {
              if (!res.ok) {
                if(res && res.body && res.body.type=='error'){
                  console.log(JSON.stringify(res.body,null, 4))
                }
                return  cb(new Error((res.body.errorMessages || [res.error]).join('\n')));
              }
              console.log("Merged PR @ " + res.body.links.self.href);
              //pulling destination branch after successful merge
              if(res.body && res.body.destination && res.body.destination.branch && res.body.destination.branch.name){
                var destBranch = res.body.destination.branch.name;
                var sourceBranch = res.body.source.branch.name;
                git(conf.currentPath).checkout(destBranch, function(err, info){
                  console.log('checking out to destination  branch '+ destBranch);
                  if(err){
                    console.log('error checking out to destination branch '+destBranch);
                    return cb(new Error('error checking out to destination branch '+destBranch));
                  }                  
                  git(conf.currentPath).pull(remoteBranch, destBranch+':'+destBranch, function(err, pull){
                    console.log('pulling '+remoteBranch+'/'+destBranch);
                    if(err){
                      console.log('error pulling '+remoteBranch+'/'+destBranch);
                      console.log(err);
                      return cb(err);
                    }
                    git(conf.currentPath).branch(['-D', sourceBranch], function(err,res){
                      console.log('deleting local source branch '+sourceBranch);
                      if(err){
                        console.log('error deleting source branch '+sourceBranch);
                        console.log(err);
                        return cb(err);
                      }
                      console.log('deleted source branch '+sourceBranch);
                      if(currentBranch !== sourceBranch){
                        console.log('switching back to original branch before merge process');
                        git(conf.currentPath).checkout(currentBranch, function(err){
                          if(err){
                            return cb(err);
                          }
                          console.log('switched back to branch '+currentBranch);
                          return cb();
                        })
                      } else {
                        return cb();
                      }
                    });
                  });
                });
              } else{
                return  cb();
              }
            });  
          });

        });
      },

      create: function (options, cb) {
        var conf = getConfig();                    
        git(conf.currentPath).status(function (err, info) {
          console.log('running git status for current branch');
          if (err) {
            console.log('error gettting current branch');
            return cb();
          }
          var sourceBranch, destBranch, remoteBranch;
          sourceBranch = options.from || info.current;
          // setting dest branch from config if not provided
          destBranch = options.to || conf.currentConfig.default_dest_branch || conf.default.default_dest_branch || 'master';
          remoteBranch = 'origin'
          var query;
          getPRForCurrentBranch(options, function(err, pullreqs){
            if(err){
              console.log(err);
              return cb(err);
            }
            if(pullreqs && pullreqs[0] && pullreqs[0].id){
              options.pullReqId = pullreqs[0].id;
            }
            //overriding destination branch with the one given in pull request 
            if(pullreqs && pullreqs[0] && pullreqs[0].destination && pullreqs[0].destination.branch && pullreqs[0].destination.branch.name){
              destBranch = pullreqs[0].destination.branch.name;
            }
            git(conf.currentPath).log(['--format=%B', '-n','1'], function(err, res){
              console.log('getting latest commit');
              if(err){              
                console.log('error getting git log');
                return cb();
              }
              var latestCommitMsg =  res.latest.hash;
              git(conf.currentPath).pull(remoteBranch, sourceBranch, function (err, sourcePullRes){
                console.log('pulling source branch '+sourceBranch);
                if(err){
                  if(err.indexOf("Couldn't find remote ref")<0){
                    console.log('error pulling source branch '+sourceBranch);
                    console.log(err);
                    console.log('Creating new pull request'.blue);
                  }else {
                    console.log('remote branch not present');
                    console.log('will create new pull request');
                    options.new=1;  //flag to check if its new pull request
                  }
                }
                //pulling remote destination branch
                git(conf.currentPath).pull(remoteBranch, destBranch, function (err, masterPullRes){
                  console.log(masterPullRes);
                  console.log('pulling '+remoteBranch+'/'+destBranch);
                  if(err){
                    console.log('error pulling '+remoteBranch+'/'+destBranch);
                    return cb();
                  }
                  //merging remote destination branch to local destination branch
                  git(conf.currentPath).mergeFromTo(destBranch, sourceBranch, function (err, mergeRes){
                    console.log('merging '+destBranch+' to '+sourceBranch);
                    if(err){
                      console.log('error merging '+destBranch+' to '+sourceBranch);
                      console.log(err);
                      return cb();
                    }
                    git(conf.currentPath).push(remoteBranch, sourceBranch, function (err, pushRes) {
                      console.log('pushing the branch to origin');
                      if (err) {
                        console.log('error pushing branch to origin');
                        return cb();
                      }
                      if(!options.pullReqId){
                        var question = 'Please Enter Pull request title [default Title is : '+latestCommitMsg+' ] '+ '\nPress ENTER to use this msg or write your own: '.red;
                        question = question.blue;
                        ask(question, function(answer){
                          if(!answer){
                            options.message = latestCommitMsg;
                          } else {
                            options.message = answer;
                          }
                          console.log('Title is going to be '.red+ options.message);
                          createPullReq(options, conf, destBranch, sourceBranch, function(err, res){
                            if(err){
                              console.log(err);
                              return cb();
                            }
                            console.log(res);
                            return cb();
                          });
                        }, null, null, options.message, latestCommitMsg);
                      } else{
                        console.log('updated PR ' + getConfig(null, options.pullReqId).viewUrl);
                        pullrequest.open({open: options.pullReqId},function(){});
                        return cb();
                      }
                    });
                  });
                });               
              });
            });
          });
          //pulling changes from source branch          
        });
      },

        decline: function (options) {
          var conf = getConfig('DECLINE', options.decline);
            console.log("Declining PR " + options.decline);
            request
                .post(conf.finalUrl)
                .set('Authorization', 'Basic ' + conf.finalToken)
                .end(function (res) {
                    if (!res.ok) {
                        return console.log((res.body.errorMessages || [res.error]).join('\n'));
                    }
                    console.log("Declined PR " + options.decline);
                });
        },
                
        approve: function (options) {
          var conf = getConfig('APPROVE', options.approve);
            console.log("Approving PR " + options.approve);
            request
                .post(conf.finalUrl)
                .set('Authorization', 'Basic ' + conf.finalToken)
                .end(function (res) {
                    if (!res.ok) {
                        return console.log((res.body.errorMessages || [res.error]).join('\n'));
                    }
                    console.log("Approved PR " + options.approve);
                });
        },
              
        diff: function (options) {
          var conf = getConfig('DIFF', options.diff);
            console.log(conf.finalUrl);
            console.log("Diffing PR " + options.diff);
            request
                .get(conf.finalUrl)
                .set('Authorization', 'Basic ' + conf.finalToken)
                .end(function (res) {
                    if (!res.ok) {
                        return console.log((res.body.errorMessages || [res.error]).join('\n'));
                    }
                    console.log("Diff PR ", res.text);
                });
        },

      patch: function (options) {
        var conf = getConfig('PATCH', options.patch);
            console.log(conf.finalUrl);
            console.log("Patching PR " + options.patch);
            request
                .get(conf.finalUrl)
                .set('Authorization', 'Basic ' + conf.finalToken)
                .end(function (res) {
                    if (!res.ok) {
                        return console.log((res.body.errorMessages || [res.error]).join('\n'));
                    }
                    console.log("Patch PR " + res.text);
                });
        },

        activity: function (options) {
          var conf = getConfig('ACTIVITY', options.activity);
          var table;
            console.log(conf.finalUrl);
            console.log("Activitying PR " + options.activity);
            request
                .get(conf.finalUrl)
                .set('Authorization', 'Basic ' + conf.finalToken)
                .end(function (res) {
                    if (!res.ok) {
                        return console.log((res.body.errorMessages || [res.error]).join('\n'));
                    }
                    console.log("Activity PR " + options.activity);
              table = new Table({
                        head: ['Content', 'User'],
                        chars: {
                          'top': '═' ,
                          'top-mid': '╤' ,
                          'top-left': '╔' ,
                          'top-right': '╗',
                          'bottom': '═' ,
                          'bottom-mid': '╧' ,
                          'bottom-left': '╚' ,
                          'bottom-right': '╝',
                          'left': '║' ,
                          'left-mid': '╟' ,
                          'mid': '─' ,
                          'mid-mid': '┼',
                          'right': '║' ,
                          'right-mid': '╢' ,
                          'middle': '│'
                        },
                        style: {
                            'padding-left': 1,
                            'padding-right': 1,
                            head: ['cyan'],
                            compact: true
                        }
                    });
                    if (res && res.text) {
                        res.text = JSON.parse(res.text);
                        res.text.values.forEach(function (eachValue,index) {
                          var color = index % 2 ? 'yellow' : 'blue';
                            if (eachValue.comment && eachValue.comment.content && eachValue.comment.content.raw && eachValue.comment.user && eachValue.comment.user.nickname) {
                                table.push([eachValue.comment.content.raw[color], eachValue.comment.user.nickname[color]]);
                            }
                        });
                        console.log(table.toString());
                    }
                });
        },

      open: function (options, cb) {
        if(options.open === true){
          getPRForCurrentBranch(options, function (err, pullReqs){
            if(err){
              console.log(err);
              return cb(err);
            }
            if(!pullReqs || !pullReqs[0]){
              console.log('No pull Req found for current branch');
              return cb(new Error('No pull Req found for current branch'));
            }
            options.open = pullReqs[0].id;
            var conf = getConfig(null, options.open);
            openurl.open(conf.viewUrl);
            return cb();
          });
        } else {
          var conf = getConfig(null, options.open);
          openurl.open(conf.viewUrl);
          return cb();
        }
      },

      checkout: function (options, cb){
        options.__pr_id = options.checkout;
        getPullRequests(options, function(err, pullReqs){
          var conf = getConfig();
          if(err){
            return cb(err);
          }
          if(!pullReqs || !pullReqs[0]){
            console.log('No pull Req found for current branch');
            return cb(new Error('No pull Req found for current branch'));
          }
          console.log(pullReqs[0])
          var destBranch = pullReqs[0].source.branch.name;
          console.log('switching to branch '+destBranch);
          //checking if branch is present or not
          git(conf.currentPath).revparse(['--verify', destBranch],function (err, rev){
            if(err){
              //pulling branch from origin if branch not present locally
              var remoteBranch = 'origin';
              console.log('branch not found, pull from '+remoteBranch);
              git(conf.currentPath).pull(remoteBranch+'/'+destBranch, destBranch, function(err,res){
                if(err){
                  return cb(err);
                }
                //checking out to branch
                git(conf.currentPath).checkout(destBranch, function(err, info){
                  if(err){
                    console.log(err);
                    return cb(err);
                  }
                  console.log('checked out to branch');
                  return cb();
                });
              });
            }
            //checking out to branch
            git(conf.currentPath).checkout(destBranch, function(err, info){
              if(err){
                console.log(err);
                return cb(err);
              }
              console.log('switched to branch '+destBranch);
              cb();
              //switching to branch after checkout is  complete in async fashion
              var remoteBranch = 'origin';
              git(conf.currentPath).pull(remoteBranch+'/'+destBranch, destBranch, function(err,res){
                if(err){
                  console.log(err);
                  return ;
                }
              });
            });
          });
        });
      }
    };
    return pullrequest;

});
