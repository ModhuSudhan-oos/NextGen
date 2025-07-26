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

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const adminEmail = document.getElementById('admin-email');

// Login Functionality
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Check if user is admin
            return database.ref(`adminUsers/${userCredential.user.uid}`).once('value');
        })
        .then((snapshot) => {
            if (snapshot.exists()) {
                // User is admin, show dashboard
                loginScreen.classList.add('hidden');
                adminDashboard.classList.remove('hidden');
                adminEmail.textContent = auth.currentUser.email;
                loadDashboardData();
            } else {
                // User is not admin
                throw new Error('You do not have admin access');
            }
        })
        .catch((error) => {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
            setTimeout(() => {
                loginError.classList.add('hidden');
            }, 5000);
        });
});

// Logout Functionality
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        adminDashboard.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        document.getElementById('login-form').reset();
    });
});

// Check auth state on load
auth.onAuthStateChanged((user) => {
    if (user) {
        // Check if user is admin
        database.ref(`adminUsers/${user.uid}`).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    loginScreen.classList.add('hidden');
                    adminDashboard.classList.remove('hidden');
                    adminEmail.textContent = user.email;
                    loadDashboardData();
                } else {
                    auth.signOut();
                }
            });
    }
});

// Dashboard Functions
function loadDashboardData() {
    // Load tools count
    database.ref('tools').once('value')
        .then((snapshot) => {
            document.getElementById('tools-count').textContent = snapshot.numChildren();
        });
    
    // Load subscribers count
    database.ref('newsletterSubscribers').once('value')
        .then((snapshot) => {
            document.getElementById('subscribers-count').textContent = snapshot.numChildren();
        });
    
    // Load messages count
    database.ref('contactSubmissions').once('value')
        .then((snapshot) => {
            document.getElementById('messages-count').textContent = snapshot.numChildren();
        });
    
    // Load recent activity
    database.ref('activityLog').limitToLast(5).once('value')
        .then((snapshot) => {
            const activityContainer = document.getElementById('recent-activity');
            activityContainer.innerHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const activity = childSnapshot.val();
                activityContainer.innerHTML += `
                    <div class="flex items-start">
                        <div class="bg-indigo-100 p-2 rounded-full mr-3 mt-1">
                            <i class="fas fa-${activity.icon || 'bell'} text-indigo-600"></i>
                        </div>
                        <div>
                            <p class="text-gray-800">${activity.message}</p>
                            <p class="text-sm text-gray-500">${new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                `;
            });
        });
}

// Tools Management
const toolsSection = document.getElementById('tools-section');
const addToolBtn = document.getElementById('add-tool-btn');
const toolModal = document.getElementById('tool-modal');
const closeModal = document.getElementById('close-modal');
const cancelTool = document.getElementById('cancel-tool');
const toolForm = document.getElementById('tool-form');
const toolsList = document.getElementById('tools-list');
const toolFeaturesContainer = document.getElementById('tool-features-container');
const addFeatureBtn = document.getElementById('add-feature-btn');

// Navigation between sections
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.add('hidden');
        });
        
        // Show selected section
        document.getElementById(`${section}-section`).classList.remove('hidden');
        
        // Update active link
        document.querySelectorAll('.sidebar-link').forEach(l => {
            l.classList.remove('active');
        });
        link.classList.add('active');
        
        // Load section data
        if (section === 'tools') {
            loadToolsList();
        }
    });
});

// Load tools list
function loadToolsList() {
    database.ref('tools').once('value')
        .then((snapshot) => {
            toolsList.innerHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const tool = childSnapshot.val();
                toolsList.innerHTML += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <img src="${tool.icon}" alt="${tool.name}" class="h-10 w-10 rounded-full mr-3">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${tool.name}</div>
                                    <div class="text-sm text-gray-500">${tool.shortDescription.substring(0, 50)}...</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-wrap gap-1">
                                ${tool.categories.map(cat => `
                                    <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">${cat}</span>
                                `).join('')}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            ${tool.featured ? 
                                '<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Featured</span>' : 
                                '<span class="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Regular</span>'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="edit-tool text-indigo-600 hover:text-indigo-900 mr-3" data-id="${tool.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-tool text-red-600 hover:text-red-900" data-id="${tool.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            // Add event listeners to edit/delete buttons
            document.querySelectorAll('.edit-tool').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const toolId = e.currentTarget.dataset.id;
                    editTool(toolId);
                });
            });
            
            document.querySelectorAll('.delete-tool').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const toolId = e.currentTarget.dataset.id;
                    if (confirm(`Are you sure you want to delete "${toolId}"?`)) {
                        deleteTool(toolId);
                    }
                });
            });
        });
}

// Add new tool
addToolBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Add New Tool';
    document.getElementById('tool-id').value = '';
    toolForm.reset();
    toolFeaturesContainer.innerHTML = '';
    toolModal.classList.remove('hidden');
});

