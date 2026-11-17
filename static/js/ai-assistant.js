/**
 * ai-assistant.js
 * Handles the floating UI, voice integration, and rich API responses for ASK CHIRANJEEB AI.
 */

document.addEventListener('DOMContentLoaded', () => {
    const aiButton = document.getElementById('ai-assistant-btn');
    const aiPanel = document.getElementById('ai-assistant-panel');
    const closeBtn = document.getElementById('ai-close-btn');
    const chatBody = document.getElementById('ai-chat-body');
    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const voiceBtn = document.getElementById('ai-voice-btn');
    const avatarState = document.getElementById('ai-avatar-state');

    // Speech APIs
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let synth = window.speechSynthesis;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            voiceBtn.classList.add('listening');
            setAvatarState('listening');
            chatInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            sendMessage();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            stopListening();
        };

        recognition.onend = () => {
            stopListening();
        };
    } else {
        if (voiceBtn) voiceBtn.style.display = 'none';
    }

    function toggleListening() {
        if (!recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }

    function stopListening() {
        isListening = false;
        if (voiceBtn) voiceBtn.classList.remove('listening');
        setAvatarState('idle');
        chatInput.placeholder = "Ask a question...";
    }

    function setAvatarState(state) {
        if (!avatarState) return;
        // States: idle, listening, thinking, responding
        avatarState.className = `ai-avatar ${state}`;
    }

    function togglePanel() {
        aiPanel.classList.toggle('active');
        if (aiPanel.classList.contains('active')) {
            chatInput.focus();
        }
    }

    function appendMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${isUser ? 'user-msg' : 'bot-msg'}`;
        
        // Use innerHTML for bot to support basic markdown bolding
        if (isUser) {
            msgDiv.textContent = text;
        } else {
            // Simple markdown bolding replacement
            const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            msgDiv.innerHTML = formatted;
            
            // Add Text-to-Speech button
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-btn';
            ttsBtn.innerHTML = '<i class="bi bi-volume-up"></i>';
            ttsBtn.onclick = () => speakText(text);
            msgDiv.appendChild(ttsBtn);
        }

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendActionCards(actions) {
        if (!actions || actions.length === 0) return;
        
        const actionContainer = document.createElement('div');
        actionContainer.className = 'ai-actions-container';

        actions.forEach(action => {
            if (action.type === 'project_card') {
                const card = document.createElement('a');
                card.className = 'ai-action-card';
                card.href = action.url;
                card.innerHTML = `
                    <div class="title"><i class="bi bi-folder-symlink"></i> ${action.title}</div>
                    <div class="desc">${action.description}</div>
                `;
                actionContainer.appendChild(card);
            } else if (action.type === 'resume_link') {
                const card = document.createElement('a');
                card.className = 'ai-action-btn';
                card.href = action.url;
                card.target = '_blank';
                card.innerHTML = `<i class="bi bi-file-earmark-person"></i> View Resume`;
                actionContainer.appendChild(card);
            } else if (action.type === 'contact_link') {
                const card = document.createElement('a');
                card.className = 'ai-action-btn';
                card.href = '/#contact'; // Assuming #contact anchor exists on home page
                card.innerHTML = `<i class="bi bi-envelope"></i> Contact Form`;
                actionContainer.appendChild(card);
            }
        });

        chatBody.appendChild(actionContainer);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function speakText(text) {
        if (!synth) return;
        if (synth.speaking) {
            synth.cancel();
            return;
        }
        
        // Strip markdown before speaking
        const cleanText = text.replace(/[*#]/g, '');
        const utterThis = new SpeechSynthesisUtterance(cleanText);
        utterThis.onstart = () => setAvatarState('responding');
        utterThis.onend = () => setAvatarState('idle');
        synth.speak(utterThis);
    }

    async function sendMessage(textOverride = null) {
        const text = textOverride || chatInput.value.trim();
        if (!text) return;

        appendMessage(text, true);
        chatInput.value = '';
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-msg bot-msg loading';
        loadingDiv.innerHTML = '<span class="dots">AI Thinking...</span>';
        chatBody.appendChild(loadingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        setAvatarState('thinking');

        try {
            const response = await fetch('/copilot/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Function needs to exist globally
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            chatBody.removeChild(loadingDiv);
            
            if (data.error) {
                appendMessage('Error: ' + data.error);
                setAvatarState('idle');
            } else {
                appendMessage(data.answer);
                appendActionCards(data.actions);
                setAvatarState('idle');
            }

        } catch (err) {
            console.error('AI Request failed', err);
            chatBody.removeChild(loadingDiv);
            appendMessage('Network error. Unable to reach the AI core.');
            setAvatarState('idle');
        }
    }

    // Helper to get CSRF token
    function getCookie(name) {
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
    }

    // Event Listeners
    if (aiButton) aiButton.addEventListener('click', togglePanel);
    if (closeBtn) closeBtn.addEventListener('click', togglePanel);
    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());
    if (voiceBtn) voiceBtn.addEventListener('click', toggleListening);
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Suggested queries binding
    document.querySelectorAll('.ai-suggest-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            sendMessage(e.target.innerText);
        });
    });

});
