import _ from 'lodash';

export default class AuthService {
  constructor({ apiService, authService }) {
    this.apiService = apiService;
    this.authService = authService;
  }

  createDocument({ username, password }) {
    this.authService.setCredentials({ username, password });

    const initialDocument = JSON.stringify({ passwords: [] });
    const encryptedDocument = this.authService.encryptWithToken(initialDocument);

    return this.apiService.post("document", encryptedDocument, this.authService.getHeaders());
  }

  loadDocument() {
    return this.apiService.get("document", {}, this.authService.getHeaders()).then(resp => {
      const encryptedDocument = _.get(resp, "data.document") || '{}';
      const decryptedDocument = this.authService.decryptWithToken(encryptedDocument);
      this.document = JSON.parse(decryptedDocument);
      return this.document;
    });
  }

  updateDocument(document) {
    const unencryptedDocument = JSON.stringify(document);
    const encryptedDocument = this.authService.encryptWithToken(unencryptedDocument);

    return this.apiService.put("document", encryptedDocument, this.authService.getHeaders());
  }

  deleteDocument() {
    return this.apiService.del("document", this.authService.getHeaders());
  }

  updatePassword(password) {
    const token = this.authService.hashPassword(password);
    const hashedToken = this.authService.hashToken(token);

    return this.loadDocument().then(document => {
      const unencryptedDocument = JSON.stringify(document);
      const encryptedDocument = this.authService.encryptWithToken(unencryptedDocument, token);

      return this.apiService.put(
        "document/password",
        { password: hashedToken, document: encryptedDocument },
        this.authService.getHeaders()
      ).then(() => this.authService.setToken(password));
    });
  }
}