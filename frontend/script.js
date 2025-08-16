// ====== GLOBAL STATE ======
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ====== TAB SWITCHER ======
function showTab(tabId) {
  document.querySelectorAll(".tabContent").forEach(t => t.style.display = "none");
  document.getElementById(tabId).style.display = "block";
}

// ====== AUTH ======
function showRegister() {
  document.getElementById("loginDiv").style.display = "none";
  document.getElementById("registerDiv").style.display = "block";
}

function showLogin() {
  document.getElementById("loginDiv").style.display = "block";
  document.getElementById("registerDiv").style.display = "none";
}

function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!name || !email || !password) return alert("Please fill all fields");
  if (users.some(u => u.email === email)) return alert("Email already registered");

  const newUser = { name, email, password, avatar: "", preferences: {} };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registered successfully! Please login.");
  showLogin();
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return alert("Invalid credentials");

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  document.getElementById("userName").textContent = user.name;
  document.getElementById("userAvatarHeader").src = user.avatar || "https://via.placeholder.com/40";
  showTab("dashboardTab");
  loadDashboard();
  loadExpenses();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showTab("authTab");
}

// ====== EXPENSES ======
function addExpense() {
  const amount = +document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const description = document.getElementById("description").value;

  if (!amount || !date || !description) return alert("Fill all fields");

  const expense = { id: Date.now(), user: currentUser.email, amount, category, date, description };
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  document.getElementById("amount").value = "";
  document.getElementById("description").value = "";
  loadExpenses();
  loadDashboard();
}

function loadExpenses() {
  const listDiv = document.getElementById("expenseList");
  const filterCategory = document.getElementById("filterCategory").value;
  const filterMonth = document.getElementById("filterMonth").value;
  const search = document.getElementById("searchDesc").value.toLowerCase();

  const userExpenses = expenses.filter(e => e.user === currentUser.email);

  const filtered = userExpenses.filter(e => {
    return (!filterCategory || e.category === filterCategory) &&
           (!filterMonth || e.date.startsWith(filterMonth)) &&
           (!search || e.description.toLowerCase().includes(search));
  });

  listDiv.innerHTML = filtered.map(e => `
    <div class="expenseItem">
      <span>₹${e.amount} - ${e.category} - ${e.date}</span>
      <span>${e.description}</span>
      <button onclick="editExpense(${e.id})">Edit</button>
      <button onclick="deleteExpense(${e.id})">Delete</button>
    </div>
  `).join("");
}

function editExpense(id) {
  const exp = expenses.find(e => e.id === id);
  if (!exp) return;

  document.getElementById("editAmount").value = exp.amount;
  document.getElementById("editCategory").value = exp.category;
  document.getElementById("editDate").value = exp.date;
  document.getElementById("editDescription").value = exp.description;

  document.getElementById("editModal").style.display = "block";
  document.getElementById("editModal").dataset.id = id;
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

function updateExpense() {
  const id = +document.getElementById("editModal").dataset.id;
  const exp = expenses.find(e => e.id === id);

  exp.amount = +document.getElementById("editAmount").value;
  exp.category = document.getElementById("editCategory").value;
  exp.date = document.getElementById("editDate").value;
  exp.description = document.getElementById("editDescription").value;

  localStorage.setItem("expenses", JSON.stringify(expenses));
  closeEditModal();
  loadExpenses();
  loadDashboard();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  loadExpenses();
  loadDashboard();
}

// ====== DASHBOARD ======
function loadDashboard() {
  const userExpenses = expenses.filter(e => e.user === currentUser.email);
  const total = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("totalExpense").textContent = "₹" + total;

  let categoryTotals = {};
  userExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("topCategory").textContent = topCategory ? topCategory[0] : "-";

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthly = userExpenses.filter(e => e.date.startsWith(thisMonth))
                               .reduce((s, e) => s + e.amount, 0);
  document.getElementById("monthlyExpense").textContent = "₹" + monthly;

  const ctx = document.getElementById("expenseChart");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{ data: Object.values(categoryTotals) }]
    }
  });
}

// ====== SETTINGS ======
function saveProfile() {
  currentUser.name = document.getElementById("setName").value;
  currentUser.email = document.getElementById("setEmail").value;
  currentUser.avatar = document.getElementById("setAvatar").value;

  users = users.map(u => u.email === currentUser.email ? currentUser : u);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  document.getElementById("userName").textContent = currentUser.name;
  document.getElementById("userAvatarHeader").src = currentUser.avatar || "https://via.placeholder.com/40";
  alert("Profile updated");
}

function savePassword() {
  const curr = document.getElementById("currPwd").value;
  const newPwd = document.getElementById("newPwd").value;

  if (curr !== currentUser.password) return alert("Wrong current password");
  currentUser.password = newPwd;
  users = users.map(u => u.email === currentUser.email ? currentUser : u);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  alert("Password updated");
}

function savePreferences() {
  currentUser.preferences = {
    dark: document.getElementById("prefDark").checked,
    notif: document.getElementById("prefNotif").checked,
    budget: document.getElementById("prefBudget").value
  };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  alert("Preferences saved");
  applyDarkModeToggle();
}

function applyDarkModeToggle() {
  const dark = document.getElementById("prefDark").checked;
  document.body.className = dark ? "dark" : "light";
}

// ====== EXPORT ======
function exportCSV() {
  const userExpenses = expenses.filter(e => e.user === currentUser.email);
  let csv = "Amount,Category,Date,Description\n";
  userExpenses.forEach(e => {
    csv += `${e.amount},${e.category},${e.date},${e.description}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
}

// ====== INIT ======
window.onload = () => {
  if (currentUser) {
    showTab("dashboardTab");
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("userAvatarHeader").src = currentUser.avatar || "https://via.placeholder.com/40";
    loadDashboard();
    loadExpenses();
  } else {
    showTab("authTab");
  }
};
