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
      },
      style: { width: '280px', height: '200px' }, // Initial dimensions
      // label: 'My First Note' // Optional: for display in devtools or if you add a header
    },
  ])
  const edges = ref<Edge[]>([
    {
      id: 'e-scn1-scn2',
      source: 'scn-1',
      target: 'scn-2',
      label: '', // No label on connections anymore
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

  // Specific for MarkdownNode content, or use generic updateNodeData
  // function updateNodeMarkdownContent(nodeId: string, markdownContent: string) {
  //   const node = nodes.value.find(n => n.id === nodeId);
  //   if (node && node.type === 'markdownNode') {
  //     if (!node.data) node.data = {};
  //     node.data.markdownContent = markdownContent;
  //   }
  // }

  function updateNodeDimensions(nodeId: string, width: number, height: number) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      // Ensure style object exists
      if (!node.style) node.style = {};
      node.style.width = `${width}px`;
      node.style.height = `${height}px`;
      // Optionally, store raw numbers in data if needed for persistence or logic,
      // but Vue Flow primarily uses node.style for rendering dimensions.
      // if (!node.data) node.data = {};
      // node.data.width = width;
      // node.data.height = height;
      console.log(`Updated dimensions for node ${nodeId}: ${width}x${height}`);
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
    updateNodeData, // Export generic updater
    // updateNodeMarkdownContent,
    updateNodeDimensions,
  }
})