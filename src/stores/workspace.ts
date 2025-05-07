// src/stores/workspace.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'

export const useWorkspaceStore = defineStore('workspace', () => {
  const hostUrl = ref<string>(localStorage.getItem('scenario-host') || 'http://localhost:8080')
  const nodes = ref<Node[]>([
    {
      id: '1',
      type: 'scenarioCard', // Ensure this is the custom type
      position: { x: 50, y: 50 },
      data: { scenarioId: 1 },
      // label: 'Scenario 1' // Optional: label can be derived in custom node
    },
    {
      id: '2',
      type: 'scenarioCard', // Ensure this is the custom type
      position: { x: 450, y: 150 },
      data: { scenarioId: 2 },
      // label: 'Scenario 2'
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

  // Placeholder for future actions
  // function addNode(node: Node) {
  //   nodes.value.push(node)
  // }
  // function addEdge(edge: Edge) {
  //   edges.value.push(edge)
  // }

  return {
    hostUrl,
    nodes,
    edges,
    updateHostUrl,
    // addNode,
    // addEdge
  }
})