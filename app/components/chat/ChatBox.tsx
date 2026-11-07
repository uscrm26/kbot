import { useStore } from '@nanostores/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { t } from '~/lib/i18n';
import { APIKeyManager } from './APIKeyManager';
import { AttachmentMenu } from './AttachmentMenu';
import styles from './BaseChat.module.scss';
import FilePreview from './FilePreview';
import { McpTools } from './MCPTools';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { SendButton } from './SendButton.client';
import { SupabaseConnection } from './SupabaseConnection';
import { ToolAccessMenu } from './ToolAccessMenu';
import { ModelSelector } from '~/components/chat/ModelSelector';
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import {
  getTabs,
  getPurposeOptions,
  getPurposeTemplate,
  getShopPrompt,
  getModeMeta,
  type TabId,
  type PurposeId,
  type BuildMode,
} from '~/lib/we0-prompts';
import { ColorSchemeDialog } from '~/components/ui/ColorSchemeDialog';
import { IconButton } from '~/components/ui/IconButton';
import { ExpoQrModal } from '~/components/workbench/ExpoQrModal';
import type { ElementInfo } from '~/components/workbench/Inspector';
import { isGitHubConnected } from '~/lib/stores/githubConnection';
import { isGitLabConnected } from '~/lib/stores/gitlabConnection';
import { useMCPStore, type ConnectorId } from '~/lib/stores/mcp';
import { netlifyConnection } from '~/lib/stores/netlify';
import { LOCAL_PROVIDERS } from '~/lib/stores/settings';
import { supabaseConnection } from '~/lib/stores/supabase';
import { vercelConnection } from '~/lib/stores/vercel';
import type { DesignScheme } from '~/types/design-scheme';
import type { ProviderInfo } from '~/types/model';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';

