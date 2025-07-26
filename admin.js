// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVpddOtX1yRxslNxh8yz3SJq53eUYhkZ0",
  authDomain: "next-gen-186aa.firebaseapp.com",
  projectId: "next-gen-186aa",
  storageBucket: "next-gen-186aa.firebasestorage.app",
  messagingSenderId: "338569531164",
  appId: "1:338569531164:web:932df077b59a0a371b34d9",
  measurementId: "G-7GCT5KHFQ0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Admin configuration
const ADMIN_CONFIG = {
  SUPER_ADMIN_UID: 'oR3W7e6PDdNeXlFiSrAfOgweO1q2',
  TEAM_MEMBERS: {
    // এখানে টিম মেম্বারদের UID অ্যাড করুন
    // ফরম্যাট: 'UID': {email: 'member@email.com', role: 'admin'}
    /*
    'TEAM_MEMBER_UID_1': {
      email: 'team1@example.com',
      role: 'content-admin'
    },
    'TEAM_MEMBER_UID_2': {
      email: 'team2@example.com',
      role: 'editor'
    }
    */
  }
};

// Current user state
let currentUser = null;

// DOM Elements
const loginForm = document.getElementById('login-form');
const adminDashboard = document.getElementById('admin-dashboard');
const loginError = document.getElementById('login-error');

// Login Functionality
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
    
    // Check if user is authorized admin
    if (await checkAdminAuthorization(currentUser.uid)) {
      showAdminDashboard();
    } else {
      throw new Error('You do not have admin access');
    }
  } catch (error) {
    showLoginError(error.message);
  }
});

// Check if user is authorized admin
async function checkAdminAuthorization(uid) {
  return uid === ADMIN_CONFIG.SUPER_ADMIN_UID || 
         ADMIN_CONFIG.TEAM_MEMBERS[uid] || 
         (await database.ref(`adminUsers/${uid}`).once('value')).exists();
}

// Show admin dashboard
function showAdminDashboard() {
  loginForm.reset();
  document.getElementById('login-screen').classList.add('hidden');
  adminDashboard.classList.remove('hidden');
  
  // Set admin info
  document.getElementById('admin-name').textContent = currentUser.email;
  document.getElementById('admin-role').textContent = 
    currentUser.uid === ADMIN_CONFIG.SUPER_ADMIN_UID ? 'Super Admin' : 
    ADMIN_CONFIG.TEAM_MEMBERS[currentUser.uid]?.role || 'Admin';
  
  // Load data based on role
  loadTools();
  if (currentUser.uid === ADMIN_CONFIG.SUPER_ADMIN_UID) {
    loadTeamMembers();
  }
}

// Load tools
async function loadTools() {
  try {
    const snapshot = await database.ref('tools').once('value');
    const toolsContainer = document.getElementById('tools-container');
    toolsContainer.innerHTML = '';
    
    if (snapshot.exists()) {
      snapshot.forEach(toolSnapshot => {
        const tool = toolSnapshot.val();
        toolsContainer.innerHTML += createToolCard(tool);
      });
    }
    
    // Add event listeners
    addToolEventListeners();
  } catch (error) {
    console.error("Error loading tools:", error);
  }
}

// Create tool card HTML
function createToolCard(tool) {
  return `
    <div class="tool-card bg-white rounded-lg shadow p-4" data-id="${tool.id}">
      <h3 class="font-bold text-lg">${tool.name}</h3>
      <p class="text-gray-600 my-2">${tool.shortDescription}</p>
      <div class="flex justify-between items-center mt-4">
        <a href="${tool.url}" target="_blank" class="text-indigo-600 hover:underline">View Tool</a>
        <div class="space-x-2">
          <button class="edit-tool bg-blue-100 text-blue-600 px-3 py-1 rounded" data-id="${tool.id}">
            Edit
          </button>
          <button class="delete-tool bg-red-100 text-red-600 px-3 py-1 rounded" data-id="${tool.id}">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

// Add tool event listeners
function addToolEventListeners() {
  document.querySelectorAll('.edit-tool').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const toolId = e.target.dataset.id;
      openEditToolModal(toolId);
    });
  });
  
  document.querySelectorAll('.delete-tool').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const toolId = e.target.dataset.id;
      if (confirm(`Delete "${toolId}" permanently?`)) {
        try {
          await database.ref(`tools/${toolId}`).remove();
          loadTools();
        } catch (error) {
          console.error("Error deleting tool:", error);
        }
      }
    });
  });
}

// Team Members Management (Super Admin Only)
async function loadTeamMembers() {
  try {
    const teamContainer = document.getElementById('team-members-container');
    teamContainer.innerHTML = '';
    
    // Load from both config and database
    const allTeamMembers = {
      [ADMIN_CONFIG.SUPER_ADMIN_UID]: {
        email: currentUser.email,
        role: 'Super Admin'
      },
      ...ADMIN_CONFIG.TEAM_MEMBERS
    };
    
    // Add team members from database
    const dbSnapshot = await database.ref('adminUsers').once('value');
    if (dbSnapshot.exists()) {
      dbSnapshot.forEach(childSnapshot => {
        allTeamMembers[childSnapshot.key] = childSnapshot.val();
      });
    }
    
    // Display team members
    for (const [uid, member] of Object.entries(allTeamMembers)) {
      if (uid === currentUser.uid) continue;
      
      teamContainer.innerHTML += `
        <div class="team-member bg-white rounded-lg shadow p-4 mb-3" data-uid="${uid}">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-medium">${member.email}</h4>
              <p class="text-sm text-gray-500">Role: ${member.role}</p>
            </div>
            <button class="remove-member text-red-600 hover:text-red-800" data-uid="${uid}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }
    
    // Add event listeners
    document.querySelectorAll('.remove-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = e.target.closest('button').dataset.uid;
        removeTeamMember(uid);
      });
    });
    
  } catch (error) {
    console.error("Error loading team members:", error);
  }
}

// Add new team member
async function addTeamMember() {
  const email = prompt("Enter team member's email:");
  if (!email) return;
  
  const role = prompt("Enter role (admin/editor):", "editor");
  if (!role) return;
  
  try {
    // Find user by email to get UID
    const users = await auth.fetchSignInMethodsForEmail(email);
    if (users.length === 0) {
      throw new Error("User not found. They must sign up first.");
    }
    
    // In real app, you would get UID properly
    const uid = prompt("Enter user's UID (you can get from Firebase Auth):");
    if (!uid) return;
    
    // Add to both config (for frontend) and database (for security rules)
    ADMIN_CONFIG.TEAM_MEMBERS[uid] = { email, role };
    await database.ref(`adminUsers/${uid}`).set({ email, role });
    
    loadTeamMembers();
    alert(`${email} added as ${role}`);
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Remove team member
async function removeTeamMember(uid) {
  if (!confirm("Remove this team member's admin access?")) return;
  
  try {
    // Remove from both places
    delete ADMIN_CONFIG.TEAM_MEMBERS[uid];
    await database.ref(`adminUsers/${uid}`).remove();
    
    loadTeamMembers();
    alert("Team member removed");
  } catch (error) {
    console.error("Error removing team member:", error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  auth.onAuthStateChanged(async (user) => {
    if (user && await checkAdminAuthorization(user.uid)) {
      currentUser = user;
      showAdminDashboard();
    }
  });
  
  // Event listeners
  document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
    window.location.reload();
  });
  
  document.getElementById('add-team-member-btn').addEventListener('click', addTeamMember);
  document.getElementById('refresh-team-btn').addEventListener('click', loadTeamMembers);
});
