// src/stores/workspace.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'
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
    },
    {
      id: 'scn-2',
      type: 'scenarioCard',
      position: { x: 450, y: 100 },
      data: { scenarioId: 2 },
      label: 'Scenario 2',
    },
    {
      id: 'md-1',
      type: 'markdownNode', // New node type
      position: { x: 50, y: 400 },
      data: {
        markdownContent: "## Welcome!\n\nThis is a **Markdown Note**.\n\n- Double-click to edit.\n- Resize me using the handle at the bottom-right.",
        // width: 280, // Store raw numbers in data if preferred for persistence
        // height: 200
      },
      style: { width: '280px', height: '200px' }, // Vue Flow uses style for rendering dimensions
      // label: 'My First Note'
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

  // Generic data update for any node
  function updateNodeData(nodeId: string, newData: Partial<any>) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      node.data = { ...node.data, ...newData };
      console.log(`Updated data for node ${nodeId}:`, JSON.parse(JSON.stringify(node.data)));
    } else {
      console.error(`Node with id ${nodeId} not found for data update.`);
    }
  }

  function updateNodeDimensions(nodeId: string, width: number, height: number) {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      const nodeToUpdate = nodes.value[nodeIndex];

      // Create a new style object to help ensure reactivity
      const newStyle = {
        ...nodeToUpdate.style, // Spread existing styles to preserve any other style properties
        width: `${width}px`,
        height: `${height}px`,
      };

      // Update the node in the array by creating a new node object with the new style.
      // This often helps trigger reactivity more reliably in lists.
      nodes.value[nodeIndex] = {
        ...nodeToUpdate, // Spread all existing properties of the node
        style: newStyle,   // Assign the new style object
        // data: { // If you also store width/height in data, update it here
        //   ...nodeToUpdate.data,
        //   width: width,
        //   height: height,
        // }
      };

      // Alternative: Just update the style property reference if the above is too much
      // nodeToUpdate.style = newStyle;
      // Vue.set(nodes.value, nodeIndex, nodeToUpdate); // For Vue 2 style reactivity if needed, but usually not for Vue 3 with ref arrays.

      console.log(`Updated dimensions for node ${nodeId}: ${width}x${height} (store updated with new style object)`);
    } else {
      console.error(`Node with id ${nodeId} not found for dimension update.`);
    }
  }


  return {
    hostUrl,
    nodes,
    edges,
    updateHostUrl,
    updateNodeScenarioId,
    updateNodeData,
    updateNodeDimensions,
  }
})