# Meld Integration - Final Solution

## Issue Fixed
**Problem**: Meld was showing error "cannot open files in the 'octet-stream' format"

**Root Cause**: Using macOS `open -a Meld` command caused the system to misidentify file types

## Solution Implemented

### 1. Direct Meld Command
Changed from:
```bash
open -F -a Meld "before_file" "after_file"  # ❌ Caused octet-stream error
```

To:
```bash
meld --label="Before: filename" --label="After: filename" "before_file" "after_file" &  # ✅ Works correctly
```

### 2. Proper File Labels
Added `--label` flags to show original filenames in Meld's UI instead of temp file names like `before_api_cancel.js`.

### 3. UTF-8 Encoding
Ensured all files are written with explicit UTF-8 encoding for proper syntax highlighting.

## Current Behavior

### Command
```bash
bitbucket pr -u "https://..." -d --meld
```

### Output
```
Preparing diff for Meld...
Found 1 changed file(s)

1. Opening api/cancel.js in Meld...

📁 Diff files saved to: /tmp/bitbucket-pr-244
🔍 Check if Meld window opened (may be in background)
💡 Tip: You can manually open files with: meld <before_file> <after_file>

   ✓ Opened successfully
```

### Meld Window
- **Left pane**: Shows "Before: api/cancel.js" with original code
- **Right pane**: Shows "After: api/cancel.js" with modified code
- **Syntax highlighting**: Works correctly
- **Diff highlighting**: Shows additions/deletions/modifications
- **No errors**: octet-stream error is fixed!

## Usage Tips

### Bringing Meld to Foreground
Since Meld opens in background:
1. **Cmd+Tab** - Switch to Meld
2. Check **Dock** - Look for Meld icon
3. **Mission Control (F3)** - Find Meld window

### Multiple Files
If PR has multiple files, each opens in separate Meld window:
```
1. Opening file1.js in Meld...
   ✓ Opened successfully
2. Opening file2.js in Meld...
   ✓ Opened successfully
```

### Manual Opening
If Meld doesn't appear, use the temp directory path shown:
```bash
cd /tmp/bitbucket-pr-244
ls -la
# Shows: before_api_cancel.js, after_api_cancel.js

meld before_api_cancel.js after_api_cancel.js
```

## Technical Details

### Why Direct `meld` Command Works
- Meld can properly detect file types from extensions
- No macOS Launch Services interference
- Respects .js, .py, .java, etc. for syntax highlighting
- Labels show original paths for context

### File Storage
Files are saved in: `/tmp/bitbucket-pr-{number}/`
- Format: `before_{filename}` and `after_{filename}`
- Preserves original extensions (`.js`, `.py`, etc.)
- UTF-8 encoded for proper display

## Verification

To verify it's working:
1. Run the command
2. Look for "✓ Opened successfully"
3. Check Dock for Meld
4. Use Cmd+Tab to switch to Meld
5. Meld should show proper diff without errors

## If Still Having Issues

### Check Meld Installation
```bash
which meld
meld --version
```

### Test Manually
```bash
# Create test files
echo "old content" > /tmp/before.txt
echo "new content" > /tmp/after.txt

# Test Meld directly
meld /tmp/before.txt /tmp/after.txt
```

If this works, the tool should work too.

### Alternative
If Meld still has issues, use regular diff:
```bash
# Without --meld flag
bitbucket pr -u "https://..." -d

# Or just diffstat
bitbucket pr -u "https://..." --diffstat
```

## Success Indicators

✅ No "octet-stream" error
✅ Syntax highlighting works
✅ File labels show original paths
✅ Diff colors show properly
✅ "✓ Opened successfully" message

The integration is now fully functional!
