import axios from 'axios';

class DiceAPIService {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Account Endpoints
  creditFunds(data) {
    return this.api.post('/api/Account/credit-funds', data);
  }

  debitFunds(data) {
    return this.api.post('/api/Account/debit-funds', data);
  }

  getAccount(userId) {
    return this.api.get(`/api/Account/get-account/${userId}`);
  }

  getAccountBalance(userId) {
    return this.api.get(`/api/Account/get-account-balance/${userId}`);
  }

  getAdminAccountBalance() {
    return this.api.get('/api/Account/get-admin-account-balance');
  }

  getAdminAccountTransactions() {
    return this.api.get('/api/Account/get-admin-account-transactions');
  }

  updateAccount(data) {
    return this.api.post('/api/Account/update-account', data);
  }

  // Authentication Endpoints
  registerUser(data) {
    return this.api.post('/api/Authentication/register-user', data);
  }

  getAllUsers() {
    return this.api.get('/api/Authentication/all-user');
  }

  getUserRoles() {
    return this.api.get('/api/Authentication/get-user-roles');
  }

  enableUser(userId) {
    return this.api.put(`/api/Authentication/enable-user/${userId}`);
  }

  deleteUser(userId) {
    return this.api.delete(`/api/Authentication/delete-user/${userId}`);
  }

  loginUser(data) {
    return this.api.post('/api/Authentication/login-user', data);
  }

  // Dashboard Endpoints
  getDashboard() {
    return this.api.get('/api/Dashboard/get-dashboard');
  }

  updateSchool(data) {
    return this.api.put('/api/Dashboard/update-school', data);
  }

  // Game Endpoints
  requestSession(data) {
    return this.api.post('/api/Game/request-session', data);
  }

  startGameManagement() {
    return this.api.get('/api/Game/start-game-management');
  }

  pingEvent(data) {
    return this.api.post('/api/Game/ping-event', data);
  }

  getSessionInformation() {
    return this.api.get('/api/Game/session-information');
  }

  getSessionInformationById(sessionId) {
    return this.api.get(`/api/Game/session-information-by-id/${sessionId}`);
  }

  // Logs Endpoints
  getAllLogsFromDB() {
    return this.api.get('/api/Logs/get-all-logs-from-db');
  }

  // Profile Endpoints
  createProfile(userId) {
    return this.api.post('/api/Profile/create-profile', null, {
      params: { UserId: userId },
    });
  }

  // Test Endpoints
  getTestData() {
    return this.api.get('/api/Test/get-test-data');
  }
}

export default DiceAPIService;