// Edit tool
function editTool(toolId) {
    database.ref(`tools/${toolId}`).once('value')
        .then((snapshot) => {
            const tool = snapshot.val();
            
            document.getElementById('modal-title').textContent = `Edit ${tool.name}`;
            document.getElementById('tool-id').value = toolId;
            document.getElementById('tool-name').value = tool.name;
            document.getElementById('tool-categories').value = tool.categories.join(', ');
            document.getElementById('tool-short-desc').value = tool.shortDescription;
            document.getElementById('tool-desc').value = tool.description;
            document.getElementById('tool-icon').value = tool.icon;
            document.getElementById('tool-preview').value = tool.previewImage;
            document.getElementById('tool-url').value = tool.url;
            document.getElementById('tool-embed').value = tool.embedUrl || '';
            document.getElementById('tool-usage').value = tool.usage;
            document.getElementById('tool-featured').checked = tool.featured || false;
            
            // Load features
            toolFeaturesContainer.innerHTML = '';
            if (tool.features && tool.features.length > 0) {
                tool.features.forEach((feature, index) => {
                    addFeatureField(feature.title, feature.description, index);
                });
            } else {
                addFeatureField('', '', 0);
            }
            
            toolModal.classList.remove('hidden');
        });
}

// Delete tool
function deleteTool(toolId) {
    database.ref(`tools/${toolId}`).remove()
        .then(() => {
            // Log activity
            database.ref('activityLog').push({
                message: `Deleted tool: ${toolId}`,
                timestamp: new Date().toISOString(),
                admin: auth.currentUser.email,
                icon: 'trash'
            });
            
            loadToolsList();
        });
}

// Add feature field
function addFeatureField(title = '', description = '', index = 0) {
    const featureDiv = document.createElement('div');
    featureDiv.className = 'feature-field border border-gray-200 p-3 rounded-lg';
    featureDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
            <div>
                <label class="block text-sm text-gray-700 mb-1">Feature Title</label>
                <input type="text" class="feature-title w-full px-3 py-1 border border-gray-300 rounded" 
                       value="${title}" placeholder="Feature title">
            </div>
            <div class="text-right">
                <button type="button" class="remove-feature text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        </div>
        <div>
            <label class="block text-sm text-gray-700 mb-1">Description</label>
            <textarea class="feature-desc w-full px-3 py-1 border border-gray-300 rounded" rows="2"
                      placeholder="Feature description">${description}</textarea>
        </div>
    `;
    
    toolFeaturesContainer.appendChild(featureDiv);
    
    // Add event listener to remove button
    featureDiv.querySelector('.remove-feature').addEventListener('click', () => {
        if (toolFeaturesContainer.children.length > 1) {
            featureDiv.remove();
        }
    });
}

addFeatureBtn.addEventListener('click', () => {
    addFeatureField();
});

// Save tool
toolForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const toolId = document.getElementById('tool-id').value || generateId();
    const toolData = {
        id: toolId,
        name: document.getElementById('tool-name').value,
        shortDescription: document.getElementById('tool-short-desc').value,
        description: document.getElementById('tool-desc').value,
        icon: document.getElementById('tool-icon').value,
        previewImage: document.getElementById('tool-preview').value,
        url: document.getElementById('tool-url').value,
        embedUrl: document.getElementById('tool-embed').value || null,
        usage: document.getElementById('tool-usage').value,
        featured: document.getElementById('tool-featured').checked,
        categories: document.getElementById('tool-categories').value.split(',').map(c => c.trim()),
        updatedAt: new Date().toISOString()
    };
    
    // Get features
    toolData.features = [];
    document.querySelectorAll('.feature-field').forEach((field, index) => {
        const title = field.querySelector('.feature-title').value;
        const desc = field.querySelector('.feature-desc').value;
        
        if (title && desc) {
            toolData.features.push({
                title,
                description: desc
            });
        }
    });
    
    // Save to Firebase
    database.ref(`tools/${toolId}`).set(toolData)
        .then(() => {
            // Log activity
            database.ref('activityLog').push({
                message: `${toolId ? 'Updated' : 'Added'} tool: ${toolData.name}`,
                timestamp: new Date().toISOString(),
                admin: auth.currentUser.email,
                icon: 'tools'
            });
            
            toolModal.classList.add('hidden');
            loadToolsList();
        });
});

// Close modal
closeModal.addEventListener('click', () => {
    toolModal.classList.add('hidden');
});

cancelTool.addEventListener('click', () => {
    toolModal.classList.add('hidden');
});

// Helper function to generate ID
function generateId() {
    return 'tool' + Math.random().toString(36).substr(2, 9);
}

// Initialize the tools section if it's the default view
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#tools') {
        document.querySelector('.sidebar-link[data-section="tools"]').click();
    }
});
