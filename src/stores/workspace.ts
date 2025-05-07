// src/stores/workspace.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core' // We'll use these types

export const useWorkspaceStore = defineStore('workspace', () => {
  // State
  const hostUrl = ref<string>(localStorage.getItem('scenario-host') || 'http://localhost:8080')
  const nodes = ref<Node[]>([ // Some initial nodes for testing
    { id: '1', type: 'input', label: 'Scenario 1', position: { x: 50, y: 50 }, data: { scenarioId: 1 } },
    { id: '2', label: 'Scenario 2', position: { x: 250, y: 150 }, data: { scenarioId: 2 } },
  ])
  const edges = ref<Edge[]>([ // An initial edge for testing
    { id: 'e1-2', source: '1', target: '2', label: 'Leads to' },
  ])

  // Actions
  function updateHostUrl(newUrl: string) {
    const trimmedUrl = newUrl.trim()
    if (!trimmedUrl) {
      console.error('updateHostUrl: New URL is empty, not updating.')
      return
    }
    const cleanUrl = trimmedUrl.replace(/\/$/, '') // Remove trailing slash
    hostUrl.value = cleanUrl
    try {
      localStorage.setItem('scenario-host', cleanUrl)
    } catch (e) {
      console.error('Failed to save host URL to localStorage', e)
    }
  }

  // Add more actions here for adding/removing nodes, edges, saving/loading layout, etc.

  return {
    hostUrl,
    nodes,
    edges,
    updateHostUrl,
  }
})