const API = "http://localhost:3000/employees";

let allEmployees = [];

const namePattern = /^[A-Za-z ]{3,30}$/;
const phonePattern = /^[+]?[0-9]{10,15}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener("DOMContentLoaded", fetchEmployees);

// FETCH
async function fetchEmployees() {
  const res = await fetch(API);
  allEmployees = await res.json();
  displayEmployees(allEmployees);
  updateStats();
}

// DISPLAY
function displayEmployees(data) {
  const container = document.getElementById("employeeContainer");
  container.innerHTML = "";

  data.forEach(emp => {
    const card = document.createElement("div");
    card.className = "card";

    const name = document.createElement("h3");
    name.textContent = emp.name;

    const email = document.createElement("p");
    email.textContent = emp.email;

    const dept = document.createElement("p");
    dept.textContent = emp.department;

    const salary = document.createElement("p");
    salary.textContent = "₹" + emp.salary;

    const phone = document.createElement("p");
    phone.textContent = emp.phone;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-success";
    editBtn.addEventListener("click", () => editEmployee(emp.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-danger";
    deleteBtn.addEventListener("click", () => deleteEmployee(emp.id));

    card.append(name, email, dept, salary, phone, editBtn, deleteBtn);
    container.appendChild(card);
  });
}

// STATS
function updateStats() {
  document.getElementById("totalEmployees").textContent = allEmployees.length;
  const total = allEmployees.reduce((sum,e)=>sum+Number(e.salary),0);
  document.getElementById("totalPayroll").textContent = "₹"+total;
  document.getElementById("avgSalary").textContent = "₹"+(total/allEmployees.length || 0);
}

// CREATE / UPDATE
document.getElementById("employeeForm").addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("employeeId").value;
  const employee = getFormData();

  if(!await validateForm(employee,id)) return;

  if(id) {
    await fetch(`${API}/${id}`,{
      method:"PUT",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(employee)
    });
  } else {
    await fetch(API,{
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(employee)
    });
  }

  closeModal();
  fetchEmployees();
});

// DELETE
async function deleteEmployee(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  await fetchEmployees();
}

// EDIT
function editEmployee(id) {
  const emp = allEmployees.find(e => e.id === Number(id));
  if (!emp) return;

  document.getElementById("employeeId").value = emp.id;
  document.getElementById("name").value = emp.name;
  document.getElementById("email").value = emp.email;
  document.getElementById("phone").value = emp.phone;
  document.getElementById("salary").value = emp.salary;
  document.getElementById("department").value = emp.department;
  document.getElementById("startDate").value = emp.startDate;
  document.getElementById("notes").value = emp.notes;

  openModal();
}

// SEARCH
document.getElementById("searchInput").addEventListener("input", e=>{
  const q = e.target.value.toLowerCase();
  const filtered = allEmployees.filter(emp =>
    emp.name.toLowerCase().includes(q) ||
    emp.email.toLowerCase().includes(q) ||
    emp.phone.includes(q) ||
    emp.department.toLowerCase().includes(q)
  );
  displayEmployees(filtered);
});

// SORT
document.getElementById("sortSelect").addEventListener("change", e=>{
  let sorted = [...allEmployees];
  switch(e.target.value){
    case "name-asc": sorted.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case "name-desc": sorted.sort((a,b)=>b.name.localeCompare(a.name)); break;
    case "salary-asc": sorted.sort((a,b)=>a.salary-b.salary); break;
    case "salary-desc": sorted.sort((a,b)=>b.salary-a.salary); break;
  }
  displayEmployees(sorted);
});

// VALIDATION
async function validateForm(emp,id){
  if(!namePattern.test(emp.name)) return show("nameError","Invalid name");
  if(!emailPattern.test(emp.email)) return show("emailError","Invalid email");
  if(!phonePattern.test(emp.phone)) return show("phoneError","Invalid phone");
  if(emp.salary < 15000) return show("salaryError","Min salary 15000");

  const duplicateEmail = allEmployees.some(e=>e.email===emp.email && e.id!=id);
  if(duplicateEmail) return show("emailError","Email exists");

  const duplicatePhone = allEmployees.some(e=>e.phone===emp.phone && e.id!=id);
  if(duplicatePhone) return show("phoneError","Phone exists");

  return true;
}

function show(id,msg){
  document.getElementById(id).textContent = msg;
  return false;
}

function getFormData() {
  return {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    salary: Number(document.getElementById("salary").value),
    department: document.getElementById("department").value,
    startDate: document.getElementById("startDate").value,
    notes: document.getElementById("notes").value
  };
}

// MODAL
// MODAL ELEMENTS
const formModal = document.getElementById("formModal");
const employeeForm = document.getElementById("employeeForm");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");

// MODAL FUNCTIONS
function openModal() {
  formModal.classList.remove("hidden");
}

function closeModal() {
  formModal.classList.add("hidden");
  employeeForm.reset();
  document.getElementById("employeeId").value = "";
}

// BUTTON EVENTS
addBtn.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);

// Make functions global for inline onclick
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
