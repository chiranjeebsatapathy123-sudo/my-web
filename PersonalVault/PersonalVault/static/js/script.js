// Client-side interactions for PersonalVault

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle ? themeToggle.querySelector('i') : null;

// Check for saved theme preference or system preference
let currentTheme = localStorage.getItem('theme');
if (!currentTheme) {
    currentTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const applyTheme = (theme) => {
    if (theme === 'light') {
        body.classList.add('light-theme');
        if (icon) {
            icon.classList.remove('bi-moon-stars-fill');
            icon.classList.add('bi-sun-fill');
        }
    } else {
        body.classList.remove('light-theme');
        if (icon) {
            icon.classList.remove('bi-sun-fill');
            icon.classList.add('bi-moon-stars-fill');
        }
    }
    
    // Sync with 3D Engine if loaded
    if (window.vault3DEngine) {
        window.vault3DEngine.setTheme(theme);
    } else {
        // If engine isn't loaded yet, try again after a short delay
        setTimeout(() => {
            if (window.vault3DEngine) window.vault3DEngine.setTheme(theme);
        }, 500);
    }
};

// Apply initial theme
applyTheme(currentTheme);

// Listen for OS theme changes
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'light' : 'dark');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (themeToggle && icon) {
        themeToggle.addEventListener('click', () => {
            const newTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bootstrapAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bootstrapAlert) {
                bootstrapAlert.close();
            }
        }, 5000);
    });

    // Dynamic styling for active navbar links
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-glass .nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else if (href !== '/' && currentPath.startsWith(href)) {
            link.classList.add('active');
        }
    });

    // AI Copilot Interactions
    const copilotToggle = document.getElementById('ai-copilot-toggle');
    const copilotChat = document.getElementById('ai-copilot-chat');
    const copilotClose = document.getElementById('ai-copilot-close');
    const copilotForm = document.getElementById('copilot-form');
    const copilotInput = document.getElementById('copilot-input');
    const chatMessages = document.getElementById('chat-messages');

    if (copilotToggle && copilotChat) {
        copilotToggle.addEventListener('click', function() {
            copilotChat.classList.remove('d-none');
            copilotChat.classList.add('d-flex');
            copilotToggle.classList.add('d-none');
            copilotInput.focus();
        });

        copilotClose.addEventListener('click', function() {
            copilotChat.classList.add('d-none');
            copilotChat.classList.remove('d-flex');
            copilotToggle.classList.remove('d-none');
        });

        copilotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = copilotInput.value.trim();
            if (!message) return;

            // Add user message to chat
            appendMessage(message, 'user');
            copilotInput.value = '';

            // Show loading indicator
            const loadingId = 'loading-' + Date.now();
            appendMessage('...', 'ai', loadingId);
            
            // Trigger 3D AI Mascot Thinking State
            window.dispatchEvent(new Event('ai-thinking'));

            // Get CSRF token from cookie
            const getCookie = (name) => {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            };
            const csrftoken = getCookie('csrftoken');

            // Send to backend
            fetch('/copilot/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                // Remove loading indicator
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) loadingElement.remove();
                
                // Trigger 3D AI Mascot Responding State
                window.dispatchEvent(new Event('ai-responding'));

                if (data.error) {
                    appendMessage('Error: ' + data.error, 'ai');
                } else {
                    appendMessage(data.response, 'ai');
                }
            })
            .catch(error => {
                // Remove loading indicator
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) loadingElement.remove();
                
                window.dispatchEvent(new Event('ai-idle'));
                
                appendMessage('Sorry, there was an error processing your request.', 'ai');
                console.error('Error:', error);
            });
        });

        function appendMessage(text, sender, id = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message mb-3 d-flex flex-column`;
            if (id) messageDiv.id = id;

            const contentDiv = document.createElement('div');
            contentDiv.className = `message-content p-2 rounded`;
            contentDiv.style.maxWidth = '85%';
            contentDiv.style.fontSize = '0.9rem';
            
            if (sender === 'user' || text === '...') {
                // Basic formatting for user or loading
                let formattedText = text.replace(/\n/g, '<br>');
                formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                contentDiv.innerHTML = formattedText;
            } else {
                // Use marked.js for AI responses
                if (typeof marked !== 'undefined') {
                    contentDiv.innerHTML = marked.parse(text);
                } else {
                    let formattedText = text.replace(/\n/g, '<br>');
                    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    contentDiv.innerHTML = formattedText;
                }
            }

            if (sender === 'user') {
                messageDiv.classList.add('align-items-end', 'animate-fade-in');
            } else {
                messageDiv.classList.add('align-items-start', 'animate-fade-in');
            }

            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
});
