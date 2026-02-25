const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

/**
 * Dodaje dymek wiadomości do okna czatu
 * @param {string} text - Treść wiadomości
 * @param {string} sender - 'user' lub 'bot'
 */
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  
  msgDiv.classList.add("message");
  msgDiv.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  msgDiv.innerText = text;

  chatBox.appendChild(msgDiv);

  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  
  if (!text) return;

  addMessage(text, "user");

  userInput.value = "";
  userInput.disabled = true;
  if (sendBtn) sendBtn.disabled = true;

  try {
    const response = await fetch(`/api/response?sentence=${encodeURIComponent(text)}&key=TEST`);
    
    if (!response.ok) throw new Error("Problem z odpowiedzią serwera");

    const data = await response.json();

    if (data.response) {
      addMessage(data.response, "bot");
    } else {
      addMessage("Błąd: Serwer nie zwrócił poprawnej odpowiedzi.", "bot");
    }

  } catch (error) {
    console.error("Błąd czatu:", error);
    addMessage("Błąd połączenia z serwerem! Upewnij się, że bot działa.", "bot");
  } finally {
    userInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    userInput.focus();
  }
}

function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}