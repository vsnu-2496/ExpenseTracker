let currentUserId = null;
let editExpenseId = null;
let chartInstance = null;

function showLogin() {
  document.getElementById('registerDiv').style.display = 'none';
  document.getElementById('loginDiv').style.display = 'block';
}

function showRegister() {
  document.getElementById('loginDiv').style.display = 'none';
  document.getElementById('registerDiv').style.display = 'block';
}

// Register
async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch('http://localhost:5000/api/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  alert(data.message);
}

// Login
async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('http://localhost:5000/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    currentUserId = data.user._id;
    document.getElementById('loginDiv').style.display = 'none';
    document.getElementById('dashboardDiv').style.display = 'block';
    loadExpenses();
  }
}

// Add Expense
async function addExpense() {
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;

  const res = await fetch('http://localhost:5000/api/expense/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUserId, amount, category, description })
  });

  const data = await res.json();
  alert(data.message);
  loadExpenses();
}

// Load Expenses + update chart
async function loadExpenses() {
  const res = await fetch(`http://localhost:5000/api/expense/${currentUserId}`);
  const expenses = await res.json();

  const list = document.getElementById('expenseList');
  list.innerHTML = '';

  let total = 0;
  const categoryTotals = {};

  expenses.forEach(exp => {
    total += Number(exp.amount);
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);

    const div = document.createElement('div');
    div.className = 'expense-item';
    div.innerHTML = `
      ${exp.category}: ₹${exp.amount} - ${exp.description}
      <div>
        <button onclick="showEditModal('${exp._id}', ${exp.amount}, '${exp.category}', '${exp.description}')">Edit</button>
        <button onclick="deleteExpense('${exp._id}')">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('totalExpense').innerText = total;

  // Pie chart
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
      }]
    }
  });
}

// Delete Expense
async function deleteExpense(id) {
  const res = await fetch(`http://localhost:5000/api/expense/${id}`, { method: 'DELETE' });
  const data = await res.json();
  alert(data.message);
  loadExpenses();
}

// Edit Expense
function showEditModal(id, amount, category, description) {
  editExpenseId = id;
  document.getElementById('editAmount').value = amount;
  document.getElementById('editCategory').value = category;
  document.getElementById('editDescription').value = description;
  document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// Update Expense
async function updateExpense() {
  const amount = document.getElementById('editAmount').value;
  const category = document.getElementById('editCategory').value;
  const description = document.getElementById('editDescription').value;

  const res = await fetch(`http://localhost:5000/api/expense/${editExpenseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, category, description })
  });

  const data = await res.json();
  alert(data.message);
  closeEditModal();
  loadExpenses();
}
