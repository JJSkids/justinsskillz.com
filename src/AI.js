let chatHistory = [
  { role: "system", content: "You are Justin's personal AI collaborator, integrated into Justin's Skillz web app. Be warm, highly capable, concise, and helpful with programming, math, and daily learning." }
];

function openSettings() {
  const savedKey = localStorage.getItem('openai_api_key') || '';
  const savedModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
  document.getElementById('api-key-input').value = savedKey;
  document.getElementById('model-select').value = savedModel;
  document.getElementById('settings-modal').classList.add('active');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('active');
}

function saveSettings() {
  const key = document.getElementById('api-key-input').value.trim();
  const model = document.getElementById('model-select').value;
  if (key) {
    localStorage.setItem('openai_api_key', key);
    localStorage.setItem('openai_model', model);
    closeSettings();
  } else {
    alert('Please enter a valid OpenAI API key.');
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const inputEl = document.getElementById('user-input');
  const text = inputEl.value.trim();
  if (!text) return;

  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    openSettings();
    return;
  }

  inputEl.value = '';
  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  const typingId = appendTypingIndicator();

  try {
    const model = localStorage.getItem('openai_model') || 'gpt-4o-mini';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: chatHistory
      })
    });

    removeTypingIndicator(typingId);

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to communicate with OpenAI API.');
    }

    const data = await response.json();
    const assistantReply = data.choices[0].message.content;

    chatHistory.push({ role: 'assistant', content: assistantReply });
    appendMessage('assistant', assistantReply);

  } catch (err) {
    removeTypingIndicator(typingId);
    appendMessage('assistant', `⚠️ Error: ${err.message}. Please check your API key in settings.`);
  }
}

function appendMessage(sender, text) {
  const container = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;

  if (sender === 'assistant') {
    msgDiv.innerHTML = `
      <div class="ai-avatar" style="width: 32px; height: 32px; font-size: 0.9rem;">🤖</div>
      <div class="message-bubble">${escapeHtml(text)}</div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="message-bubble">${escapeHtml(text)}</div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'message assistant';
  div.innerHTML = `
    <div class="ai-avatar" style="width: 32px; height: 32px; font-size: 0.9rem;">🤖</div>
    <div class="message-bubble">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('openai_api_key')) {
    setTimeout(openSettings, 500);
  }
});