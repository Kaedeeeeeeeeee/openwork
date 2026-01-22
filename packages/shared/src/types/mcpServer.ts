/**
 * MCP Server Configuration Types
 * 
 * Defines the structure for user-configurable MCP servers.
 */

/**
 * Environment variable configuration for MCP server
 */
export interface McpEnvVar {
    key: string;
    value: string;
    /** Whether the value should be stored securely (like API keys) */
    isSecret?: boolean;
}

/**
 * MCP Server configuration
 */
export interface McpServerConfig {
    /** Unique identifier for this server */
    id: string;
    /** Display name for the server */
    name: string;
    /** Optional description */
    description?: string;
    /** Server type: local (spawns process) or remote (connects via URL) */
    type: 'local' | 'remote';
    /** Command to run for local servers (e.g., ['npx', '-y', '@notionhq/notion-mcp-server']) */
    command?: string[];
    /** URL for remote servers */
    url?: string;
    /** Whether the server is enabled */
    enabled: boolean;
    /** Environment variables to pass to the server */
    environment?: McpEnvVar[];
    /** Timeout in milliseconds (default: 10000) */
    timeout?: number;
    /** Icon/emoji for display */
    icon?: string;
    /** Template ID if created from a preset */
    templateId?: string;
}

/**
 * Preset MCP server templates for common services
 */
export interface McpServerTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    /** NPM package or command */
    npmPackage: string;
    /** Required environment variables */
    requiredEnvVars: {
        key: string;
        label: string;
        placeholder?: string;
        helpUrl?: string;
        isSecret: boolean;
    }[];
    /** Optional environment variables */
    optionalEnvVars?: {
        key: string;
        label: string;
        placeholder?: string;
        defaultValue?: string;
        isSecret: boolean;
    }[];
}

/**
 * MCP servers store schema
 */
export interface McpServersStore {
    /** User-configured MCP servers */
    servers: McpServerConfig[];
    /** Version for migration purposes */
    version: number;
}

/**
 * Preset templates for popular MCP servers
 */
export const MCP_SERVER_TEMPLATES: McpServerTemplate[] = [
    {
        id: 'notion',
        name: 'Notion',
        description: 'Read and write Notion pages and databases',
        icon: '📝',
        npmPackage: '@notionhq/notion-mcp-server',
        requiredEnvVars: [
            {
                key: 'NOTION_TOKEN',
                label: 'Notion Integration Token',
                placeholder: 'ntn_xxx...',
                helpUrl: 'https://www.notion.so/my-integrations',
                isSecret: true,
            },
        ],
    },
    {
        id: 'github',
        name: 'GitHub',
        description: 'Manage repositories, issues, and pull requests',
        icon: '🐙',
        npmPackage: '@modelcontextprotocol/server-github',
        requiredEnvVars: [
            {
                key: 'GITHUB_PERSONAL_ACCESS_TOKEN',
                label: 'GitHub Personal Access Token',
                placeholder: 'ghp_xxx...',
                helpUrl: 'https://github.com/settings/tokens',
                isSecret: true,
            },
        ],
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Send messages and manage Slack channels',
        icon: '💬',
        npmPackage: '@modelcontextprotocol/server-slack',
        requiredEnvVars: [
            {
                key: 'SLACK_BOT_TOKEN',
                label: 'Slack Bot Token',
                placeholder: 'xoxb-xxx...',
                helpUrl: 'https://api.slack.com/apps',
                isSecret: true,
            },
        ],
    },
    {
        id: 'google-drive',
        name: 'Google Drive',
        description: 'Access and manage Google Drive files',
        icon: '📁',
        npmPackage: '@anthropic/google-drive-mcp',
        requiredEnvVars: [
            {
                key: 'GOOGLE_CREDENTIALS_PATH',
                label: 'Google Credentials JSON Path',
                placeholder: '/path/to/credentials.json',
                helpUrl: 'https://console.cloud.google.com/apis/credentials',
                isSecret: false,
            },
        ],
    },
    {
        id: 'filesystem',
        name: 'Filesystem',
        description: 'Read and write local files (with restrictions)',
        icon: '📂',
        npmPackage: '@modelcontextprotocol/server-filesystem',
        requiredEnvVars: [],
        optionalEnvVars: [
            {
                key: 'ALLOWED_DIRECTORIES',
                label: 'Allowed Directories (comma-separated)',
                placeholder: '/Users/me/Documents,/Users/me/Projects',
                isSecret: false,
            },
        ],
    },
    {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Query PostgreSQL databases',
        icon: '🐘',
        npmPackage: '@modelcontextprotocol/server-postgres',
        requiredEnvVars: [
            {
                key: 'POSTGRES_CONNECTION_STRING',
                label: 'PostgreSQL Connection String',
                placeholder: 'postgresql://user:pass@localhost:5432/db',
                isSecret: true,
            },
        ],
    },
    {
        id: 'sqlite',
        name: 'SQLite',
        description: 'Query SQLite databases',
        icon: '🗃️',
        npmPackage: '@modelcontextprotocol/server-sqlite',
        requiredEnvVars: [
            {
                key: 'SQLITE_PATH',
                label: 'SQLite Database Path',
                placeholder: '/path/to/database.db',
                isSecret: false,
            },
        ],
    },
    {
        id: 'brave-search',
        name: 'Brave Search',
        description: 'Web search using Brave Search API',
        icon: '🔍',
        npmPackage: '@modelcontextprotocol/server-brave-search',
        requiredEnvVars: [
            {
                key: 'BRAVE_API_KEY',
                label: 'Brave Search API Key',
                placeholder: 'BSA...',
                helpUrl: 'https://brave.com/search/api/',
                isSecret: true,
            },
        ],
    },
];
