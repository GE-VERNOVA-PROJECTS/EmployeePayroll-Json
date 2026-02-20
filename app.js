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
    container.innerHTML += `
      <div class="card">
        <h3>${emp.name}</h3>
        <p>${emp.email}</p>
        <p>${emp.department}</p>
        <p>₹${emp.salary}</p>
        <p>${emp.phone}</p>
        <button onclick="editEmployee(${emp.id})" class="btn-success">Edit</button>
        <button onclick="deleteEmployee(${emp.id})" class="btn-danger">Delete</button>
      </div>
    `;
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
  await fetch(`${API}/${id}`,{method:"DELETE"});
  fetchEmployees();
}

// EDIT
function editEmployee(id) {
  const emp = allEmployees.find(e=>e.id===id);
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

function getFormData(){
  return {
    name:name.value,
    email:email.value,
    phone:phone.value,
    salary:Number(salary.value),
    department:department.value,
    startDate:startDate.value,
    notes:notes.value
  };
}

// MODAL
function openModal(){ formModal.classList.remove("hidden"); }
function closeModal(){ formModal.classList.add("hidden"); employeeForm.reset(); }

addBtn.onclick=openModal;
cancelBtn.onclick=closeModal;