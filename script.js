// Load users from localStorage or start empty
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// ================= AUTH =================
function createAccount() {
  const username = document.getElementById("username").value.trim();
  const pin = document.getElementById("pin").value.trim();

  if (!username || !pin) {
    alert("Enter a username and PIN");
    return;
  }

  if (users.some(u => u.username === username)) {
    alert("Username already exists!");
    return;
  }

  users.push({
    username,
    pin,
    balance: 0,
    transactions: []
  });

  localStorage.setItem("users", JSON.stringify(users));
  alert("✅ Account created! You can now log in.");
}

function login() {
  const username = document.getElementById("username").value.trim();
  const pin = document.getElementById("pin").value.trim();

  const user = users.find(u => u.username === username && u.pin === pin);

  if (!user) {
    alert("❌ Invalid login");
    return;
  }

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Redirect to dashboard
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// ================= DASHBOARD =================
function updateBalance() {
  document.getElementById("balance").innerText = `Balance: $${currentUser.balance}`;
}

function updateHistory() {
  const historyList = document.getElementById("history");
  historyList.innerHTML = "";

  currentUser.transactions.forEach((t, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${t.type} of $${t.amount} on ${t.date}`;

    // Color coding
    if (t.type.includes("Deposit")) li.classList.add("deposit");
    else if (t.type.includes("Withdraw")) li.classList.add("withdraw");
    else if (t.type.includes("Transfer")) li.classList.add("transfer");

    historyList.appendChild(li);
  });
}

function depositMoney() {
  const amount = Number(document.getElementById("amount").value);
  if (amount <= 0) {
    alert("Enter a valid amount");
    return;
  }

  currentUser.balance += amount;
  currentUser.transactions.push({
    type: "Deposit",
    amount,
    date: new Date().toLocaleString()
  });

  saveAndRefresh();
}

function withdrawMoney() {
  const amount = Number(document.getElementById("amount").value);
  if (amount <= 0) {
    alert("Enter a valid amount");
    return;
  }

  if (amount > currentUser.balance) {
    alert("❌ Insufficient funds!");
    return;
  }

  currentUser.balance -= amount;
  currentUser.transactions.push({
    type: "Withdraw",
    amount,
    date: new Date().toLocaleString()
  });

  saveAndRefresh();
}

function transferMoney() {
  const recipientName = document.getElementById("transferUser").value.trim();
  const amount = Number(document.getElementById("transferAmount").value);

  if (!recipientName || amount <= 0) {
    alert("Enter valid recipient and amount");
    return;
  }

  if (amount > currentUser.balance) {
    alert("❌ Insufficient funds!");
    return;
  }

  const recipient = users.find(u => u.username === recipientName);
  if (!recipient) {
    alert("❌ Recipient not found");
    return;
  }

  // Deduct from sender
  currentUser.balance -= amount;
  currentUser.transactions.push({
    type: `Transfer to ${recipientName}`,
    amount,
    date: new Date().toLocaleString()
  });

  // Add to recipient
  recipient.balance += amount;
  recipient.transactions.push({
    type: `Transfer from ${currentUser.username}`,
    amount,
    date: new Date().toLocaleString()
  });

  saveAndRefresh();
  alert(`✅ Transferred $${amount} to ${recipientName}`);
}

// ================= HELPERS =================
function saveAndRefresh() {
  // Update users array with new currentUser data
  const index = users.findIndex(u => u.username === currentUser.username);
  users[index] = currentUser;

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  updateBalance();
  updateHistory();
}

// Auto-load dashboard if logged in
window.onload = function() {
  // Dashboard logic
  if (document.getElementById("balance") && currentUser) {
    document.getElementById("navUser").innerText = `👤 ${currentUser.username}`;
    updateBalance();
    updateHistory();
  }
};