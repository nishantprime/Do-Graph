import { useRef } from 'react';
import { useStore } from '../store/useStore';

export default function DataControls() {
  const nodes = useStore((state) => state.nodes);
  const clearAll = useStore((state) => state.clearAll);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataString = JSON.stringify(nodes, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synastre-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        useStore.setState({ nodes: JSON.parse(event.target.result) });
      } catch (error) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const btnStyle = { backgroundColor: '#1a1a1a', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '14px', transition: 'all 0.2s' };

  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100, display: 'flex', gap: '10px' }}>
      <button 
        style={{...btnStyle, color: '#ff3333', border: '1px solid #ff3333'}} 
        onClick={() => { if(window.confirm("WARNING: Wipe entirely?")) clearAll(); }}
      >
        [ Wipe Data ]
      </button>
      <button style={{...btnStyle, color: '#00f0ff', border: '1px solid #00f0ff'}} onClick={handleExport}>
        [ Export .JSON ]
      </button>
      <button style={{...btnStyle, color: '#39ff14', border: '1px solid #39ff14'}} onClick={() => fileInputRef.current.click()}>
        [ Import ]
      </button>
      <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
    </div>
  );
}