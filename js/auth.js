const loginSection = document.getElementById("login");
const createAccountSection = document.getElementById("create-account");
const gameSection = document.getElementById("game");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginMessage = document.getElementById("login-message");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const createAccountBtn = document.getElementById("create-account-btn");
const backToLoginBtn = document.getElementById("back-to-login-btn");
const showCreateBtn = document.getElementById("show-create-btn");
const newUsernameInput = document.getElementById("new-username");
const newPasswordInput = document.getElementById("new-password");
const balanceDisplay = document.getElementById("balance");

let currentUser = null;

const getUsers = () => {
    const data = localStorage.getItem("users");
    return data ? JSON.parse(data) : [];
};

const saveUsers = (users) => {
    localStorage.setItem("users", JSON.stringify(users));
};

const sections = [loginSection, createAccountSection, gameSection];

const showSection = (section) => {
    sections.forEach(s => s.hidden = true);
    section.hidden = false;
};

const login = () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        loginMessage.textContent = "Please fill in both fields.";
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        loginMessage.textContent = "Invalid username or password.";
        return;
    }

    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    loginMessage.textContent = "";
    balanceDisplay.textContent = currentUser.balance;
    showSection(gameSection);
    logoutBtn.hidden = false;
};

const createAccount = () => {
    const username = newUsernameInput.value.trim();
    const password = newPasswordInput.value;

    if (!username || !password) {
        return;
    }

    const users = getUsers();

    if (users.find(u => u.username === username)) {
        return;
    }

    users.push({ username, password, balance: 1000 });
    saveUsers(users);
    loginMessage.textContent = "Account created! Please log in.";
    showSection(loginSection);
};

const logout = () => {
    localStorage.removeItem("currentUser");
    currentUser = null;
    logoutBtn.hidden = true;
    showSection(loginSection);
}

loginBtn.addEventListener("click", login);
showCreateBtn.addEventListener("click", () => showSection(createAccountSection));
createAccountBtn.addEventListener("click", createAccount);
backToLoginBtn.addEventListener("click", () => showSection(loginSection));
logoutBtn.addEventListener("click", logout);

const restoreLoggedInUserOnRefresh = () => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));

    if (savedUser) {
        currentUser = savedUser;
        balanceDisplay.textContent = currentUser.balance;
        showSection(gameSection);
        logoutBtn.hidden = false;
    }
};

restoreLoggedInUserOnRefresh(); 

export { currentUser, getUsers, saveUsers };