// ============================================
// SCRIBBI - AI-Augmented Writing Platform
// ============================================

const STORAGE_KEY = 'scribbi_documents';
const CURRENT_DOC_KEY = 'scribbi_current_doc';

// State
let currentDocument = {
  id: 'doc-1',
  name: 'Untitled Document',
  content: '',
  receipts: [],
  characters: [],
  timeline: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

let receiptsVisible = false;
let autosaveTimer = null;

// DOM Elements
const editor = document.getElementById('editor');
const doneBtn = document.getElementById('doneForNow');
const toggleReceiptsBtn = document.getElementById('toggleReceipts');
const receiptsContainer = document.getElementById('receiptsContainer');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.querySelector('.close-settings');
const themeButtons = document.querySelectorAll('.theme-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const sidebarPanels = document.querySelectorAll('.sidebar-panel');
const characterList = document.getElementById('characterList');
const characterCount = document.getElementById('characterCount');
const timelineList = document.getElementById('timelineList');
const viewButtons = document.querySelectorAll('.view-btn');

// ============================================
// INITIALIZATION
// ============================================

function init() {
  loadDocument();
  setupEventListeners();
  updateUI();
  startAutosave();
}

function setupEventListeners() {
  // Editor
  editor.addEventListener('input', handleEditorInput);
  editor.addEventListener('paste', handlePaste);
  
  // Done for Now
  doneBtn.addEventListener('click', handleDoneForNow);
  
  // Receipts toggle
  toggleReceiptsBtn.addEventListener('click', toggleReceiptsView);
  
  // Settings
  settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
  closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));
  settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) settingsPanel.classList.add('hidden');
  });
  
  // Theme switching
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTheme(btn.dataset.theme));
  });
  
  // Sidebar tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.panel));
  });
  
  // Timeline view toggle
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTimeline(btn.dataset.view);
    });
  });
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

function loadDocument() {
  const saved = localStorage.getItem(CURRENT_DOC_KEY);
  if (saved) {
    try {
      currentDocument = JSON.parse(saved);
      editor.innerHTML = currentDocument.content || '<p>Start writing your story here...</p>';
    } catch (e) {
      console.error('Failed to load document:', e);
    }
  }
  updateCharacterExtraction();
  updateTimelineExtraction();
}

function saveDocument() {
  currentDocument.content = editor.innerHTML;
  currentDocument.updatedAt = new Date().toISOString();
  localStorage.setItem(CURRENT_DOC_KEY, JSON.stringify(currentDocument));
}

function startAutosave() {
  setInterval(() => {
    if (editor.textContent.trim()) {
      saveDocument();
    }
  }, 3000); // Autosave every 3 seconds
}

// ============================================
// EDITOR HANDLERS
// ============================================

function handleEditorInput() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    updateCharacterExtraction();
    updateTimelineExtraction();
  }, 2000); // Debounce analysis
}

function handlePaste(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  const selection = window.getSelection();
  if (selection.rangeCount) {
    selection.deleteContents();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
  }
}

// ============================================
// DONE FOR NOW - RECEIPT GENERATION
// ============================================

function handleDoneForNow() {
  const recentText = getRecentText();
  if (!recentText.trim()) {
    alert('Write something first before generating a receipt.');
    return;
  }
  
  const receipt = generateReceipt(recentText);
  currentDocument.receipts.push(receipt);
  saveDocument();
  
  showReceiptOverlay(receipt);
  updateUI();
}

function getRecentText() {
  // Get text from the last paragraph or last 500 characters
  const text = editor.textContent || '';
  const paragraphs = text.split('\n').filter(p => p.trim());
  if (paragraphs.length === 0) return text;
  
  // Get last 2-3 paragraphs or last 500 chars
  const recent = paragraphs.slice(-3).join('\n\n');
  return recent.length > 500 ? text.slice(-500) : recent;
}

