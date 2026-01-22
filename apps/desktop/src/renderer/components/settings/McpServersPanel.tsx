'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAccomplish } from '@/lib/accomplish';
import type { McpServerConfig, McpServerTemplate, McpEnvVar } from '@accomplish/shared';
import { MCP_SERVER_TEMPLATES } from '@accomplish/shared';

interface McpServersPanelProps {
    onClose?: () => void;
}

export function McpServersPanel({ onClose }: McpServersPanelProps) {
    const [servers, setServers] = useState<McpServerConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingServer, setEditingServer] = useState<McpServerConfig | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<McpServerTemplate | null>(null);

    const accomplish = getAccomplish();

    const loadServers = useCallback(async () => {
        try {
            const list = await accomplish.listMcpServers();
            setServers(list as McpServerConfig[]);
        } catch (err) {
            console.error('Failed to load MCP servers:', err);
        } finally {
            setLoading(false);
        }
    }, [accomplish]);

    useEffect(() => {
        loadServers();
    }, [loadServers]);

    const handleToggle = async (id: string, enabled: boolean) => {
        await accomplish.toggleMcpServer(id, enabled);
        setServers(servers.map(s => s.id === id ? { ...s, enabled } : s));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this MCP server?')) return;
        await accomplish.removeMcpServer(id);
        setServers(servers.filter(s => s.id !== id));
    };

    const handleTemplateSelect = (template: McpServerTemplate) => {
        setSelectedTemplate(template);
        setShowAddModal(true);
    };

    const handleAddCustom = () => {
        setSelectedTemplate(null);
        setShowAddModal(true);
    };

    const handleSaveServer = async (server: McpServerConfig) => {
        if (editingServer) {
            await accomplish.updateMcpServer(server.id, server);
        } else {
            await accomplish.addMcpServer(server);
        }
        await loadServers();
        setShowAddModal(false);
        setEditingServer(null);
        setSelectedTemplate(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">MCP Servers</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add MCP servers to extend AI capabilities with external tools
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Preset Templates */}
            <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Quick Add</h4>
                <div className="grid grid-cols-4 gap-2">
                    {MCP_SERVER_TEMPLATES.slice(0, 8).map((template) => (
                        <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <span className="text-2xl">{template.icon}</span>
                            <span className="text-xs font-medium text-foreground">{template.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Configured Servers */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-foreground">Configured Servers</h4>
                    <button
                        onClick={handleAddCustom}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                        + Add Custom
                    </button>
                </div>

                {servers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No MCP servers configured yet.</p>
                        <p className="text-sm mt-1">Click a template above or add a custom server.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {servers.map((server) => (
                            <div
                                key={server.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{server.icon || '🔧'}</span>
                                    <div>
                                        <div className="font-medium text-foreground">{server.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {server.description || (server.command ? server.command.join(' ') : server.url)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Toggle */}
                                    <button
                                        onClick={() => handleToggle(server.id, !server.enabled)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${server.enabled ? 'bg-primary' : 'bg-muted'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${server.enabled ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    {/* Edit */}
                                    <button
                                        onClick={() => {
                                            setEditingServer(server);
                                            setShowAddModal(true);
                                        }}
                                        className="p-1 text-muted-foreground hover:text-foreground"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(server.id)}
                                        className="p-1 text-muted-foreground hover:text-destructive"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <McpServerModal
                        template={selectedTemplate}
                        editingServer={editingServer}
                        onSave={handleSaveServer}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingServer(null);
                            setSelectedTemplate(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

interface McpServerModalProps {
    template: McpServerTemplate | null;
    editingServer: McpServerConfig | null;
    onSave: (server: McpServerConfig) => Promise<void>;
    onClose: () => void;
}

function McpServerModal({ template, editingServer, onSave, onClose }: McpServerModalProps) {
    const [name, setName] = useState(editingServer?.name || template?.name || '');
    const [description, setDescription] = useState(editingServer?.description || template?.description || '');
    const [command, setCommand] = useState(
        editingServer?.command?.join(' ') ||
        (template ? `npx -y ${template.npmPackage}` : '')
    );
    const [envVars, setEnvVars] = useState<McpEnvVar[]>(
        editingServer?.environment ||
        template?.requiredEnvVars.map(v => ({ key: v.key, value: '', isSecret: v.isSecret })) ||
        []
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const server: McpServerConfig = {
                id: editingServer?.id || `mcp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                name,
                description,
                type: 'local',
                command: command.split(' ').filter(Boolean),
                enabled: editingServer?.enabled ?? true,
                environment: envVars.filter(v => v.value),
                icon: template?.icon || editingServer?.icon || '🔧',
                templateId: template?.id,
                timeout: 30000,
            };
            await onSave(server);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save server');
        } finally {
            setSaving(false);
        }
    };

    const updateEnvVar = (index: number, value: string) => {
        setEnvVars(envVars.map((v, i) => i === index ? { ...v, value } : v));
    };

    const addEnvVar = () => {
        setEnvVars([...envVars, { key: '', value: '', isSecret: false }]);
    };

    const removeEnvVar = (index: number) => {
        setEnvVars(envVars.filter((_, i) => i !== index));
    };

    const updateEnvVarKey = (index: number, key: string) => {
        setEnvVars(envVars.map((v, i) => i === index ? { ...v, key } : v));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-xl border border-border shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            {editingServer ? 'Edit MCP Server' : template ? `Add ${template.name}` : 'Add Custom Server'}
                        </h3>
                        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="My MCP Server"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="What this server does..."
                        />
                    </div>

                    {/* Command */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Command</label>
                        <input
                            type="text"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="npx -y @example/mcp-server"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            The command to run the MCP server
                        </p>
                    </div>

                    {/* Environment Variables */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-foreground">Environment Variables</label>
                            <button
                                type="button"
                                onClick={addEnvVar}
                                className="text-xs text-primary hover:text-primary/80"
                            >
                                + Add Variable
                            </button>
                        </div>
                        <div className="space-y-2">
                            {envVars.map((envVar, index) => {
                                const templateVar = template?.requiredEnvVars.find(v => v.key === envVar.key);
                                return (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={envVar.key}
                                            onChange={(e) => updateEnvVarKey(index, e.target.value)}
                                            placeholder="KEY"
                                            className="w-1/3 px-2 py-1.5 rounded border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                            readOnly={!!templateVar}
                                        />
                                        <input
                                            type={envVar.isSecret ? 'password' : 'text'}
                                            value={envVar.value}
                                            onChange={(e) => updateEnvVar(index, e.target.value)}
                                            placeholder={templateVar?.placeholder || 'Value'}
                                            className="flex-1 px-2 py-1.5 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        {templateVar?.helpUrl && (
                                            <a
                                                href={templateVar.helpUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-muted-foreground hover:text-primary"
                                                title="Get API Key"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                        {!templateVar && (
                                            <button
                                                type="button"
                                                onClick={() => removeEnvVar(index)}
                                                className="p-1.5 text-muted-foreground hover:text-destructive"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editingServer ? 'Update' : 'Add Server'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
