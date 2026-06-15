import { useStore } from '../store/useStore';

export default function SelectionPanel() {
  const nodes = useStore((state) => state.nodes);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const deleteNode = useStore((state) => state.deleteNode);

  if (!selectedNodeId) return null;

  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) return null;

  const borderColor = node.type === 'goal' ? '#00f0ff' : node.type === 'task' ? '#39ff14' : '#ff6700';

  return (
    <div style={{
      position: 'absolute', top: '20px', left: '20px', zIndex: 100,
      backgroundColor: 'rgba(20, 20, 20, 0.85)', padding: '16px',
      borderRadius: '12px', border: `1px solid ${borderColor}`,
      fontFamily: 'monospace', color: '#fff', width: '250px',
      backdropFilter: 'blur(10px)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: borderColor, fontSize: '16px', textTransform: 'uppercase' }}>
        Selected {node.type}
      </h3>
      <div style={{ marginBottom: '15px' }}>
        {node.tags && node.tags.length > 0 ? node.tags.map(t => (
           <span key={t} style={{ display: 'inline-block', backgroundColor: '#333', padding: '4px 8px', borderRadius: '4px', marginRight: '5px', marginBottom: '5px', fontSize: '12px' }}>
             #{t}
           </span>
        )) : <span style={{ color: '#666' }}>No Tags</span>}
      </div>
      <button 
        onClick={() => deleteNode(node.id)}
        style={{ width: '100%', backgroundColor: '#ff333322', color: '#ff3333', border: '1px solid #ff3333', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
      >
        Delete Node
      </button>
    </div>
  );
}