[cmd-bitbucket](https://www.npmjs.com/package/cmd-bitbucket)
========

  This is original work of Dan Shumaker and is forked from https://github.com/danshumaker/cmd-bitbucket
  
  Bitbucket command line interface  based on https://github.com/germanrcuriel/jira-cmd

  Currently it is able to do these things from the command line: 
  * Store your encrypted bitbucket credentials
  * pull requests
	* Create pull requets
	* List all pull requests
	* Approve pull request
	* Merge pull request
	* Decline pull request
	* Show all activity in a pull request	

## Motivation

  As a command line junky, I wanted to be able to create pull requests quickly without having to use bitbucket's browser interface.  I also wanted to be able to list out all pull requests so I could be a more expedient merge master.

## Installation

Install [node.js](http://nodejs.org/).

Then, in your shell type:

	$ npm install -g cmd-bitbucket

## Usage
##### Getting the username and password
  * Getting username is easy
	* Click on your photo in the down left corner
	* Click on "integrations"
	* Click on "account settings" under general 
	* here on this page you'll be shown your username under "bitbucket profile settings".
	* note it down. you'll require to use this username while configuring cmd-bitbucket.
First we'll have to take out your username and password from your bitbucket account. Go to your bitbucket account account 
 * Click on your photo in the down left corner
 * Click on the "integrations"
 * Click on the "app passwords"
 * Click on "create app passwords"
 * Give a name like cmdbitbucket
 * Click on all the permission you want to give.
 * I advice to give read/write permissions for projects,repositories,pull requests,issues.
 * Now click on create.
 * Next up you'll be shown a password for that.Note this password down.
 * You'll have to enter this password in next section.
 * 

##### First use

    $ bitbucket
 
It will prompte you for the repositories subdirectory url.  It auto-supplies the proper bitbucket api URL prefix

	Team subdir URL: https://api.bitbucket.org/2.0/repositories/+
  * now enter the teamname for Eg. phase2tech
  * repo name is automatically picked from current working directory

Type in your repo name here (for example `phase2tech/bla_dev_vm`) and then hit return a couple times for the username prompt

    Username: xxxxxx
    Password: xxxxxx

Once you hit enter after the password then you should get this message:

    Information stored!

This saves your credentials in the [home directory](https://github.com/danshumaker/cmd-bitbucket/pull/2) in a config rc `~/.bitbucketconfigrc` file.

### How to get a user's uuid which you should save in ~/.bitbucketconfigrc
 * go to https://bitbucket.org/dashboard/overview
 * Try to find a PR of intended person
 * open the browser inspect element portion
 * hover on his name
 * a request is made like https://bitbucket.org/!api/2.0/users/%7B140cc970-81cc-4rdf-8fff-571ssgas28d2%7D?fields=%2Bdepartment%2C%2Bjob_title%2C%2Blocation%2C%2Borganization%2C%2Bzoneinfo
 * the portion between %7B (denotes "{" ) and %7D (denotes "}") is that person's uuid
 * for eg. in this case uuid id 140cc970-81cc-4rdf-8fff-571ssgas28d2
 * add that in .bitbucketconfigrc as { "uuid" :"{140cc970-81cc-4rdf-8fff-571ssgas28d2}" } in the reviewer's list

### Basic commands

### Creating pull request
You must know following things before creating a pull request.

* For. eg. You are working on a **feature branch F1** and you are making changes to this F1 branch. you know that once your changes are done and reviewed, you will **merge this branch to master branch**.   
  * `Source branch`:  branch on which you would make the changes to. In this case F1 branch . **default is current working branch**
  * `Target branch`: branch to which your changes would be merged to after PR is merged. In this case master branch. **default is master branch**  
	  * so you would issue the command <kbd>bitbucket pr -c -s F1 -t master</kbd> 
	* most of the time we want to make PR from current branch as sourcee branch and would want to merge the PR in master branch. In this case we would issue the command <kbd>bitbucket pr -c</kbd> .

### Listing Pull requests in repository
  * <kbd>bitbucket pr -l</kbd> :  if you are running this for the first time, then it might ask you to use default config, by pressing y and pressing enter, you would get an output of all open PR made by you in that repository.
  * <kbd>bitbucket pr -l `BITBUCKET_USER_NAME`</kbd> :  would list the pull requests created by given username in current repository.

### Listing the Pull requests that you have to review in the current repository
  * <kbd>bitbucket pr -r</kbd> : would list the PR which you have to review in current repository.
  * <kbd>bitbucket pr -r `BITBUCKET_USER_NAME`</kbd> : would list the pull requests that given bitbucket user has to review
  
### Merging a pull request
  * If you want to merge the pull request corresponding to the current active branch of current repository. then you have to issue command <kbd>bitbucket pr -m</kbd> .
  * If you want to merge some other pull request of current branch, then you need to know its pull request number. then you would issue the command <kbd>bitbucket pr -m `PULL_REQUEST_NUMBER`</kbd>
  * There are two types of merge strategy in bitbucket
	* `Squash commit` : for merging a pull request squashing all the commits, you would issue the command <kbd>bitbucket pr -m -S squash</kbd> or <kbd>bitbucket pr -m</kbd> (since squash commit is default merge strategy).
	* `merge commit` : another merge strategy is merge_commit . for merging with `merge_commit` strategy , you need to issue the command <kbd>bitbucket pr -m -S merge_commit</kbd>.
  
### Approving a pull request
  * <kbd>bitbucket pr -A PR_NUMBER</kbd> : would approve the pull request with given PR number

### Diff of Pull request
  * many a times some PR are very small, you can see their diff by issuing the command <kbd>bitbucket pr -d PR_NUMBER</kbd>
  
### Open pull request in browser
  * <kbd>bitbucket pr -o</kbd> would open the pull request corresponding to current branch of current repository in browser.
  * <kbd>bitbucket pr -o PR_NUMBER</kbd>: would open the PR corresponding to given PR number in browser.

#### Reviewers [Change the reviewers in the ~/.bitbucketconfigrc file]

Please note that the "reviewers" section is added to the config file.  I've added check to see if this section is empty and just submit PR's without reviewers if necessary.  However it is sensitive.  Valid default reviewer syntax is as follows:

```
{
"default": {
    "auth": {
      "url": "https://api.bitbucket.org/2.0/repositories/",
      "user": "palash-paytm",
      "token": "palash-paytm:CLIENT_SECRET_KEY_YOU_ENTERED",
      "team": "paytmteam",
      "repo_name": "repo-name"
    },
    "reviewers": [
      		   {
		    "username": "rohit-prajapati-paytm"
		   }
      ]
  },
  "repo_level": {
    "/home/palashkulshreshtha/Documents/programs/mygit/repo-name": {
      "reviewers": [
      		   {
		    "username": "rohit-prajapati-paytm"
		   }
      ],
      "auth": {
        "url": "https://api.bitbucket.org/2.0/repositories/",
        "user": "palash-paytm",
        "token": "palash-paytm:CLIENT_SECRET_KEY_YOU_ENTERED",
        "team": "paytmteam",
        "repo_name": "merchant-payout"
      }
    }
  }
}
```

or an empty options section like this:
```
{
"default": {
    "auth": {
      "url": "https://api.bitbucket.org/2.0/repositories/",
      "user": "palash-paytm",
      "token": "palash-paytm:CLIENT_SECRET_KEY_YOU_ENTERED",
      "team": "paytmteam",
      "repo_name": "repo-name"
    },
    "reviewers": []
  },
  "repo_level": {
    "/home/palashkulshreshtha/Documents/programs/mygit/repo-name": {
      "reviewers": [],
      "auth": {
        "url": "https://api.bitbucket.org/2.0/repositories/",
        "user": "palash-paytm",
        "token": "palash-paytm:CLIENT_SECRET_KEY_YOU_ENTERED",
        "team": "paytmteam",
        "repo_name": "merchant-payout"
      }
    }
  }
}

```
or a list of reviewers like this:
```
{
"default": {
    "auth": {
      "url": "https://api.bitbucket.org/2.0/repositories/",
      "user": "palash-paytm",
      "token": "palash-paytm:CLIENT_SECRET_KEY_YOU_ENTERED",
      "team": "paytmteam",
      "repo_name": "repo-name"
    },
    "reviewers": [
      		   {
		    "username": "rohit-prajapati-paytm"
		   },
		   {
		    "username": "dheerajbatra-paytm"
		   }
      ]
  },
  "repo_level": {
    "/home/palashkulshreshtha/Documents/programs/mygit/repo-name": {
      "reviewers": [
      		   {
		    "username": "rohit-prajapati-paytm"
		   },{
		    "username": "dheerajbatra-paytm"
		   }
      ],
      "auth": {
        "url": "https://api.bitbucket.org/2.0/repositories/",
        "user": "palash-paytm",
        "token": "palash-paytm:CLIENT_SECRET_KEY_YOU_ENTERED",
        "team": "paytmteam",
        "repo_name": "merchant-payout"
      }
    }
  }
}

```

Beware-of-the-json-death-by-brackets-syntax: Nested objects are a bitch - not much I can do about that. 

##### Help

Usage: bitbucket [options] [command]

  Commands:

    pr 

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

Each command have individual usage help (using --help or -h), so `bitbucket pr -h` will give pr specific help. 

For example the pr command has these options

```
  Usage: pr [options]

  Options:

    -h, --help                       output usage information
    -l, --list [username]            List only my Open Pull Requests
    -L, --listall                    List all Open Pull Requests
    -G, --global                     List all my Open Pull Requests across all repo
    -r, --review                     List all Open Pull Requests to be reviewed by me
    -M, --merged                     List Merged Pull Requests
    -m, --merge [pr_num]             Merge Pull Request with pr_num else pull request created from current branch
    -S, --merge_strategy <Strategy>  Merging Strategy for Pull Requests (merge_commit/squash)
    -M, --message <pr_num>           Message for merge/creating PR
    -c, --create                     Create Pull Request or update the pull request
    -C, --current                    List Pull Request for current branch
    -s, --source <branch name>       Source Branch from which pr should be created
    -t, --to <branch name>           Destination Branch to which pr should be merged to
    -d, --diff <pr_num>              Diff Pull Request
    -p, --patch <pr_num>             Patch Pull Request
    -a, --activity <pr_num>          Activity on Pull Request
    -A, --approve <pr_num>           Approve the  Pull Request
    -D, --decline <pr_num>           Decline Pull Request
    -o, --open [pr_num]              Open Pull Request in browser with pr_num else open the pull request with current branch

```
Usage:

bitbucket pr -l

The above command will output something like this:
```
 ID  Author              Source                   Destination  Title                                              State  Reviewers                           Url                                                               

 8   palash-paytm        test_branch              master       MC trimming before checking for approval           OPEN                                       https://bitbucket.org/teamname/repo-name/pull-requests/8 
               
```

Usage:

To create a pull request you could do it like this:

* it will create a push the current branch to origin and create a pull request with current branch as source and master as destination branch  
```
	bitbucket pr -c "test pr" 
```

* to create pull request from source [feature/MTIE-503-Package-Content] and destination brach [master]. run the command
```
bitbucket pr -c "test pr" -s feature/MTIE-503-Package-Content -t master
```

  It will create a pull request and output something like given below. you can click the url to open the pull request in browser.
```
	Created PR @ https://bitbucket.org/teamname/repo-name/pull-requests/8
```

* to approve a pull request with pull request id 8
```
bitbucket pr -A 8
```

* to decline a pull request with pull request id 8
```
bitbucket pr -D 8
```

* to view the diff present in the pull request, all you have to do is given below. And it will print the diff on the screen.
```
bitbucket pr -d 8
```

* to view the comment activity done on the pull request. 
```
bitbucket pr -a 8
	* and it will show the comments made by the users
```

##### Advanced options
Checkout ```~/.bitbucketconfigrc``` for more options.

### TODO
	* showing diff more gracefully
	* allowing to patch the
