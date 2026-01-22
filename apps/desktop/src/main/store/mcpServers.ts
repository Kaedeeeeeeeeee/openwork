import Store from 'electron-store';
import type { McpServerConfig, McpServersStore } from '@accomplish/shared';

/**
 * MCP Servers Store
 * 
 * Stores user-configured MCP servers using electron-store.
 * Secrets (like API keys) are stored separately in secureStorage.
 */

const STORE_VERSION = 1;

const mcpServersStore = new Store<McpServersStore>({
    name: 'mcp-servers',
    defaults: {
        servers: [],
        version: STORE_VERSION,
    },
});

/**
 * Get all MCP servers
 */
export function getMcpServers(): McpServerConfig[] {
    return mcpServersStore.get('servers') || [];
}

/**
 * Get a specific MCP server by ID
 */
export function getMcpServer(id: string): McpServerConfig | null {
    const servers = getMcpServers();
    return servers.find(s => s.id === id) || null;
}

/**
 * Add a new MCP server
 */
export function addMcpServer(server: McpServerConfig): void {
    const servers = getMcpServers();

    // Check for duplicate ID
    if (servers.some(s => s.id === server.id)) {
        throw new Error(`MCP server with ID "${server.id}" already exists`);
    }

    servers.push(server);
    mcpServersStore.set('servers', servers);
}

/**
 * Update an existing MCP server
 */
export function updateMcpServer(id: string, updates: Partial<McpServerConfig>): void {
    const servers = getMcpServers();
    const index = servers.findIndex(s => s.id === id);

    if (index === -1) {
        throw new Error(`MCP server with ID "${id}" not found`);
    }

    servers[index] = { ...servers[index], ...updates };
    mcpServersStore.set('servers', servers);
}

/**
 * Remove an MCP server
 */
export function removeMcpServer(id: string): void {
    const servers = getMcpServers();
    const filtered = servers.filter(s => s.id !== id);
    mcpServersStore.set('servers', filtered);
}

/**
 * Toggle MCP server enabled state
 */
export function toggleMcpServer(id: string, enabled: boolean): void {
    updateMcpServer(id, { enabled });
}

/**
 * Clear all MCP servers (for testing/reset)
 */
export function clearMcpServers(): void {
    mcpServersStore.set('servers', []);
}

/**
 * Get enabled MCP servers only
 */
export function getEnabledMcpServers(): McpServerConfig[] {
    return getMcpServers().filter(s => s.enabled);
}
