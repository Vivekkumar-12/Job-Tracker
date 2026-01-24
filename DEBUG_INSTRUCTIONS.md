# PDF-Parse Debug Instructions

## Step 1: Start Backend with Debug Logging
Run the backend:
```bash
cd backend
npm start
```

Watch for logs starting with `[ATS]` and `[DEBUG]`

## Step 2: Test pdf-parse Loading
In another terminal, call the debug endpoint:
```bash
curl http://localhost:5000/api/debug/pdf-parse
```

Check the backend console for output like:
```
[DEBUG] ========== PDF-PARSE DIAGNOSTIC ==========
[DEBUG] ESM import successful
[DEBUG] Module type: [what type it is]
[DEBUG] Module keys: [what keys it has]
[DEBUG] Resolved pdfParse type: [function or object?]
```

## Step 3: Trigger ATS Scoring
In the frontend, upload a resume and click "Calculate ATS". Watch backend logs for:
```
[ATS] Read PDF file, buffer size: [number]
[ATS] Calling pdfParse with buffer...
[ATS] ✓ Successfully extracted PDF text, length: [number]
```

OR if it fails:
```
[ATS] ✓ Successfully extracted PDF text, length: 0
[ATS] pdfParse call failed: [error message]
```

## Key Things to Share:
1. Full output from `/api/debug/pdf-parse` endpoint (copy from server console)
2. ATS calculation logs when you click Calculate ATS button
3. Any error messages about pdf-parse

## Expected Behavior:
- If pdf-parse works: You'll see actual PDF text extracted
- If pdf-parse fails: It will fall back to `calculateAtsFromResume()` which uses baseline 75% + bonuses
