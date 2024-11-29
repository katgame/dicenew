// Import CryptoJS
const CryptoJS = require('crypto-js');

const TOKEN_KEY = 'auth-token'; // global variable for the storage name for our authentication token
const USER_KEY = 'auth-user'; // global variable for the storage name for our authenticated user
const REQUEST_SESSION = 'request-session'; // global variable for the storage name for our session data
const SESSION_DATA = 'session-data'; // global variable for the storage name for our session data

// Replace this with your secure encryption key
const ENCRYPTION_KEY = 'my-secure-key';

class TokenStorageService {
  constructor(router) {
    this.router = router;
    this.isLocalStorageAvailable = typeof sessionStorage !== 'undefined';
  }

  // Encrypt data
  encrypt(data) {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  // Decrypt data
  decrypt(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Logging out the user and clearing the stored session
  logOut() {
    if (this.isBrowserEnvironment()) {
      window.sessionStorage.clear();
      this.router.navigate(['login']);
    }
  }

  // Saving the authentication token in the session storage
  saveToken(token) {
    if (this.isBrowserEnvironment()) {
      const encryptedToken = this.encrypt(token);
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.setItem(TOKEN_KEY, encryptedToken);
    }
  }

  // Getting the stored authentication token from the session storage
  getToken() {
    if (this.isBrowserEnvironment()) {
      const encryptedToken = sessionStorage.getItem(TOKEN_KEY);
      return encryptedToken ? this.decrypt(encryptedToken) : '';
    } else {
      return '';
    }
  }

  // Saving the authenticated user in the session storage
  saveUser(user) {
    if (this.isBrowserEnvironment()) {
      const encryptedUser = this.encrypt(JSON.stringify(user));
      window.sessionStorage.removeItem(USER_KEY);
      window.sessionStorage.setItem(USER_KEY, encryptedUser);
    }
  }

  // Getting the stored authenticated user from the session storage
  getUser() {
    if (this.isBrowserEnvironment()) {
      const encryptedUser = sessionStorage.getItem(USER_KEY);
      return encryptedUser ? JSON.parse(this.decrypt(encryptedUser)) : null;
    }
  }

  // Saving session request information in the session storage
  saveSessionRequestInformation(session) {
    if (this.isBrowserEnvironment()) {
      const encryptedSession = this.encrypt(JSON.stringify(session));
      window.sessionStorage.removeItem(REQUEST_SESSION);
      window.sessionStorage.setItem(REQUEST_SESSION, encryptedSession);
    }
  }

  // Helper method to check if the current environment is a browser
  isBrowserEnvironment() {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }
}

// Example usage with a router object
const router = {
  navigate: (path) => console.log(`Navigating to ${path}`),
};

const tokenService = new TokenStorageService(router);

// Save and retrieve token
tokenService.saveToken('your-auth-token');
console.log('Retrieved Token:', tokenService.getToken());

// Save and retrieve user
tokenService.saveUser({ username: 'testuser', role: 'admin' });
console.log('Retrieved User:', tokenService.getUser());

// Log out
tokenService.logOut();
