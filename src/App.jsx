import CommandBar from './components/CommandBar';
import CanvasRenderer from './components/CanvasRenderer';
import DataControls from './components/DataControls';
import SelectionPanel from './components/SelectionPanel';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0a', overflow: 'hidden', position: 'relative' }}>
      <DataControls />
      <SelectionPanel />
      <CanvasRenderer />
      <CommandBar />
    </div>
  );
}