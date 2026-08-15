export const getPdfDownloadUrl = (docId, code) => {
	return `http://localhost:8000/api/create-pdf/${docId}?code=${code}`;
};
