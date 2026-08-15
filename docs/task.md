# Task: Implement PDF Download via API URL

Implement functional PDF download buttons in `HollandResult.vue` and `LikertResult.vue` that use the backend API endpoint.

## API Endpoint

`http://localhost:8000/api/create-pdf/{testId}?code={code}`

- `testId`: The `documentId` of the current test (Holland or Likert).
- `code`: The submission code.

## Implementation Plan

### 1. Holland Result (`src/pages/holland/HollandResult.vue`)

- [x] Update `handleExportPDF` function.
- [x] Construct the API URL using `hollandId` (testId) and `result.value.code`.
- [x] Open the URL in a new tab or trigger a direct download.
- [x] Remove existing `window.print()` logic if no longer needed for the "Unduh PDF" button (keep it for browser's Print feature if necessary, but the task specifically asks for the URL).

### 2. Likert Result (`src/pages/likert/LikertResult.vue`)

- [x] Update `handleExportPDF` function.
- [x] Construct the API URL using `likertId` (testId) and `result.value.code`.
- [x] Open the URL in a new tab or trigger a direct download.
- [x] Remove existing `window.print()` logic in favor of the API call.

### 3. Admin Holland Submission Detail (`src/pages/admin/holland/AdminHollandSubmissionDetail.vue`)

- [ ] Update `handlePrint` function (or rename to `handleExportPDF`).
- [ ] Use `hollandId.value` and `submission.value.code` for the API URL.
- [ ] Implement the same redirection logic.

### 4. Admin Likert Submission Detail (`src/pages/admin/likert/AdminLikertSubmissionDetail.vue`)

- [ ] Update `handlePrint` function (or rename to `handleExportPDF`).
- [ ] Use `likertId.value` and `submission.value.code` for the API URL.
- [ ] Implement the same redirection logic.

## Technical Considerations

- Ensure `testId` and `code` are available before triggering the download.
- Use `window.open(url, '_blank')` for the simplest implementation.
- Handle potential missing data to avoid broken URLs.

## Success Criteria

- Clicking "Ya, unduh" in HollandResult triggers a request to `http://localhost:8000/api/create-pdf/{hollandId}?code={code}`.
- Clicking "Ya, unduh" in LikertResult triggers a request to `http://localhost:8000/api/create-pdf/{likertId}?code={code}`.
