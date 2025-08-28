import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    query, 
    where, 
    orderBy,
    Timestamp 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Get Firestore instance from global
const db = window.firebaseDb;

// Current client data for details/edit screens
let currentClient = null;
let allClients = [];

// Load dashboard data
window.loadDashboardData = async function() {
    try {
        showLoading();
        const clients = await getAllClients();
        
        // Update stats
        const totalClients = clients.length;
        const activeClients = clients.filter(client => client.status === 'active').length;
        const inactiveClients = totalClients - activeClients;
        
        document.getElementById('total-clients').textContent = totalClients;
        document.getElementById('active-clients').textContent = activeClients;
        document.getElementById('inactive-clients').textContent = inactiveClients;
        
        // Update dashboard table
        updateDashboardTable(clients);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('dashboard-error', 'Failed to load dashboard data');
    } finally {
        hideLoading();
    }
};

// Get all clients from Firestore
async function getAllClients() {
    try {
        const clientsCollection = collection(db, 'clients');
        const clientsQuery = query(clientsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(clientsQuery);
        
        const clients = [];
        querySnapshot.forEach((doc) => {
            clients.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        allClients = clients;
        return clients;
    } catch (error) {
        console.error('Error getting clients:', error);
        throw error;
    }
}

// Update dashboard table
function updateDashboardTable(clients) {
    const tbody = document.getElementById('dashboard-clients-tbody');
    const noClientsDiv = document.getElementById('dashboard-no-clients');
    const mobileCards = document.getElementById('dashboard-mobile-cards');
    const noClientsMobile = document.getElementById('dashboard-no-clients-mobile');
    
    if (clients.length === 0) {
        tbody.innerHTML = '';
        mobileCards.innerHTML = '';
        noClientsDiv.style.display = 'block';
        noClientsMobile.style.display = 'block';
        return;
    }
    
    noClientsDiv.style.display = 'none';
    noClientsMobile.style.display = 'none';
    
    // Desktop table view
    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>${escapeHtml(client.name)}</td>
            <td>${escapeHtml(client.mobile)}</td>
            <td>${escapeHtml(client.email)}</td>
            <td>
                <span class="status-badge ${client.status}">
                    ${client.status}
                </span>
            </td>
            <td class="actions">
                <button class="btn btn-primary" onclick="viewClient('${client.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-secondary" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn ${client.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleClientStatusFromDashboard('${client.id}')">
                    <i class="fas fa-toggle-${client.status === 'active' ? 'off' : 'on'}"></i>
                    ${client.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-danger" onclick="deleteClientFromDashboard('${client.id}', '${escapeHtml(client.name)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
    
    // Mobile card view
    mobileCards.innerHTML = clients.map(client => `
        <div class="client-card">
            <div class="client-card-header">
                <div>
                    <div class="client-card-title">${escapeHtml(client.name)}</div>
                    <span class="status-badge ${client.status}">${client.status}</span>
                </div>
            </div>
            <div class="client-card-info">
                <div class="client-card-info-item">
                    <i class="fas fa-phone"></i>
                    <span>${escapeHtml(client.mobile)}</span>
                </div>
                <div class="client-card-info-item">
                    <i class="fas fa-envelope"></i>
                    <span>${escapeHtml(client.email)}</span>
                </div>
            </div>
            <div class="client-card-actions">
                <button class="btn btn-primary" onclick="viewClient('${client.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-secondary" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn ${client.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleClientStatusFromDashboard('${client.id}')">
                    <i class="fas fa-toggle-${client.status === 'active' ? 'off' : 'on'}"></i>
                    ${client.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-danger" onclick="deleteClientFromDashboard('${client.id}', '${escapeHtml(client.name)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Search clients
window.searchClients = function(searchTerm) {
    const filteredClients = filterClients(allClients, searchTerm);
    updateDashboardTable(filteredClients);
};

// Filter clients based on search term
function filterClients(clients, searchTerm) {
    if (!searchTerm.trim()) {
        return clients;
    }
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.mobile.toLowerCase().includes(term)
    );
}

// Handle add client form submission
window.handleAddClient = async function(event) {
    event.preventDefault();
    
    const formData = getAddClientFormData();
    const saveBtn = document.getElementById('save-client-btn');
    
    // Clear previous errors
    clearAddClientErrors();
    
    // Validate form data
    if (!validateClientData(formData, 'add')) {
        return;
    }
    
    // Show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        // Check email uniqueness
        if (await isEmailExists(formData.email)) {
            showError('client-email-error', 'A client with this email already exists');
            return;
        }
        
        // Add timestamps and status
        const clientData = {
            ...formData,
            status: 'active',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'clients'), clientData);
        console.log('Client added with ID:', docRef.id);
        
        // Reset form and show success
        document.getElementById('add-client-form').reset();
        alert('Client added successfully!');
        
        // Navigate back to dashboard and refresh data
        showScreen('dashboard');
        loadDashboardData();
        
    } catch (error) {
        console.error('Error adding client:', error);
        alert('Failed to add client. Please try again.');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
    }
};

// Get form data for add client
function getAddClientFormData() {
    return {
        name: document.getElementById('client-name').value.trim(),
        mobile: document.getElementById('client-mobile').value.trim(),
        email: document.getElementById('client-email').value.trim(),
        adminLink: document.getElementById('client-admin-link').value.trim(),
        firebaseEmail: document.getElementById('client-firebase-email').value.trim()
    };
}

// Clear add client form errors
function clearAddClientErrors() {
    const errorIds = [
        'client-name-error',
        'client-mobile-error',
        'client-email-error',
        'client-admin-link-error',
        'client-firebase-email-error'
    ];
    clearErrors(errorIds);
}

// Validate client data
function validateClientData(data, mode = 'add') {
    let isValid = true;
    
    // Required fields validation
    if (!data.name) {
        showError(`${mode === 'add' ? 'client' : 'edit-client'}-name-error`, 'Client name is required');
        isValid = false;
    }
    
    if (!data.mobile) {
        showError(`${mode === 'add' ? 'client' : 'edit-client'}-mobile-error`, 'Client mobile is required');
        isValid = false;
    } else if (!validateMobileE164(data.mobile)) {
        showError(`${mode === 'add' ? 'client' : 'edit-client'}-mobile-error`, 'Mobile must be in E.164 format (+91xxxxxxxxxx)');
        isValid = false;
    }
    
    if (!data.email) {
        showError(`${mode === 'add' ? 'client' : 'edit-client'}-email-error`, 'Client email is required');
        isValid = false;
    } else if (!validateEmail(data.email)) {
        showError(`${mode === 'add' ? 'client' : 'edit-client'}-email-error`, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Optional field validation
    if (data.adminLink && !validateUrl(data.adminLink)) {
        showError(`${mode === 'add' ? 'client' : 'edit-client'}-admin-link-error`, 'Please enter a valid URL');
        isValid = false;
    }
    
    return isValid;
}

// Check if email already exists
async function isEmailExists(email, excludeId = null) {
    try {
        const clientsCollection = collection(db, 'clients');
        const emailQuery = query(clientsCollection, where('email', '==', email));
        const querySnapshot = await getDocs(emailQuery);
        
        if (excludeId) {
            // For edit mode, exclude current client
            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        }
        
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking email existence:', error);
        return false;
    }
}

// Load clients list screen
window.loadClientsList = async function() {
    try {
        showLoading();
        const clients = await getAllClients();
        updateClientsListTable(clients);
    } catch (error) {
        console.error('Error loading clients list:', error);
        alert('Failed to load clients list');
    } finally {
        hideLoading();
    }
};

// Update clients list table
function updateClientsListTable(clients) {
    const tbody = document.getElementById('clients-list-tbody');
    const noDataDiv = document.getElementById('clients-list-no-data');
    const mobileCards = document.getElementById('clients-list-mobile-cards');
    const noDataMobile = document.getElementById('clients-list-no-data-mobile');
    
    if (clients.length === 0) {
        tbody.innerHTML = '';
        mobileCards.innerHTML = '';
        noDataDiv.style.display = 'block';
        noDataMobile.style.display = 'block';
        return;
    }
    
    noDataDiv.style.display = 'none';
    noDataMobile.style.display = 'none';
    
    // Desktop table view
    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>${escapeHtml(client.name)}</td>
            <td>${escapeHtml(client.mobile)}</td>
            <td>${escapeHtml(client.email)}</td>
            <td>${client.adminLink ? `<a href="${escapeHtml(client.adminLink)}" target="_blank" rel="noopener">${escapeHtml(client.adminLink)}</a>` : '-'}</td>
            <td>${escapeHtml(client.firebaseEmail || '-')}</td>
            <td>
                <span class="status-badge ${client.status}">
                    ${client.status}
                </span>
            </td>
            <td class="actions">
                <button class="btn btn-primary" onclick="viewClient('${client.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-secondary" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn ${client.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleClientStatusFromList('${client.id}')">
                    <i class="fas fa-toggle-${client.status === 'active' ? 'off' : 'on'}"></i>
                    ${client.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-danger" onclick="deleteClientFromList('${client.id}', '${escapeHtml(client.name)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
    
    // Mobile card view
    mobileCards.innerHTML = clients.map(client => `
        <div class="client-card">
            <div class="client-card-header">
                <div>
                    <div class="client-card-title">${escapeHtml(client.name)}</div>
                    <span class="status-badge ${client.status}">${client.status}</span>
                </div>
            </div>
            <div class="client-card-info">
                <div class="client-card-info-item">
                    <i class="fas fa-phone"></i>
                    <span>${escapeHtml(client.mobile)}</span>
                </div>
                <div class="client-card-info-item">
                    <i class="fas fa-envelope"></i>
                    <span>${escapeHtml(client.email)}</span>
                </div>
                ${client.adminLink ? `
                    <div class="client-card-info-item">
                        <i class="fas fa-link"></i>
                        <a href="${escapeHtml(client.adminLink)}" target="_blank" rel="noopener">${escapeHtml(client.adminLink.length > 30 ? client.adminLink.substring(0, 30) + '...' : client.adminLink)}</a>
                    </div>
                ` : ''}
                ${client.firebaseEmail ? `
                    <div class="client-card-info-item">
                        <i class="fab fa-firebase"></i>
                        <span>${escapeHtml(client.firebaseEmail)}</span>
                    </div>
                ` : ''}
            </div>
            <div class="client-card-actions">
                <button class="btn btn-primary" onclick="viewClient('${client.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-secondary" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn ${client.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleClientStatusFromList('${client.id}')">
                    <i class="fas fa-toggle-${client.status === 'active' ? 'off' : 'on'}"></i>
                    ${client.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-danger" onclick="deleteClientFromList('${client.id}', '${escapeHtml(client.name)}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Search clients in list
window.searchClientsInList = function(searchTerm) {
    const filteredClients = filterClients(allClients, searchTerm);
    updateClientsListTable(filteredClients);
};

// View client details
window.viewClient = async function(clientId) {
    try {
        showLoading();
        const client = await getClientById(clientId);
        
        if (!client) {
            alert('Client not found');
            return;
        }
        
        currentClient = client;
        populateClientDetails(client);
        showScreen('client-details');
        
    } catch (error) {
        console.error('Error viewing client:', error);
        alert('Failed to load client details');
    } finally {
        hideLoading();
    }
};

// Get client by ID
async function getClientById(clientId) {
    try {
        const docRef = doc(db, 'clients', clientId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting client:', error);
        throw error;
    }
}

// Populate client details
function populateClientDetails(client) {
    document.getElementById('details-client-name').textContent = client.name;
    document.getElementById('details-client-mobile').textContent = client.mobile;
    document.getElementById('details-client-email').textContent = client.email;
    document.getElementById('details-client-admin-link').innerHTML = client.adminLink 
        ? `<a href="${escapeHtml(client.adminLink)}" target="_blank" rel="noopener">${escapeHtml(client.adminLink)}</a>`
        : '-';
    document.getElementById('details-client-firebase-email').textContent = client.firebaseEmail || '-';
    document.getElementById('details-client-created').textContent = formatTimestamp(client.createdAt);
    document.getElementById('details-client-updated').textContent = formatTimestamp(client.updatedAt);
    
    const statusElement = document.getElementById('details-client-status');
    statusElement.textContent = client.status;
    statusElement.className = `status-badge ${client.status}`;
    
    // Update toggle button
    const toggleBtn = document.getElementById('toggle-status-text');
    toggleBtn.textContent = client.status === 'active' ? 'Deactivate' : 'Activate';
}

// Edit current client (from details screen)
window.editCurrentClient = function() {
    if (currentClient) {
        editClient(currentClient.id);
    }
};

// Edit client
window.editClient = async function(clientId) {
    try {
        showLoading();
        const client = await getClientById(clientId);
        
        if (!client) {
            alert('Client not found');
            return;
        }
        
        currentClient = client;
        populateEditForm(client);
        showScreen('edit-client');
        
    } catch (error) {
        console.error('Error loading client for edit:', error);
        alert('Failed to load client data');
    } finally {
        hideLoading();
    }
};

// Populate edit form
function populateEditForm(client) {
    document.getElementById('edit-client-name').value = client.name;
    document.getElementById('edit-client-mobile').value = client.mobile;
    document.getElementById('edit-client-email').value = client.email;
    document.getElementById('edit-client-admin-link').value = client.adminLink || '';
    document.getElementById('edit-client-firebase-email').value = client.firebaseEmail || '';
}

// Handle edit client form submission
window.handleEditClient = async function(event) {
    event.preventDefault();
    
    if (!currentClient) {
        alert('No client selected for editing');
        return;
    }
    
    const formData = getEditClientFormData();
    const updateBtn = document.getElementById('update-client-btn');
    
    // Clear previous errors
    clearEditClientErrors();
    
    // Validate form data
    if (!validateClientData(formData, 'edit')) {
        return;
    }
    
    // Show loading state
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    try {
        // Check email uniqueness (excluding current client)
        if (formData.email !== currentClient.email && await isEmailExists(formData.email, currentClient.id)) {
            showError('edit-client-email-error', 'A client with this email already exists');
            return;
        }
        
        // Update client data
        const updatedData = {
            ...formData,
            updatedAt: Timestamp.now()
        };
        
        const docRef = doc(db, 'clients', currentClient.id);
        await updateDoc(docRef, updatedData);
        
        console.log('Client updated successfully');
        alert('Client updated successfully!');
        
        // Update current client and navigate to details
        currentClient = { ...currentClient, ...updatedData };
        populateClientDetails(currentClient);
        showScreen('client-details');
        
        // Refresh dashboard data if needed
        loadDashboardData();
        
    } catch (error) {
        console.error('Error updating client:', error);
        alert('Failed to update client. Please try again.');
    } finally {
        // Reset button state
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Update';
    }
};

// Get form data for edit client
function getEditClientFormData() {
    return {
        name: document.getElementById('edit-client-name').value.trim(),
        mobile: document.getElementById('edit-client-mobile').value.trim(),
        email: document.getElementById('edit-client-email').value.trim(),
        adminLink: document.getElementById('edit-client-admin-link').value.trim(),
        firebaseEmail: document.getElementById('edit-client-firebase-email').value.trim()
    };
}

// Clear edit client form errors
function clearEditClientErrors() {
    const errorIds = [
        'edit-client-name-error',
        'edit-client-mobile-error',
        'edit-client-email-error',
        'edit-client-admin-link-error',
        'edit-client-firebase-email-error'
    ];
    clearErrors(errorIds);
}

// Toggle client status (from details screen)
window.toggleClientStatus = async function() {
    if (!currentClient) {
        alert('No client selected');
        return;
    }
    
    try {
        showLoading();
        
        const newStatus = currentClient.status === 'active' ? 'inactive' : 'active';
        const docRef = doc(db, 'clients', currentClient.id);
        
        await updateDoc(docRef, {
            status: newStatus,
            updatedAt: Timestamp.now()
        });
        
        console.log('Client status updated');
        
        // Update current client and refresh details
        currentClient.status = newStatus;
        populateClientDetails(currentClient);
        
        // Refresh dashboard data
        loadDashboardData();
        
    } catch (error) {
        console.error('Error updating client status:', error);
        alert('Failed to update client status');
    } finally {
        hideLoading();
    }
};

// Toggle client status from dashboard
window.toggleClientStatusFromDashboard = async function(clientId) {
    try {
        showLoading();
        
        const client = await getClientById(clientId);
        if (!client) {
            alert('Client not found');
            return;
        }
        
        const newStatus = client.status === 'active' ? 'inactive' : 'active';
        const docRef = doc(db, 'clients', clientId);
        
        await updateDoc(docRef, {
            status: newStatus,
            updatedAt: Timestamp.now()
        });
        
        console.log('Client status updated from dashboard');
        
        // Refresh dashboard data
        loadDashboardData();
        
    } catch (error) {
        console.error('Error updating client status from dashboard:', error);
        alert('Failed to update client status');
    } finally {
        hideLoading();
    }
};

// Toggle client status from list
window.toggleClientStatusFromList = async function(clientId) {
    try {
        showLoading();
        
        const client = await getClientById(clientId);
        if (!client) {
            alert('Client not found');
            return;
        }
        
        const newStatus = client.status === 'active' ? 'inactive' : 'active';
        const docRef = doc(db, 'clients', clientId);
        
        await updateDoc(docRef, {
            status: newStatus,
            updatedAt: Timestamp.now()
        });
        
        console.log('Client status updated from list');
        
        // Refresh clients list and dashboard data
        loadClientsList();
        loadDashboardData();
        
    } catch (error) {
        console.error('Error updating client status from list:', error);
        alert('Failed to update client status');
    } finally {
        hideLoading();
    }
};

// Format timestamp for display
function formatTimestamp(timestamp) {
    if (!timestamp) return '-';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '-';
    }
}

// Delete client function
async function deleteClient(clientId) {
    try {
        showLoading();
        
        const docRef = doc(db, 'clients', clientId);
        await deleteDoc(docRef);
        
        console.log('Client deleted successfully');
        return true;
        
    } catch (error) {
        console.error('Error deleting client:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

// Delete client from dashboard
window.deleteClientFromDashboard = async function(clientId, clientName) {
    const confirmed = confirm(`Are you sure you want to permanently delete "${clientName}"?\n\nThis action cannot be undone.`);
    
    if (!confirmed) {
        return;
    }
    
    try {
        await deleteClient(clientId);
        alert('Client deleted successfully!');
        
        // Refresh dashboard data
        loadDashboardData();
        
    } catch (error) {
        console.error('Error deleting client from dashboard:', error);
        alert('Failed to delete client. Please try again.');
    }
};

// Delete client from list
window.deleteClientFromList = async function(clientId, clientName) {
    const confirmed = confirm(`Are you sure you want to permanently delete "${clientName}"?\n\nThis action cannot be undone.`);
    
    if (!confirmed) {
        return;
    }
    
    try {
        await deleteClient(clientId);
        alert('Client deleted successfully!');
        
        // Refresh clients list and dashboard data
        loadClientsList();
        loadDashboardData();
        
    } catch (error) {
        console.error('Error deleting client from list:', error);
        alert('Failed to delete client. Please try again.');
    }
};

// Delete current client (from details screen)
window.deleteCurrentClient = async function() {
    if (!currentClient) {
        alert('No client selected');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to permanently delete "${currentClient.name}"?\n\nThis action cannot be undone.`);
    
    if (!confirmed) {
        return;
    }
    
    try {
        await deleteClient(currentClient.id);
        alert('Client deleted successfully!');
        
        // Navigate back to clients list and refresh data
        showScreen('clients-list');
        loadClientsList();
        loadDashboardData();
        
        // Clear current client
        currentClient = null;
        
    } catch (error) {
        console.error('Error deleting current client:', error);
        alert('Failed to delete client. Please try again.');
    }
};
