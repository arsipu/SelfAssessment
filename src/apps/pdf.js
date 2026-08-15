export const getPdfDownloadUrl = (docId, code) => {
	return `https://pdf-persiapankarir.ogestudio.com/api/create-pdf/${docId}?code=${code}`;
};
