// src/stores/workspace.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core' // Edge type is already imported
import { MarkerType } from '@vue-flow/core'

export const useWorkspaceStore = defineStore('workspace', () => {
  const hostUrl = ref<string>(localStorage.getItem('scenario-host') || 'http://localhost:8080')
  const nodes = ref<Node[]>([
    {
      id: 'scn-1',
      type: 'scenarioCard',
      position: { x: 50, y: 100 },
      data: { scenarioId: 1 },
      label: 'Scenario 1',
      style: { width: '350px', height: '250px' },
    },
    {
      id: 'scn-2',
      type: 'scenarioCard',
      position: { x: 450, y: 100 },
      data: { scenarioId: 2 },
      label: 'Scenario 2',
      style: { width: '350px', height: '250px' },
    },
    {
      id: 'md-1',
      type: 'markdownNode',
      position: { x: 50, y: 400 },
      data: {
        markdownContent: "## Welcome!\n\nThis is a **Markdown Note**.\n\n- Double-click to edit.\n- Resize me using the handle at the bottom-right.",
      },
      style: { width: '280px', height: '200px' },
    },
  ])
  const edges = ref<Edge[]>([
    {
      id: 'e-scn1-scn2',
      source: 'scn-1',
      target: 'scn-2',
      label: '',
      markerEnd: MarkerType.ArrowClosed,
    },
  ])

  function updateHostUrl(newUrl: string) {
    const trimmedUrl = newUrl.trim()
    if (!trimmedUrl) {
      console.error('updateHostUrl: New URL is empty, not updating.')
      return
    }
    const cleanUrl = trimmedUrl.replace(/\/$/, '')
    hostUrl.value = cleanUrl
    try {
      localStorage.setItem('scenario-host', cleanUrl)
    } catch (e) {
      console.error('Failed to save host URL to localStorage', e)
    }
  }

  function updateNodeScenarioId(nodeId: string, newScenarioId: number) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node && node.data && node.type === 'scenarioCard') {
      node.data.scenarioId = newScenarioId;
    }
  }

  function updateNodeData(nodeId: string, newData: Partial<any>) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      node.data = { ...node.data, ...newData };
      // console.log(`Updated data for node ${nodeId}:`, JSON.parse(JSON.stringify(node.data)));
    } else {
      console.error(`Node with id ${nodeId} not found for data update.`);
    }
  }

  function updateNodeDimensions(nodeId: string, width: number, height: number) {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      const nodeToUpdate = nodes.value[nodeIndex];
      const newStyle = {
        ...nodeToUpdate.style,
        width: `${width}px`,
        height: `${height}px`,
      };
      nodes.value[nodeIndex] = {
        ...nodeToUpdate,
        style: newStyle,
      };
      // console.log(`Updated dimensions for node ${nodeId}: ${width}x${height}`);
    } else {
      console.error(`Node with id ${nodeId} not found for dimension update.`);
    }
  }

  // --- NEW FUNCTION TO REMOVE AN EDGE ---
  function removeEdge(edgeIdToRemove: string) {
    edges.value = edges.value.filter(edge => edge.id !== edgeIdToRemove);
    console.log(`Removed edge: ${edgeIdToRemove}`);
  }
  // --- END NEW FUNCTION ---

  return {
    hostUrl,
    nodes,
    edges,
    updateHostUrl,
    updateNodeScenarioId,
    updateNodeData,
    updateNodeDimensions,
    removeEdge, // Expose the new function
  }
})