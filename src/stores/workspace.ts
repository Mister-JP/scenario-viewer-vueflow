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
      position: { x: 100, y: 100 }, // Slightly different initial positions
      data: { scenarioId: 1 },
    },
    {
      id: '2',
      type: 'scenarioCard',
      position: { x: 500, y: 250 }, // Spread them out a bit
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

  return {
    hostUrl,
    nodes,
    edges,
    updateHostUrl,
  }
})