function generateReceipt(text) {
  // Mock AI analysis - in production, this would call an AI API
  const analysis = analyzeText(text);
  
  const receipt = {
    id: `receipt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    textContext: text.slice(0, 200) + '...',
    questions: analysis.questions,
    themes: analysis.themes,
    poem: analysis.poem,
    pinned: false,
    position: getCurrentCursorPosition()
  };
  
  return receipt;
}

function analyzeText(text) {
  // Mock dramaturgical analysis
  // In production, this would use an AI API with dramaturgical prompts
  
  const questions = [
    generateQuestion(text, 'why'),
    generateQuestion(text, 'how'),
    generateQuestion(text, 'what-if'),
    generateQuestion(text, 'sensory')
  ].filter(Boolean);
  
  const themes = extractThemes(text);
  const poem = generateHaiku(text);
  
  return { questions, themes, poem };
}

function generateQuestion(text, type) {
  const lower = text.toLowerCase();
  const questions = {
    why: [
      "What does your character's body language reveal about their inner state?",
      "Why does this moment matter to the larger narrative?",
      "What unspoken desire drives this character's actions?",
      "What does the silence between words tell us?"
    ],
    how: [
      "How does the physical space reflect the emotional landscape?",
      "How does the pacing of this scene serve the story's rhythm?",
      "How might a different point of view change this moment?",
      "How do the sensory details anchor the reader in this world?"
    ],
    'what-if': [
      "What if this scene happened in a different setting?",
      "What if another character witnessed this moment?",
      "What if the character made the opposite choice?",
      "What if this moment is remembered differently later?"
    ],
    sensory: [
      "What does the air taste like in this scene?",
      "What texture does this moment have?",
      "What sound would accompany this if it were a film?",
      "What temperature is the emotional atmosphere?"
    ]
  };
  
  // Simple keyword matching to make questions more relevant
  if (lower.includes('character') || lower.includes('he') || lower.includes('she') || lower.includes('they')) {
    return questions[type][0];
  } else if (lower.includes('room') || lower.includes('place') || lower.includes('space')) {
    return questions[type][1] || questions[type][0];
  } else {
    return questions[type][Math.floor(Math.random() * questions[type].length)];
  }
}

function extractThemes(text) {
  // Simple theme extraction based on keywords
  const themes = [];
  const lower = text.toLowerCase();
  
  const themeKeywords = {
    'loss': ['lost', 'gone', 'missing', 'absence', 'death'],
    'discovery': ['found', 'discovered', 'realized', 'understood', 'revealed'],
    'conflict': ['fight', 'argue', 'struggle', 'battle', 'tension'],
    'memory': ['remember', 'recall', 'past', 'nostalgia', 'forgot'],
    'desire': ['want', 'need', 'long', 'yearn', 'crave'],
    'secrets': ['secret', 'hidden', 'concealed', 'unknown', 'mystery']
  };
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      themes.push(theme);
    }
  }
  
  return themes.length > 0 ? themes : ['narrative', 'character development'];
}

function generateHaiku(text) {
  // Simple haiku generation based on text mood
  const lower = text.toLowerCase();
  const haikus = [
    "Words fall like soft rain\nOn the page of memory\nStories take root here",
    "Character's journey\nThrough the landscape of the heart\nWhere truth finds its voice",
    "Silence between lines\nSpeaks volumes to the reader\nWhat remains unsaid",
    "Scene unfolds slowly\nLike morning mist on water\nClarity will come"
  ];
  
  // Pick based on mood
  if (lower.includes('dark') || lower.includes('night') || lower.includes('shadow')) {
    return haikus[2];
  } else if (lower.includes('light') || lower.includes('bright') || lower.includes('sun')) {
    return haikus[3];
  } else {
    return haikus[Math.floor(Math.random() * haikus.length)];
  }
}

function getCurrentCursorPosition() {
  // Get approximate position in document
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return { top: 0, left: 0 };
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const editorRect = editor.getBoundingClientRect();
  
  return {
    top: rect.top - editorRect.top + editor.scrollTop,
    left: rect.left - editorRect.left
  };
}

// ============================================
// RECEIPT OVERLAY SYSTEM
// ============================================

function showReceiptOverlay(receipt) {
  const overlay = createReceiptElement(receipt);
  overlay.classList.add('active');
  
  // Position near cursor or center
  const pos = receipt.position || { top: editor.scrollTop + 200, left: 100 };
  overlay.style.top = `${pos.top}px`;
  overlay.style.left = `${pos.left}px`;
  
  receiptsContainer.appendChild(overlay);
  
  // Auto-dismiss after 10 seconds (optional)
  setTimeout(() => {
    if (!receipt.pinned && !overlay.classList.contains('pinned')) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
  }, 10000);
}

function createReceiptElement(receipt) {
  const div = document.createElement('div');
  div.className = 'receipt-overlay';
  div.dataset.receiptId = receipt.id;
  
  if (receipt.pinned) div.classList.add('pinned');
  
  const date = new Date(receipt.timestamp);
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });
  
  div.innerHTML = `
    <div class="receipt-header">
      <span class="receipt-timestamp">${timeStr}</span>
      <div class="receipt-actions">
        <button class="receipt-btn pin-btn" data-id="${receipt.id}">
          ${receipt.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button class="receipt-btn dismiss-btn" data-id="${receipt.id}">Dismiss</button>
      </div>
    </div>
    
    <div class="receipt-section">
      <div class="receipt-label">Questions</div>
      ${receipt.questions.map(q => `<div class="receipt-question">• ${q}</div>`).join('')}
    </div>
    
    <div class="receipt-section">
      <div class="receipt-label">Themes</div>
      <div class="receipt-themes">${receipt.themes.join(', ')}</div>
    </div>
    
    <div class="receipt-poem">${receipt.poem}</div>
  `;
  
  // Event listeners
  div.querySelector('.pin-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePinReceipt(receipt.id);
  });
  
  div.querySelector('.dismiss-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    dismissReceipt(receipt.id);
  });
  
  return div;
}

function togglePinReceipt(receiptId) {
  const receipt = currentDocument.receipts.find(r => r.id === receiptId);
  if (receipt) {
    receipt.pinned = !receipt.pinned;
    saveDocument();
    renderReceipts();
  }
}

function dismissReceipt(receiptId) {
  const overlay = receiptsContainer.querySelector(`[data-receipt-id="${receiptId}"]`);
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }
}

function toggleReceiptsView() {
  receiptsVisible = !receiptsVisible;
  toggleReceiptsBtn.classList.toggle('active', receiptsVisible);
  
  if (receiptsVisible) {
    renderReceipts();
  } else {
    receiptsContainer.innerHTML = '';
  }
}

function renderReceipts() {
  receiptsContainer.innerHTML = '';
  
  if (!receiptsVisible) return;
  
  // Render all receipts as inline overlays
  currentDocument.receipts.forEach(receipt => {
    const overlay = createReceiptElement(receipt);
    overlay.classList.add('inline');
    
    // Position based on text context (simplified - in production would track text positions)
    const pos = receipt.position || { top: 100 + Math.random() * 200, left: 50 };
    overlay.style.top = `${pos.top}px`;
    overlay.style.left = `${pos.left}px`;
    
    receiptsContainer.appendChild(overlay);
  });
}

// ============================================
// CHARACTER EXTRACTION
// ============================================

function updateCharacterExtraction() {
  const text = editor.textContent || '';
  const characters = extractCharacters(text);
  currentDocument.characters = characters;
  renderCharacters();
}

function extractCharacters(text) {
  // Simple character extraction using heuristics
  const characters = [];
  const seen = new Set();
  
  // Look for capitalized words that appear multiple times (likely character names)
  const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const wordCounts = {};
  
  words.forEach(word => {
    // Skip common words
    const common = ['The', 'This', 'That', 'There', 'Then', 'They', 'She', 'He', 'It', 'I', 'A', 'An'];
    if (common.includes(word)) return;
    
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Characters are words that appear 3+ times
  Object.entries(wordCounts)
    .filter(([name, count]) => count >= 3 && !seen.has(name))
    .forEach(([name, count]) => {
      seen.add(name);
      const existing = currentDocument.characters.find(c => c.name === name);
      
      if (existing) {
        existing.mentionCount = count;
        existing.lastSeen = new Date().toISOString();
      } else {
        characters.push({
          name,
          mentionCount: count,
          traits: extractTraits(text, name),
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        });
      }
    });
  
  // Merge with existing
  const existingNames = new Set(characters.map(c => c.name));
  currentDocument.characters.forEach(char => {
    if (!existingNames.has(char.name)) {
      characters.push(char);
    }
  });
  
  return characters.sort((a, b) => b.mentionCount - a.mentionCount);
}

function extractTraits(text, name) {
  // Simple trait extraction - look for adjectives near character name
  const regex = new RegExp(`\\b${name}\\b[^.]{0,100}`, 'gi');
  const matches = text.match(regex) || [];
  const traits = [];
  
  const traitWords = ['brave', 'kind', 'angry', 'sad', 'happy', 'clever', 'wise', 'young', 'old', 'tall', 'short'];
  matches.forEach(match => {
    traitWords.forEach(trait => {
      if (match.toLowerCase().includes(trait) && !traits.includes(trait)) {
        traits.push(trait);
      }
    });
  });
  
  return traits.slice(0, 3);
}

function renderCharacters() {
  characterCount.textContent = currentDocument.characters.length;
  
  if (currentDocument.characters.length === 0) {
    characterList.innerHTML = '<p class="empty-state">Characters will appear as you write...</p>';
    return;
  }
  
  characterList.innerHTML = currentDocument.characters.map(char => `
    <div class="character-item" data-name="${char.name}">
      <div class="character-name">${char.name}</div>
      ${char.traits.length > 0 ? `<div class="character-traits">${char.traits.join(', ')}</div>` : ''}
      <div class="character-mentions">Mentioned ${char.mentionCount} times</div>
    </div>
  `).join('');
  
  // Add click handlers to highlight mentions
  characterList.querySelectorAll('.character-item').forEach(item => {
    item.addEventListener('click', () => highlightCharacter(item.dataset.name));
  });
}

function highlightCharacter(name) {
  // Simple highlight - in production would use proper text ranges
  const text = editor.textContent;
  const regex = new RegExp(`\\b${name}\\b`, 'gi');
  // This is simplified - proper implementation would use Range API
  editor.innerHTML = editor.innerHTML.replace(
    new RegExp(`\\b${name}\\b`, 'gi'),
    `<span class="highlight">${name}</span>`
  );
  
  setTimeout(() => {
    editor.innerHTML = editor.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/gi, '$1');
  }, 3000);
}

// ============================================
// TIMELINE EXTRACTION
// ============================================

function updateTimelineExtraction() {
  const text = editor.textContent || '';
  const events = extractEvents(text);
  currentDocument.timeline = events;
  renderTimeline('story');
}

function extractEvents(text) {
  // Simple event extraction
  const events = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  const eventKeywords = ['discovered', 'found', 'met', 'left', 'arrived', 'decided', 'realized', 'began', 'ended', 'started'];
  
  sentences.forEach((sentence, index) => {
    const lower = sentence.toLowerCase();
    const keyword = eventKeywords.find(kw => lower.includes(kw));
    
    if (keyword) {
      events.push({
        id: `event-${index}`,
        text: sentence.trim().slice(0, 100) + (sentence.length > 100 ? '...' : ''),
        position: index,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  return events.slice(-10); // Keep last 10 events
}

function renderTimeline(view) {
  if (currentDocument.timeline.length === 0) {
    timelineList.innerHTML = '<p class="empty-state">Events will appear as you write...</p>';
    return;
  }
  
  const events = view === 'chrono' 
    ? [...currentDocument.timeline].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    : currentDocument.timeline;
  
  timelineList.innerHTML = events.map(event => `
    <div class="timeline-item">
      <div class="timeline-event">${event.text}</div>
      <div class="timeline-context">Position ${event.position + 1}</div>
    </div>
  `).join('');
}

// ============================================
// UI UPDATES
// ============================================

function updateUI() {
  renderCharacters();
  renderTimeline('story');
  if (receiptsVisible) {
    renderReceipts();
  }
}

// ============================================
// THEME SWITCHING
// ============================================

function switchTheme(theme) {
  document.body.className = `theme-${theme}`;
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  localStorage.setItem('scribbi_theme', theme);
}

// Load saved theme
const savedTheme = localStorage.getItem('scribbi_theme') || 'coffee-cream';
switchTheme(savedTheme);

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(panelName) {
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === panelName);
  });
  
  sidebarPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `${panelName}Panel`);
  });
}

// ============================================
// INITIALIZE
// ============================================

init();

