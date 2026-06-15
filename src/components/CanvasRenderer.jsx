import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import * as d3 from 'd3';

const getMonthColor = (monthStr) => {
  let hash = 0;
  for (let i = 0; i < monthStr.length; i++) hash = monthStr.charCodeAt(i) + ((hash << 5) - hash);
  return `hsla(${hash % 360}, 70%, 50%, 0.15)`; 
};

export default function CanvasRenderer() {
  const canvasRef = useRef(null);
  const rawNodes = useStore((state) => state.nodes);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);
  const transformRef = useRef(d3.zoomIdentity);
  
  // Interaction State (Kept in a Ref so React doesn't reboot the physics engine)
  const interaction = useRef({
    hoveredNode: null,
    selectedNode: null
  });
  const renderLoopRef = useRef(null);

  // Sync external Zustand changes (Command Bar Escape Key) to the Canvas
  useEffect(() => {
    interaction.current.selectedNode = selectedNodeId;
    if (renderLoopRef.current) renderLoopRef.current();
  }, [selectedNodeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (rawNodes.length === 0) return;

    const simNodes = rawNodes.map(n => ({ ...n }));
    const goalWeights = {};
    const simSprings = []; 
    const edgesToDraw = []; 

    // --- A. THE NOTEBOOK GRID ---
    const months = [...new Set(simNodes.map(n => n.month))];
    const monthCenters = {};
    const cols = 3; 
    const spacingX = 1400; 
    const spacingY = 1200; 

    months.forEach((month, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      monthCenters[month] = {
        x: (width / 2) + (col * spacingX) - ((cols > 1 ? cols - 1 : 0) * spacingX / 2),
        y: (height / 2) + (row * spacingY),
        color: getMonthColor(month)
      };
    });

    // --- B. THE STRICT EDGE MATRIX ---
    simNodes.forEach(n => {
      if ((n.type === 'task' || n.type === 'thought') && n.parentGoals) {
        n.parentGoals.forEach(gId => {
          goalWeights[gId] = (goalWeights[gId] || 0) + 1;
          simSprings.push({ source: n.id, target: gId, value: 1 }); 
          edgesToDraw.push({ id: `edge-${n.id}-${gId}`, source: n.id, target: gId, type: 'structural' }); 
        });
      }
    });

    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const n1 = simNodes[i];
        const n2 = simNodes[j];
        let W = 0; 
        
        if (n1.tags?.length > 0 && n2.tags?.length > 0) {
          const sharedTags = n1.tags.filter(t => n2.tags.includes(t)).length;
          if (sharedTags > 0) W = sharedTags / new Set([...n1.tags, ...n2.tags]).size;
        }

        if (W > 0) {
          const hasMin3Tags = n1.tags.length >= 3 && n2.tags.length >= 3;
          const exactSmallMatch = (n1.tags.length === 1 && n2.tags.length === 1 && W === 1) || 
                                  (n1.tags.length === 2 && n2.tags.length === 2 && W === 1);
          const edgeId = `edge-${n1.id}-${n2.id}`;

          if (n1.type === 'goal' && n2.type === 'goal' && n1.month !== n2.month && hasMin3Tags && W >= 0.7) {
            edgesToDraw.push({ id: edgeId, source: n1.id, target: n2.id, type: 'evolutionary' });
          } else if (hasMin3Tags && W >= 0.7) {
            const color = n1.type === 'thought' ? '#ff6700' : (n1.type === 'task' ? '#39ff14' : '#00f0ff');
            edgesToDraw.push({ id: edgeId, source: n1.id, target: n2.id, type: 'strong-tag', weight: W, color });
            simSprings.push({ source: n1.id, target: n2.id, value: 0.5 }); 
          } else if ((hasMin3Tags && W > 0.4 && W < 0.7) || exactSmallMatch) {
            edgesToDraw.push({ id: edgeId, source: n1.id, target: n2.id, type: 'weak-tag' });
          }
        }
      }
    }

    simNodes.forEach(n => n.radius = n.type === 'goal' ? 30 + (5 * (goalWeights[n.id] || 0)) : 20);

    // --- C. RENDER LOOP WITH NEIGHBOR HIGHLIGHTING ---
    const render = () => {
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(transformRef.current.x, transformRef.current.y);
      context.scale(transformRef.current.k, transformRef.current.k);

      // 1. Month Background Blobs
      Object.keys(monthCenters).forEach(month => {
        const center = monthCenters[month];
        context.beginPath();
        context.roundRect(center.x - 600, center.y - 500, 1200, 1000, 100);
        context.fillStyle = center.color;
        context.fill();
        context.fillStyle = 'rgba(255,255,255,0.4)';
        context.font = '24px monospace';
        context.textAlign = 'left';
        context.fillText(month.toUpperCase(), center.x - 550, center.y - 450);
      });

      // 2. Identify Active Node & Its 1st-Degree Neighbors
      const state = interaction.current;
      const activeNodeId = state.selectedNode || state.hoveredNode;
      const activeNeighbors = new Set();

      if (activeNodeId) {
        edgesToDraw.forEach(edge => {
          const srcId = typeof edge.source === 'object' ? edge.source.id : edge.source;
          const tgtId = typeof edge.target === 'object' ? edge.target.id : edge.target;
          if (srcId === activeNodeId) activeNeighbors.add(tgtId);
          if (tgtId === activeNodeId) activeNeighbors.add(srcId);
        });
      }

      // 3. Edges
// 3. Edges
      const isInteractionActive = !!activeNodeId;

      edgesToDraw.forEach(edge => {
        const source = typeof edge.source === 'object' ? edge.source : simNodes.find(n => n.id === edge.source);
        const target = typeof edge.target === 'object' ? edge.target : simNodes.find(n => n.id === edge.target);
        if (!source || !target) return;

        // Is this specific edge touching the node your mouse is on?
        const isConnectedToActiveNode = source.id === activeNodeId || target.id === activeNodeId;
        
        // Dim edges only if you are interacting with something ELSE
        context.globalAlpha = (!isInteractionActive || isConnectedToActiveNode) ? 1 : 0.05; 

        context.beginPath();
        context.moveTo(source.x, source.y);
        
        // Only turn the line white if you are actively clicking/hovering its parent node.
        // Otherwise, show its true mathematical color.
        const useHighlight = isInteractionActive && isConnectedToActiveNode;

        if (edge.type === 'evolutionary') {
           context.quadraticCurveTo((source.x + target.x) / 2, (source.y + target.y) / 2 - 400, target.x, target.y);
           context.strokeStyle = useHighlight ? '#ffffff' : 'rgba(0, 240, 255, 0.4)';
           context.lineWidth = useHighlight ? 4 : 2;
        } else {
           context.lineTo(target.x, target.y);
           if (edge.type === 'structural') {
             context.strokeStyle = useHighlight ? '#ffffff' : 'rgba(57, 255, 20, 0.6)'; // Lime
             context.lineWidth = useHighlight ? 3 : 2.5;
           } else if (edge.type === 'weak-tag') {
             context.strokeStyle = useHighlight ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'; // Faint thread
             context.lineWidth = useHighlight ? 2 : 1;
           } else if (edge.type === 'strong-tag') {
             context.strokeStyle = useHighlight ? '#ffffff' : edge.color; // Node's native color
             context.lineWidth = useHighlight ? (edge.weight * 4) + 1 : edge.weight * 4;
           }
        }
        context.stroke();
      });

      // 4. Nodes
      simNodes.forEach(node => {
        const isCoreNode = node.id === activeNodeId;
        const isNeighborNode = activeNeighbors.has(node.id);
        const isHighlighted = !activeNodeId || isCoreNode || isNeighborNode;
        
        context.globalAlpha = isHighlighted ? 1 : 0.1; // Dim irrelevant nodes

        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

        if (node.type === 'goal') context.fillStyle = '#00f0ff';
        if (node.type === 'task') context.fillStyle = '#39ff14';
        if (node.type === 'thought') context.fillStyle = '#ff6700';

        context.shadowBlur = isHighlighted ? 30 : 10;
        context.shadowColor = context.fillStyle;
        context.fill();

        // Target Rings
        if (isCoreNode) {
          context.shadowBlur = 0;
          context.lineWidth = 4;
          context.strokeStyle = '#ffffff'; // Thick white ring for the clicked node
          context.stroke();
        } else if (isNeighborNode) {
          context.shadowBlur = 0;
          context.lineWidth = 2;
          context.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // Thinner, softer ring for neighbors
          context.stroke();
        }

        context.shadowBlur = 0;
        context.fillStyle = '#ffffff';
        context.font = '14px monospace';
        context.textAlign = 'center';
        context.fillText(node.text, node.x, node.y + node.radius + 15);
      });

      context.restore();
    };
    
    renderLoopRef.current = render;

    // --- D. PHYSICS & INTERACTION ---
    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(simSprings).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('collide', d3.forceCollide().radius(d => d.radius + 20).iterations(2))
      .force('x', d3.forceX(d => monthCenters[d.month]?.x || width / 2).strength(0.08))
      .force('y', d3.forceY(d => monthCenters[d.month]?.y || height / 2).strength(0.08));

    simulation.on('tick', render);

    // MOUSE TRACKING (Nodes Only)
    d3.select(canvas).on('mousemove', (event) => {
      const transform = transformRef.current;
      const mouseX = (event.offsetX - transform.x) / transform.k;
      const mouseY = (event.offsetY - transform.y) / transform.k;
      
      const hoveredN = simulation.find(mouseX, mouseY, 30);
      interaction.current.hoveredNode = hoveredN ? hoveredN.id : null;
      canvas.style.cursor = hoveredN ? 'pointer' : 'grab';
      render(); 
    });

    // CLICK EVENT (Nodes Only)
    d3.select(canvas).on('click', (event) => {
      const state = interaction.current;
      if (state.hoveredNode) {
        state.selectedNode = state.hoveredNode;
        setSelectedNodeId(state.hoveredNode); 
      } else {
        state.selectedNode = null;
        setSelectedNodeId(null);
      }
      render();
    });

    const zoom = d3.zoom().scaleExtent([0.1, 5]).on('zoom', (e) => {
      transformRef.current = e.transform;
      render();
    });
    d3.select(canvas).call(zoom);

    return () => {
      simulation.stop();
      d3.select(canvas).on('.zoom', null);
      d3.select(canvas).on('mousemove', null);
      d3.select(canvas).on('click', null);
    };
  }, [rawNodes, setSelectedNodeId]); 

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />;
}