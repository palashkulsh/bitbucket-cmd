# Meld Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Meld is not working"

#### Check 1: Is Meld Installed?
```bash
which meld
# Should output: /opt/homebrew/bin/meld or /usr/local/bin/meld

# If not found, install:
brew install meld
```

#### Check 2: Is Meld Opening (but in Background)?
The tool opens Meld, but it might be hidden behind other windows.

**Solution**: 
- Look for Meld icon in your Dock
- Use Cmd+Tab to switch to Meld
- Check Mission Control (F3) for Meld windows

#### Check 3: Check the Success Message
Look for this in the output:
```
✓ Opened successfully
```

If you see ❌ instead, read the error message for details.

#### Check 4: Manual Test
Try opening Meld manually with the saved files:
```bash
# The command output shows the temp directory, e.g.:
# 📁 Diff files saved to: /var/folders/.../bitbucket-pr-244

# List the files
ls /var/folders/.../bitbucket-pr-244/

# Open manually
meld /var/folders/.../bitbucket-pr-244/before_* /var/folders/.../bitbucket-pr-244/after_*
```

### Issue: "Error opening Meld"

#### Symptom
You see:
```
❌ Error opening Meld for file.js: ...
```

#### Solutions

**1. Meld Path Issues**
```bash
# Find where Meld is installed
which meld

# If it's in /usr/local/bin or /opt/homebrew/bin, that's good
# If not found, reinstall:
brew reinstall meld
```

**2. Python/GTK Issues (macOS)**
Meld requires GTK. If you get Python errors:
```bash
# Reinstall with dependencies
brew reinstall meld
brew reinstall python@3.11
brew reinstall gtk+3
```

**3. Try Alternative: Direct Meld Command**
Instead of using the tool, open files directly:
```bash
# Get the PR diff first
bitbucket pr -u "URL" -d > /tmp/pr.diff

# View in your preferred editor
code /tmp/pr.diff
vim /tmp/pr.diff
```

### Issue: Meld Opens but Shows Empty/Garbled Content

#### Cause
The diff parsing might have issues with certain file types (binary, very large files, special formats).

#### Solution
```bash
# Use traditional diff view instead
bitbucket pr -u "URL" -d

# Or save to file and open in editor
bitbucket pr -u "URL" -d > /tmp/pr-244.diff
code /tmp/pr-244.diff
```

### Issue: Multiple Meld Windows Open

#### This is Expected!
If a PR changes multiple files, each file gets its own Meld window.

Example:
```
Found 5 changed file(s)

1. Opening file1.js in Meld...
2. Opening file2.js in Meld...
3. Opening file3.js in Meld...
...
```

This is by design - you get one comparison per file.

## Platform-Specific Notes

### macOS
- Uses `open -F -a Meld` to launch
- `-F` flag brings Meld to foreground
- If Meld doesn't come forward, check System Preferences > Security & Privacy

### Linux
- Uses `meld` command directly
- Runs in background with `&`
- Check if Meld is in your PATH: `which meld`

## Alternative Diff Tools

If Meld doesn't work for you, here are alternatives:

### 1. Use VS Code
```bash
# Get diff and open in VS Code
bitbucket pr -u "URL" -d > /tmp/pr.diff
code /tmp/pr.diff
```

### 2. Use Terminal Diff Viewer
```bash
# Use delta (better terminal diff)
bitbucket pr -u "URL" -d | delta

# Or use diff-so-fancy
bitbucket pr -u "URL" -d | diff-so-fancy
```

### 3. Use Git's Built-in Difftool
```bash
# Configure your preferred difftool in git
git config --global diff.tool meld
git config --global merge.tool meld
```

### 4. Browser-based (GitHub Desktop style)
Open the PR in your browser - sometimes the web UI is the simplest!

## Verification Steps

### 1. Test Meld Installation
```bash
# Create test files
echo "line 1\nline 2\nline 3" > /tmp/before.txt
echo "line 1\nline 2 modified\nline 3\nline 4" > /tmp/after.txt

# Open in Meld
meld /tmp/before.txt /tmp/after.txt
```

If this works, Meld is fine - the issue is with the integration.

### 2. Test with Small PR
```bash
# Find a PR with only 1 file change
bitbucket pr -u "URL-to-small-PR" -d --meld
```

### 3. Check Temp Files
```bash
# After running --meld, check if files were created
ls -la /tmp/bitbucket-pr-*/

# Try opening manually
cd /tmp/bitbucket-pr-244/
meld before_* after_*
```

## Debug Mode

### Enable Verbose Output
```bash
# Set debug flag (if available)
DEBUG=1 bitbucket pr -u "URL" -d --meld

# Or manually check each step
bitbucket pr -u "URL" -d > /tmp/pr.diff
cat /tmp/pr.diff  # Verify diff was fetched
```

## Getting Help

If still having issues:

1. **Check Output Messages**
   - Look for ✓ (success) or ❌ (error) 
   - Read error messages carefully
   - Note the temp directory path

2. **Provide Details**
   - Your OS and version
   - Meld version: `meld --version`
   - Output of: `which meld`
   - Full error message
   - Whether manual `meld` command works

3. **Try Alternatives**
   - Use regular diff: `bitbucket pr -u "URL" -d`
   - Use diffstat: `bitbucket pr -u "URL" --diffstat`
   - Open PR in browser

## Quick Fixes

```bash
# Fix 1: Reinstall Meld
brew reinstall meld

# Fix 2: Use without --meld flag
bitbucket pr -u "URL" -d > /tmp/pr.diff
code /tmp/pr.diff

# Fix 3: Open in browser
bitbucket pr -o <pr_num>

# Fix 4: Use diffstat instead
bitbucket pr -u "URL" --diffstat
```

## Success Indicators

You'll know it's working when you see:
```
✓ Opened successfully
```

And Meld window appears showing side-by-side comparison with:
- Left side: before_<filename>
- Right side: after_<filename>
- Differences highlighted
- Line numbers shown