interface ChatBoxProps {
  isModelSettingsCollapsed: boolean;
  setIsModelSettingsCollapsed: (collapsed: boolean) => void;
  provider: any;
  providerList: any[];
  modelList: any[];
  apiKeys: Record<string, string>;
  isModelLoading: string | undefined;
  onApiKeysChange: (providerName: string, apiKey: string) => void;
  uploadedFiles: File[];
  imageDataList: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null> | undefined;
  input: string;
  handlePaste: (e: React.ClipboardEvent) => void;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  isStreaming: boolean;
  handleSendMessage: (event: React.UIEvent, messageInput?: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  chatStarted: boolean;
  exportChat?: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  handleFileUpload: () => void;
  setProvider?: ((provider: ProviderInfo) => void) | undefined;
  model?: string | undefined;
  setModel?: ((model: string) => void) | undefined;
  setUploadedFiles?: ((files: File[]) => void) | undefined;
  setImageDataList?: ((dataList: string[]) => void) | undefined;
  handleInputChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  handleStop?: (() => void) | undefined;
  enhancingPrompt?: boolean | undefined;
  enhancePrompt?: (() => void) | undefined;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  agentMode?: boolean;
  setAgentMode?: (enabled: boolean) => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: ((element: ElementInfo | null) => void) | undefined;
  engineSelector?: React.ReactNode;
  onApplyPrompt?: (text: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = (props) => {
  const [isMcpToolsOpen, setIsMcpToolsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabId>('create');
  const [activePurpose, setActivePurpose] = React.useState<PurposeId | null>(null);
  const [buildMode, setBuildMode] = React.useState<BuildMode>('speed');
  const [modeOpen, setModeOpen] = React.useState(false);
  const [hoveredMode, setHoveredMode] = React.useState<BuildMode | null>(null);
  const purposeOptions = getPurposeOptions();
  const tabs = getTabs();
  const mcpToolsInitialized = useMCPStore((state) => state.isInitialized);
  const mcpSettings = useMCPStore((state) => state.settings);
  const setWebSearchEnabled = useMCPStore((state) => state.setWebSearchEnabled);
  const setConnectorEnabled = useMCPStore((state) => state.setConnectorEnabled);
  const serverTools = useMCPStore((state) => state.serverTools);
  const supabaseConnectionState = useStore(supabaseConnection);
  const supabaseConnected = !!supabaseConnectionState.isConnected;
  const githubConnected = useStore(isGitHubConnected);
  const gitlabConnected = useStore(isGitLabConnected);
  const vercelConnected = !!useStore(vercelConnection).user;
  const netlifyConnected = !!useStore(netlifyConnection).user;
  const browserUseCloudAvailable = serverTools['browser-use-cloud']?.status === 'available';

  const connectors = (
    [
      { id: 'github', name: 'GitHub', icon: <div className="i-ph:github-logo text-lg" />, available: githubConnected },
      {
        id: 'gitlab',
        name: 'GitLab',
        icon: <div className="i-ph:gitlab-logo text-lg" />,
        available: gitlabConnected,
      },
      {
        id: 'vercel',
        name: 'Vercel',
        icon: <div className="i-ph:triangle text-lg" />,
        available: vercelConnected,
      },
      {
        id: 'netlify',
        name: 'Netlify',
        icon: <div className="i-ph:cloud text-lg" />,
        available: netlifyConnected,
      },
      {
        id: 'supabase',
        name: 'Supabase',
        icon: <img className="w-4 h-4" height="16" width="16" src="https://cdn.simpleicons.org/supabase" alt="" />,
        available: supabaseConnected,
      },
      {
        id: 'browserUseCloud',
        name: 'Browser Use Cloud',
        icon: <div className="i-ph:browser text-lg" />,
        available: browserUseCloudAvailable,
      },
    ] as { id: ConnectorId; name: string; icon: React.ReactNode; available: boolean }[]
  )
    .filter((connector) => connector.available)
    .map(({ available: _available, ...connector }) => ({
      ...connector,
      enabled: mcpSettings.connectorEnabled[connector.id],
    }));

  React.useEffect(() => {
    const availability: Record<ConnectorId, boolean> = {
      github: githubConnected,
      gitlab: gitlabConnected,
      vercel: vercelConnected,
      netlify: netlifyConnected,
      supabase: supabaseConnected,
      browserUseCloud: browserUseCloudAvailable,
    };

    for (const [connector, available] of Object.entries(availability) as [ConnectorId, boolean][]) {
      if (!available && mcpSettings.connectorEnabled[connector]) {
        setConnectorEnabled(connector, false);
      }
    }
  }, [
    githubConnected,
    gitlabConnected,
    vercelConnected,
    netlifyConnected,
    browserUseCloudAvailable,
    mcpSettings.connectorEnabled.github,
    mcpSettings.connectorEnabled,
    setConnectorEnabled,
    supabaseConnected,
  ]);

  const applyPrompt = (text: string) => {
    props.onApplyPrompt?.(text);
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);

    if (tab === 'shop') {
      applyPrompt(getShopPrompt());
    }
  };

  const handlePurposeClick = (id: PurposeId) => {
    setActivePurpose((prev) => (prev === id ? null : id));
    applyPrompt(getPurposeTemplate(id));
  };

  return (
    <div
      className={classNames(
        'relative bg-white/70 backdrop-blur-xl p-3 rounded-2xl border border-white/60 shadow-[0_8px_40px_rgba(37,87,235,0.10)] relative w-full max-w-chat mx-auto z-prompt',

        /*
         * {
         *   'sticky bottom-2': chatStarted,
         * },
         */
      )}
    >
      <svg className={classNames(styles.PromptEffectContainer)}>
        <defs>
          <linearGradient
            id="line-gradient"
            x1="20%"
            y1="0%"
            x2="-14%"
            y2="10%"
            gradientUnits="userSpaceOnUse"
            gradientTransform="rotate(-45)"
          >
            <stop offset="0%" stopColor="#b44aff" stopOpacity="0%"></stop>
            <stop offset="40%" stopColor="#b44aff" stopOpacity="80%"></stop>
            <stop offset="50%" stopColor="#b44aff" stopOpacity="80%"></stop>
            <stop offset="100%" stopColor="#b44aff" stopOpacity="0%"></stop>
          </linearGradient>
          <linearGradient id="shine-gradient">
            <stop offset="0%" stopColor="white" stopOpacity="0%"></stop>
            <stop offset="40%" stopColor="#ffffff" stopOpacity="80%"></stop>
            <stop offset="50%" stopColor="#ffffff" stopOpacity="80%"></stop>
            <stop offset="100%" stopColor="white" stopOpacity="0%"></stop>
          </linearGradient>
        </defs>
        <rect className={classNames(styles.PromptEffectLine)} pathLength="100" strokeLinecap="round"></rect>
        <rect className={classNames(styles.PromptShine)} x="48" y="24" width="70" height="1"></rect>
      </svg>
      <div>
        <ClientOnly>
          {() => (
            <div className={classNames(props.isModelSettingsCollapsed && 'hidden', !props.chatStarted && 'hidden')}>
              <ModelSelector
                key={props.provider?.name}
                model={props.model}
                setModel={props.setModel}
                modelList={props.modelList}
                provider={props.provider}
                setProvider={props.setProvider}
                providerList={props.providerList || (PROVIDER_LIST as ProviderInfo[])}
                apiKeys={props.apiKeys}
                modelLoading={props.isModelLoading}
              />
              {(props.providerList || []).length > 0 &&
                props.provider &&
                !LOCAL_PROVIDERS.includes(props.provider.name) && (
                  <APIKeyManager
                    provider={props.provider}
                    apiKey={props.apiKeys[props.provider.name] || ''}
                    setApiKey={(key) => {
                      props.onApiKeysChange(props.provider.name, key);
                    }}
                  />
                )}
            </div>
          )}
        </ClientOnly>
      </div>
      <FilePreview
        files={props.uploadedFiles}
        imageDataList={props.imageDataList}
        onRemove={(index) => {
          props.setUploadedFiles?.(props.uploadedFiles.filter((_, i) => i !== index));
          props.setImageDataList?.(props.imageDataList.filter((_, i) => i !== index));
        }}
      />
      <ClientOnly>
        {() => (
          <ScreenshotStateManager
            setUploadedFiles={props.setUploadedFiles}
            setImageDataList={props.setImageDataList}
            uploadedFiles={props.uploadedFiles}
            imageDataList={props.imageDataList}
          />
        )}
      </ClientOnly>
      {props.selectedElement && (
        <div className="flex mx-1.5 gap-2 items-center justify-between rounded-lg rounded-b-none border border-b-none border-bolt-elements-borderColor text-bolt-elements-textPrimary flex py-1 px-2.5 font-medium text-xs">
          <div className="flex gap-2 items-center lowercase">
            <code className="bg-accent-500 rounded-4px px-1.5 py-1 mr-0.5 text-white">
              {props?.selectedElement?.tagName}
            </code>
            selected for inspection
          </div>
          <button
            className="bg-transparent text-accent-500 pointer-auto"
            onClick={() => props.setSelectedElement?.(null)}
          >
            Clear
          </button>
        </div>
      )}
      <div
        className={classNames('relative shadow-xs border border-bolt-elements-borderColor backdrop-blur rounded-lg')}
      >
        {!props.chatStarted && (
          <div className="flex items-center gap-1 px-2 pt-2 border-b border-bolt-elements-borderColor flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={classNames(
                  'px-3 py-2 text-sm rounded-md transition-colors',
                  activeTab === tab.id
                    ? 'text-accent-600 bg-accent-500/10 font-medium'
                    : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <textarea
          ref={props.textareaRef}
          className={classNames(
            'w-full pl-4 pt-4 pr-16 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm',
            'transition-all duration-200',
            'hover:border-bolt-elements-focus',
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #1488fc';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid #1488fc';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid var(--bolt-elements-borderColor)';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid var(--bolt-elements-borderColor)';

            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                  const base64Image = e.target?.result as string;
                  props.setUploadedFiles?.([...props.uploadedFiles, file]);
                  props.setImageDataList?.([...props.imageDataList, base64Image]);
                };
                reader.readAsDataURL(file);
              }
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (event.shiftKey) {
                return;
              }

              event.preventDefault();

              if (props.isStreaming) {
                props.handleStop?.();
                return;
              }

              // ignore if using input method engine
              if (event.nativeEvent.isComposing) {
                return;
              }

              props.handleSendMessage?.(event);
            }
          }}
          value={props.input}
          onChange={(event) => {
            props.handleInputChange?.(event);
          }}
          onPaste={props.handlePaste}
          style={{
            minHeight: props.TEXTAREA_MIN_HEIGHT,
            maxHeight: props.TEXTAREA_MAX_HEIGHT,
          }}
          placeholder={props.chatMode === 'build' ? t('chat.placeholder') : t('chat.placeholder.discuss')}
          translate="no"
        />
        <ClientOnly>
          {() => (
            <SendButton
              show={props.input.length > 0 || props.isStreaming || props.uploadedFiles.length > 0}
              isStreaming={props.isStreaming}
              disabled={!props.providerList || props.providerList.length === 0}
              onClick={(event) => {
                if (props.isStreaming) {
                  props.handleStop?.();
                  return;
                }

                if (props.input.length > 0 || props.uploadedFiles.length > 0) {
                  props.handleSendMessage?.(event);
                }
              }}
            />
          )}
        </ClientOnly>
        {!props.chatStarted && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 items-center">
            <button
              type="button"
              onClick={() => props.enhancePrompt?.()}
              title="意圖識別"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:text-accent-600 hover:border-accent-600 transition-colors"
            >
              <div className="i-ph:sparkles text-base" />
              <span>意圖識別</span>
            </button>
            {purposeOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePurposeClick(p.id)}
                title={p.subtitle}
                className={classNames(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors',
                  activePurpose === p.id
                    ? 'border-accent-600 text-accent-600 bg-accent-500/10'
                    : 'border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive',
                )}
              >
                <div className={`${p.icon} text-base`} />
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center text-sm p-4 pt-2">
          <div className="flex gap-1 items-center">
            <ClientOnly>
              {() => (
                <AttachmentMenu
                  onAttachFile={() => props.handleFileUpload()} // Opens image file picker (image/* only)
                  onOpenDesignDialog={() => {
                    /*
                     * Trigger the design dialog by programmatically clicking the hidden button
                     * This is a workaround since ColorSchemeDialog manages its own state
                     */
                    const designButton = document.querySelector('[title="Design Palette"]') as HTMLButtonElement;
                    designButton?.click();
                  }}
                  onEnhancePrompt={() => {
                    props.enhancePrompt?.();
                  }}
                  connectors={connectors}
                  onConnectorEnabledChange={setConnectorEnabled}
                  onOpenMcpTools={() => setIsMcpToolsOpen(true)}
                  mcpToolsInitialized={mcpToolsInitialized}
                  webSearchEnabled={mcpSettings.webSearchEnabled}
                  onWebSearchEnabledChange={setWebSearchEnabled}
                  enhancingPrompt={props.enhancingPrompt}
                  isEnhanceDisabled={props.input.length === 0 || props.enhancingPrompt}
                />
              )}
            </ClientOnly>
            <ClientOnly>{() => <ToolAccessMenu />}</ClientOnly>
            {/* Hidden components for programmatic access from menu */}
            <div className="hidden">
              <ColorSchemeDialog designScheme={props.designScheme} setDesignScheme={props.setDesignScheme} />
              <SupabaseConnection />
            </div>
            <McpTools open={isMcpToolsOpen} onOpenChange={setIsMcpToolsOpen} />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  title={props.chatMode === 'discuss' ? t('mode.discuss.title') : t('mode.agent.title')}
                  className={classNames(
                    'transition-all flex items-center gap-1 rounded-md px-1.5 py-1 text-xs',
                    props.chatMode === 'discuss'
                      ? 'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent'
                      : props.agentMode
                        ? 'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent'
                        : 'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault hover:bg-bolt-elements-item-backgroundActive',
                  )}
                >
                  {props.chatMode === 'discuss' ? (
                    <>
                      <div className="i-ph:chats text-lg" />
                      <span>{t('mode.discuss')}</span>
                    </>
                  ) : (
                    <>
                      <div className="i-ph:robot text-lg" />
                      <span>{t('mode.agent')}</span>
                    </>
                  )}
                  <div className="i-ph:caret-down text-sm" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className={classNames(
                    'min-w-[160px] rounded-lg p-1',
                    'bg-bolt-elements-background-depth-2',
                    'border border-bolt-elements-borderColor',
                    'shadow-lg',
                    'z-50',
                  )}
                  sideOffset={5}
                  align="start"
                >
                  <DropdownMenu.Item
                    className={classNames(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer',
                      'text-bolt-elements-textPrimary',
                      'hover:bg-bolt-elements-item-backgroundActive',
                      'focus:outline-none',
                      props.chatMode === 'build' && props.agentMode && 'bg-bolt-elements-item-backgroundAccent',
                    )}
                    onSelect={() => {
                      props.setChatMode?.('build');
                      props.setAgentMode?.(true);
                    }}
                  >
                    <div className="i-ph:robot text-lg" />
                    <div className="flex flex-col">
                      <span>{t('mode.agent')}</span>
                      <span className="text-xs text-bolt-elements-textSecondary">{t('mode.agent.desc')}</span>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className={classNames(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer',
                      'text-bolt-elements-textPrimary',
                      'hover:bg-bolt-elements-item-backgroundActive',
                      'focus:outline-none',
                      props.chatMode === 'discuss' && 'bg-bolt-elements-item-backgroundAccent',
                    )}
                    onSelect={() => {
                      props.setChatMode?.('discuss');
                      props.setAgentMode?.(false);
                    }}
                  >
                    <div className="i-ph:chats text-lg" />
                    <div className="flex flex-col">
                      <span>{t('mode.discuss')}</span>
                      <span className="text-xs text-bolt-elements-textSecondary">{t('mode.discuss.desc')}</span>
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            {!props.chatStarted && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModeOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-colors"
                >
                  <div className="i-ph:lightning text-base" />
                  <span>{getModeMeta(buildMode).title}</span>
                  <div className="i-ph:caret-down text-sm" />
                </button>
                {modeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => {
                        setModeOpen(false);
                        setHoveredMode(null);
                      }}
                    />
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <div className="relative">
                        {(() => {
                          const shownMode = hoveredMode ?? buildMode;
                          return (
                            <div className="absolute bottom-full left-0 mb-2 w-[340px] max-w-[80vw]">
                              <div className="relative rounded-xl bg-[#255BEB] px-3.5 py-2.5 text-xs leading-relaxed text-white shadow-xl">
                                {getModeMeta(shownMode).tooltip}
                                <div className="absolute left-6 top-full -mt-1 h-2.5 w-2.5 rotate-45 bg-[#255BEB]" />
                              </div>
                            </div>
                          );
                        })()}
                        <div className="w-[280px] rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-1 shadow-xl">
                          {(['speed', 'design'] as BuildMode[]).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setBuildMode(m);
                                setModeOpen(false);
                                setHoveredMode(null);
                              }}
                              onMouseEnter={() => setHoveredMode(m)}
                              onMouseLeave={() => setHoveredMode(null)}
                              className={classNames(
                                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors',
                                buildMode === m
                                  ? 'bg-bolt-elements-item-backgroundAccent'
                                  : 'hover:bg-bolt-elements-item-backgroundActive',
                              )}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-medium text-bolt-elements-textPrimary">
                                  {getModeMeta(m).title}
                                </span>
                                <span className="text-[11px] text-bolt-elements-textSecondary">
                                  {getModeMeta(m).shortDesc}
                                </span>
                              </div>
                              {buildMode === m && (
                                <div className="h-2 w-2 shrink-0 rounded-full bg-bolt-elements-textPrimary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {props.engineSelector}
            <SpeechRecognitionButton
              isListening={props.isListening}
              onStart={props.startListening}
              onStop={props.stopListening}
              disabled={props.isStreaming}
            />
            <IconButton
              title="Model Settings"
              className={classNames('transition-all flex items-center gap-1', {
                'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent':
                  props.isModelSettingsCollapsed,
                'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault':
                  !props.isModelSettingsCollapsed,
              })}
              onClick={() => props.setIsModelSettingsCollapsed(!props.isModelSettingsCollapsed)}
              disabled={!props.providerList || props.providerList.length === 0}
            >
              <div className={`i-ph:caret-${props.isModelSettingsCollapsed ? 'right' : 'down'} text-lg`} />
              {props.isModelSettingsCollapsed ? (
                <span className="text-xs" title={props.model}>
                  {props.model && props.model.length > 25 ? `${props.model.slice(0, 22)}...` : props.model}
                </span>
              ) : (
                <span />
              )}
            </IconButton>
          </div>
          <ExpoQrModal open={props.qrModalOpen} onClose={() => props.setQrModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};
