import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function CommandBar() {
  const [input, setInput] = useState('');
  const [warning, setWarning] = useState(null);
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestionMeta, setSuggestionMeta] = useState({ active: false, type: null, query: '' });
  
  // Zustand Store
  const nodes = useStore((state) => state.nodes);
  const addNode = useStore((state) => state.addNode);
  const updateNode = useStore((state) => state.updateNode);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);
  const inputRef = useRef(null);

  // --- 1. EXCEL FORMULA MODE (Edit selected nodes) ---
  useEffect(() => {
    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const prefix = node.type === 'goal' ? '!' : node.type === 'task' ? '/' : '.';
        const tagString = node.tags && node.tags.length > 0 ? node.tags.map(t => '#' + t).join(' ') : '';
        const goalString = node.parentGoals && node.parentGoals.length > 0 ? node.parentGoals.map(p => '@' + p).join(' ') : '';
        
        // Construct the raw command: "! Launch Project #coding @g-123"
        const rawCommand = `${prefix} ${node.text} ${tagString} ${goalString}`.trim().replace(/\s+/g, ' ');
        setInput(rawCommand + ' '); // Add trailing space for easy typing
        
        // Auto-focus the input box when a node is clicked
        if (inputRef.current) inputRef.current.focus();
      }
    } else {
      setInput(''); // Clear the bar if clicked in blank space
    }
  }, [selectedNodeId, nodes]);

  // --- 2. THE SCANNER (Runs every keystroke for autocomplete) ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    const match = val.match(/(#|@)([\w-]*)$/);
    
    if (match) {
      const type = match[1]; 
      const query = match[2].toLowerCase();
      let newSuggestions = [];

      if (type === '#') {
        const uniqueTags = [...new Set(nodes.flatMap(n => n.tags || []))];
        newSuggestions = uniqueTags
          .filter(t => t.toLowerCase().startsWith(query))
          .map(t => ({ display: t, value: t, type: '#' }))
          .slice(0, 5); 
      } else if (type === '@') {
        const goals = nodes.filter(n => n.type === 'goal');
        newSuggestions = goals
          .filter(g => g.text.toLowerCase().includes(query) || g.id.toLowerCase().includes(query))
          .map(g => ({ display: g.text, value: g.id, type: '@' }))
          .slice(0, 5);
      }

      if (newSuggestions.length > 0) {
        setSuggestions(newSuggestions);
        setActiveIndex(0);
        setSuggestionMeta({ active: true, type, query });
        return;
      }
    }
    
    setSuggestionMeta({ active: false });
  };

  // --- 3. KEYBOARD EVENT HIJACKER ---
  const handleKeyDown = (e) => {
    // A. Intercept keys for Dropdown Navigation
    if (suggestionMeta.active && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertSuggestion(suggestions[activeIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestionMeta({ active: false });
        return;
      }
    }

    // B. Normal Input Submissions & Interactions
    if (e.key === 'Enter' && input.trim() !== '') {
      parseAndSubmit(input);
      setInput('');
      setSuggestionMeta({ active: false });
    }
    if (e.key === 'Escape') {
      setSelectedNodeId(null); // Cancel Edit Mode
      setInput('');
    }
  };

  // --- 4. THE INJECTOR (Autocomplete the word) ---
  const insertSuggestion = (suggestion) => {
    const regex = new RegExp(`(${suggestionMeta.type})([\\w-]*)$`);
    const newInput = input.replace(regex, `$1${suggestion.value} `);
    setInput(newInput);
    setSuggestionMeta({ active: false });
    inputRef.current.focus(); 
  };

  // --- 5. THE PARSER (Extract formatting & Save) ---
  const parseAndSubmit = (text) => {
    const trimmedText = text.trim();
    const prefix = trimmedText.charAt(0);

    if (!['!', '/', '.'].includes(prefix)) {
      setWarning("Invalid syntax: Start with ! (Goal), / (Task), or . (Thought)");
      setTimeout(() => setWarning(null), 3000);
      return; 
    }

    let type = 'thought';
    if (prefix === '!') type = 'goal';
    if (prefix === '/') type = 'task';

    const rawText = trimmedText.slice(1).trim();

    const tags = (rawText.match(/#\w+/g) || []).map(t => t.slice(1).toLowerCase());
    const parentMatches = rawText.match(/@[\w-]+/g) || [];
    const parentGoals = parentMatches.map(match => match.slice(1));

    const cleanText = rawText.replace(/#\w+/g, '').replace(/@[\w-]+/g, '').trim();

    if (cleanText.length === 0) {
      setWarning("Invalid syntax: Node must contain text.");
      setTimeout(() => setWarning(null), 3000);
      return;
    }

    const payload = { type, text: cleanText, tags, parentGoals };

    // If a node is selected, UPDATE it. Otherwise, ADD it.
    if (selectedNodeId) {
      updateNode(selectedNodeId, payload);
    } else {
      addNode({
        id: `${type.charAt(0)}-${Date.now()}`,
        ...payload
      });
    }
  };

  // --- 6. DYNAMIC UI STYLING ---
  let borderColor = '#444';
  let shadowGlow = 'transparent';

  // Overwrite color if we are in "Edit Mode"
  if (selectedNodeId) {
    borderColor = '#ffffff'; // Bright White to indicate Editing
    shadowGlow = 'rgba(255, 255, 255, 0.5)';
  } else {
    if (input.startsWith('!')) {
      borderColor = '#00f0ff';
      shadowGlow = 'rgba(0, 240, 255, 0.4)';
    } else if (input.startsWith('/')) {
      borderColor = '#39ff14';
      shadowGlow = 'rgba(57, 255, 20, 0.4)';
    } else if (input.startsWith('.')) {
      borderColor = '#ff6700';
      shadowGlow = 'rgba(255, 103, 0, 0.4)';
    }
  }

  return (
    <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '100%', maxWidth: '800px' }}>
      
      {/* WARNING POPUP */}
      {warning && (
        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '16px', backgroundColor: 'rgba(255, 51, 51, 0.15)', border: '1px solid #ff3333', color: '#ff3333', padding: '8px 16px', borderRadius: '8px', fontFamily: 'monospace', boxShadow: '0 0 15px rgba(255, 51, 51, 0.2)' }}>
          {warning}
        </div>
      )}

      {/* DROPDOWN PANEL */}
      {suggestionMeta.active && suggestions.length > 0 && (
        <ul style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', marginBottom: '12px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', listStyle: 'none', padding: '8px', margin: '0 0 12px 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}>
          {suggestions.map((s, index) => {
            const isActive = index === activeIndex;
            const itemColor = s.type === '#' ? '#39ff14' : '#00f0ff';
            return (
              <li key={index} style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: isActive ? '#333' : 'transparent', borderRadius: '6px', color: itemColor, fontFamily: 'monospace', fontSize: '16px', display: 'flex', justifyContent: 'space-between', transition: 'background-color 0.1s' }}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => insertSuggestion(s)}
              >
                <span>{s.type}{s.display}</span>
                {s.type === '@' && <span style={{ color: '#666', fontSize: '12px' }}>ID: {s.value}</span>}
              </li>
            )
          })}
        </ul>
      )}

      {/* INPUT BAR */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={selectedNodeId ? "Edit Node... (Press Esc to cancel)" : "! Goal  |  / Task  |  . Thought"}
        style={{
          width: '100%', padding: '18px 24px', fontSize: '18px', backgroundColor: '#121212', color: '#ffffff',
          border: `2px solid ${borderColor}`, borderRadius: '12px', outline: 'none',
          boxShadow: `0 0 20px ${shadowGlow}`, transition: 'border-color 0.2s ease, box-shadow 0.2s ease', fontFamily: 'monospace'
        }}
      />
    </div>
  );
}