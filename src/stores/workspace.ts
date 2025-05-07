// src/stores/workspace.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'

export const useWorkspaceStore = defineStore('workspace', () => {
  const hostUrl = ref<string>(localStorage.getItem('scenario-host') || 'http://localhost:8080')
  const nodes = ref<Node[]>([
    {
      id: '1',
      type: 'scenarioCard',
      position: { x: 100, y: 100 },
      data: { scenarioId: 1 },
    },
    {
      id: '2',
      type: 'scenarioCard',
      position: { x: 500, y: 250 },
      data: { scenarioId: 2 },
    },
  ])
  const edges = ref<Edge[]>([
    { id: 'e1-2', source: '1', target: '2', label: 'Leads to' },
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
    if (node && node.data) {
      console.log(`Updating scenarioId for node ${nodeId} from ${node.data.scenarioId} to ${newScenarioId}`);
      node.data.scenarioId = newScenarioId;
      // Logging the state of the specific node's data after update
      console.log(`Node ${nodeId} data after update:`, JSON.parse(JSON.stringify(node.data)));
      // Logging the whole nodes array to verify the change within the array context
      // console.log('Full nodes array after update:', JSON.parse(JSON.stringify(nodes.value)));
    } else {
      console.error(`Node with id ${nodeId} not found or has no data object.`);
    }
  }

  return {
    hostUrl,
    nodes,
    edges,
    updateHostUrl,
    updateNodeScenarioId,
  }
})