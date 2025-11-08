const API_BASE_URL = 'https://your-backend-service-url/api';

// DOM Elements
const dataForm = document.getElementById('dataForm');
const processForm = document.getElementById('processForm');
const dataList = document.getElementById('dataList');
const refreshBtn = document.getElementById('refreshBtn');
const processResult = document.getElementById('processResult');

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// Handle data form submission
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = document.getElementById('message').value;
    const timestamp = new Date().toLocaleString();

    try {
        const response = await fetch(`${API_BASE_URL}/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                timestamp: timestamp
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Message added successfully!', 'success');
            document.getElementById('message').value = '';
            loadData();
        } else {
            showMessage(result.error || 'Failed to add message', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to backend: ' + error.message, 'error');
        console.error('Error:', error);
    }
});

// Handle text processing form submission
processForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = document.getElementById('textInput').value;

    try {
        const response = await fetch(`${API_BASE_URL}/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text
            })
        });

        const result = await response.json();

        if (result.success) {
            displayProcessResult(result.result);
        } else {
            showMessage(result.error || 'Failed to process text', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to backend: ' + error.message, 'error');
        console.error('Error:', error);
    }
});

// Load data from backend
async function loadData() {
    try {
        const response = await fetch(`${API_BASE_URL}/data`);
        const result = await response.json();

        if (result.success) {
            displayData(result.data);
        } else {
            showMessage('Failed to load data', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to backend: ' + error.message, 'error');
        console.error('Error:', error);
        dataList.innerHTML = '<div class="empty-state">Unable to connect to backend. Make sure Flask server is running.</div>';
    }
}

// Display data in the list
function displayData(data) {
    if (data.length === 0) {
        dataList.innerHTML = '<div class="empty-state">No data yet. Add a message to get started!</div>';
        return;
    }

    dataList.innerHTML = data.map(item => `
        <div class="data-item">
            <div class="data-item-content">
                <strong>${item.message}</strong>
                <span>ID: ${item.id} | ${item.timestamp || 'No timestamp'}</span>
            </div>
            <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
        </div>
    `).join('');
}

// Display processing result
function displayProcessResult(result) {
    processResult.innerHTML = `
        <h3>Processing Results:</h3>
        <p><strong>Original:</strong> ${result.original}</p>
        <p><strong>Word Count:</strong> ${result.word_count}</p>
        <p><strong>Character Count:</strong> ${result.char_count}</p>
        <p><strong>Reversed:</strong> ${result.reversed}</p>
        <p><strong>Uppercase:</strong> ${result.uppercase}</p>
    `;
    processResult.classList.add('show');
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/data/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Item deleted successfully!', 'success');
            loadData();
        } else {
            showMessage(result.error || 'Failed to delete item', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to backend: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Refresh button handler
refreshBtn.addEventListener('click', () => {
    loadData();
    showMessage('Data refreshed!', 'success');
});

// Show message to user
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;

    // Insert message at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
                            }
