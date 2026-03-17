# Quick Reference Guide

## 🚀 Quick Start

### First Time Setup (One Time Only!)
```bash
# Run from any configured repository
cd /path/to/any/repo
bitbucket config
# Enter your credentials
```

### After Setup - Use From ANYWHERE!
```bash
# Works from /tmp
cd /tmp
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123" --diffstat

# Works from home directory
cd ~
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123" -d

# Works from any random directory
cd /any/directory
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123" --diffstat
```

## 📋 Command Cheat Sheet

### View Diffstat (File Statistics)
```bash
# From configured repo (traditional)
cd your-repo
bitbucket pr --diffstat 244

# From anywhere with URL (new!)
cd /tmp
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/244" --diffstat
```

### View Diff (Actual Changes)
```bash
# From configured repo (traditional)
cd your-repo
bitbucket pr -d 244

# From anywhere with URL (new!)
cd ~
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/244" -d

# Open in Meld for visual comparison (NEW!)
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/244" -d --meld
```

### Copy-Paste Workflow
```bash
# 1. Copy PR URL from Slack/Email/Browser
# 2. Open terminal (any directory)
# 3. Paste and run:
bitbucket pr -u "PASTE_URL_HERE" --diffstat
```

## 🎯 Common Use Cases

### Quick PR Review
```bash
# Someone sends you a PR link in Slack
# Just paste it - no need to navigate or clone!
bitbucket pr -u "https://bitbucket.org/your-workspace/backend-service/pull-requests/156" --diffstat

# Want to see the actual changes? Open in Meld!
bitbucket pr -u "https://bitbucket.org/your-workspace/backend-service/pull-requests/156" -d --meld
```

### Compare Multiple PRs
```bash
# Stay in one directory, check multiple PRs
cd /tmp
bitbucket pr -u "https://bitbucket.org/team/repo1/pull-requests/100" --diffstat
bitbucket pr -u "https://bitbucket.org/team/repo2/pull-requests/200" --diffstat
bitbucket pr -u "https://bitbucket.org/team/repo3/pull-requests/300" --diffstat
```

### Review Non-Cloned Repository
```bash
# Don't have the repo locally? No problem!
cd ~
bitbucket pr -u "https://bitbucket.org/team/unfamiliar-repo/pull-requests/5" --diffstat
# Works even if you've never cloned or configured unfamiliar-repo
```

### Shell Script for Multiple PRs
```bash
#!/bin/bash
# save as check-prs.sh
URLS=(
  "https://bitbucket.org/team/repo1/pull-requests/10"
  "https://bitbucket.org/team/repo2/pull-requests/20"
)

for url in "${URLS[@]}"; do
  echo "=== Checking $url ==="
  bitbucket pr -u "$url" --diffstat
  echo ""
done
```

## 📊 Understanding Output

### Diffstat Output
```
╔═══════════════╤═════════════╤═══════════════╤══════════╗
║ File          ║ Lines Added ║ Lines Removed ║ Status   ║
╟───────────────┼─────────────┼───────────────┼──────────╢
║ api/cancel.js ║ +2          ║ -1            ║ modified ║
║ README.md     ║ +50         ║ -0            ║ added    ║
╚═══════════════╧═════════════╧═══════════════╧══════════╝

Total changes: +52 -1
```

**Status Values**:
- `modified` - File was changed
- `added` - New file
- `removed` - File deleted
- `renamed` - File renamed

**Colors**:
- Green (+) - Lines added
- Red (-) - Lines removed

## ⚙️ How It Works

### Traditional Method
```
Your Location → Must be in configured repo → Command runs
```

### URL Method (New!)
```
ANY Location → Global auth from ~/.bitbucketconfigrc → Command runs
```

### What You Need
- ✅ One-time `bitbucket config` setup (from any repo)
- ✅ PR URL
- ❌ Don't need: Target repo cloned
- ❌ Don't need: Target repo configured
- ❌ Don't need: To be in specific directory

## 🔍 Troubleshooting

### "No bitbucket configuration found"
```bash
# Need to configure once from any repo
cd /path/to/any/configured/repo
bitbucket config
# Then try again from anywhere
```

### "Could not parse URL"
```bash
# Make sure URL is in quotes and is a valid Bitbucket PR URL
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123" --diffstat
#              ^--- quotes important!
```

### Command not found
```bash
# Use full path or set up alias
node /path/to/bitbucket-cmd/bin/bitbucket.js pr -u "..." --diffstat

# Or create alias in ~/.bashrc or ~/.zshrc
alias bitbucket='node /path/to/bitbucket-cmd/bin/bitbucket.js'
```

## 💡 Pro Tips

1. **Always use quotes around URLs**
   ```bash
   bitbucket pr -u "https://..." --diffstat  # Good
   bitbucket pr -u https://... --diffstat    # May fail
   ```

2. **Create shell aliases for convenience**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   alias bb-diff='bitbucket pr -u'
   alias bb-stat='bitbucket pr -u'
   
   # Usage:
   bb-stat "https://..." --diffstat
   ```

3. **Pipe output for processing**
   ```bash
   bitbucket pr -u "https://..." --diffstat | grep "README"
   ```

4. **Use from scripts**
   ```bash
   # check-all-prs.sh
   for url in $(cat pr-urls.txt); do
     bitbucket pr -u "$url" --diffstat
   done
   ```

5. **Combine with other tools**
   ```bash
   # Get PR number from clipboard and fetch stats
   pbpaste | xargs -I {} bitbucket pr -u {} --diffstat
   ```

## 📚 Full Documentation

- [URL_FEATURE.md](./URL_FEATURE.md) - Complete URL feature documentation
- [DIFFSTAT_USAGE.md](./DIFFSTAT_USAGE.md) - Diffstat command details
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical implementation details

## 🎉 Examples That Will Blow Your Mind

### Work from /tmp
```bash
cd /tmp
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/244" --diffstat
# Works! Even though /tmp has nothing to do with the repo!
```

### Review 5 PRs in 30 seconds
```bash
cd ~
bitbucket pr -u "https://bitbucket.org/team/repo1/pull-requests/10" --diffstat
bitbucket pr -u "https://bitbucket.org/team/repo2/pull-requests/20" --diffstat
bitbucket pr -u "https://bitbucket.org/team/repo3/pull-requests/30" --diffstat
bitbucket pr -u "https://bitbucket.org/team/repo4/pull-requests/40" --diffstat
bitbucket pr -u "https://bitbucket.org/team/repo5/pull-requests/50" --diffstat
```

### Morning Standup Script
```bash
#!/bin/bash
# my-prs.sh - Check all my PRs

echo "🔍 Checking my open PRs..."
bitbucket pr -u "https://bitbucket.org/team/project1/pull-requests/100" --diffstat
bitbucket pr -u "https://bitbucket.org/team/project2/pull-requests/200" --diffstat
echo "✅ Done!"
```

## 🆘 Quick Help

```bash
# View all options
bitbucket pr --help

# View diffstat examples
cat DIFFSTAT_USAGE.md

# View URL feature docs
cat URL_FEATURE.md
```
