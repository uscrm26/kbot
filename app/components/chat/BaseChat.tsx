import { useStore } from '@nanostores/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { UIMessage } from 'ai';
import Cookies from 'js-cookie';
import React, { lazy, Suspense, type RefCallback, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { getApiKeysFromCookies } from './APIKeyManager';
import styles from './BaseChat.module.scss';
import { t, getSpeechEngine, setSpeechEngine, type SpeechEngine } from '~/lib/i18n';
import { DoubaoASRClient } from '~/lib/doubao-asr';
import ChatAlert from './ChatAlert';
import { ChatBox } from './ChatBox';
import GitCloneButton from './GitCloneButton';
import LlmErrorAlert from './LLMApiAlert';
import { Messages, type DisplayMessage } from './Messages.client';
import ProgressCompilation from './ProgressCompilation';
import StarterTemplates from './StarterTemplates';
import { ToolApprovalTray } from './ToolApprovalTray';
import { ExamplePrompts } from '~/components/chat/ExamplePrompts';
import { SpeechEngineSelector } from '~/components/chat/SpeechEngineSelector';
import { ImportFolderButton } from '~/components/chat/ImportFolderButton';
import { ImportZipButton } from '~/components/chat/ImportZipButton';
import DeployChatAlert from '~/components/deploy/DeployAlert';
import { Menu } from '~/components/sidebar/Menu.client';
import type { ElementInfo } from '~/components/workbench/Inspector';
import { WorkbenchReopenButton } from '~/components/workbench/WorkbenchReopenButton';
import { API_KEYS_UPDATED_EVENT, type ApiKeysUpdatedDetail } from '~/lib/api/apiKeys';

const LazyWorkbench = lazy(() =>
  import('~/components/workbench/Workbench.client').then((m) => ({ default: m.Workbench })),
);
import { StickToBottom, useStickToBottomContext } from '~/lib/hooks';
import type { ModelInfo } from '~/lib/modules/llm/types';
import { expoUrlAtom } from '~/lib/stores/qrCodeStore';
import { workbenchStore } from '~/lib/stores/workbench';
import type { ActionAlert, DeployAlert, LlmErrorAlertType } from '~/types/actions';
import type { ProgressAnnotation } from '~/types/context';
import type { DesignScheme } from '~/types/design-scheme';
import type { ProviderInfo } from '~/types/model';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
  messages?: DisplayMessage[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onApplyPrompt?: (text: string) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: UIMessage[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
  deployAlert?: DeployAlert;
  _clearDeployAlert?: () => void;
  llmErrorAlert?: LlmErrorAlertType;
  clearLlmErrorAlert?: () => void;
  progressAnnotations?: ProgressAnnotation[];
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  agentMode?: boolean;
  setAgentMode?: (enabled: boolean) => void;
  append?: (message: UIMessage) => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: (element: ElementInfo | null) => void;
  addToolOutput?: (options: { tool: string; toolCallId: string; output: unknown }) => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      onStreamingChange,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,
      onApplyPrompt,

      // promptEnhanced,
      enhancePrompt,
      sendMessage,
      handleStop,
      importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
      deployAlert,
      _clearDeployAlert,
      llmErrorAlert,
      clearLlmErrorAlert,
      progressAnnotations: incomingProgressAnnotations,
      chatMode,
      setChatMode,
      agentMode,
      setAgentMode,
      append,
      designScheme,
      setDesignScheme,
      selectedElement,
      setSelectedElement,
      addToolOutput = () => {
        throw new Error('addToolOutput not implemented');
      },
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [apiKeys, setApiKeys] = useState<Record<string, string>>(getApiKeysFromCookies());
    const [modelList, setModelList] = useState<ModelInfo[]>([]);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const doubaoClientRef = React.useRef<DoubaoASRClient | null>(null);
    const [speechEngine, setSpeechEngineState] = useState<SpeechEngine>(getSpeechEngine());
    const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState<string | undefined>('all');

    const expoUrl = useStore(expoUrlAtom);
    const showWorkbench = useStore(workbenchStore.showWorkbench);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    useEffect(() => {
      if (expoUrl) {
        setQrModalOpen(true);
      }
    }, [expoUrl]);

    useEffect(() => {
      console.log(transcript);
    }, [transcript]);

    useEffect(() => {
      onStreamingChange?.(isStreaming);
    }, [isStreaming, onStreamingChange]);

    useEffect(() => {
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }, []);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        let parsedApiKeys: Record<string, string> | undefined = {};

        try {
          parsedApiKeys = getApiKeysFromCookies();
          setApiKeys(parsedApiKeys);
        } catch (error) {
          console.error('Error loading API keys from cookies:', error);
          Cookies.remove('apiKeys');
        }

        setIsModelLoading('all');

        if (!providerList?.length) {
          setModelList([]);
          setIsModelLoading(undefined);

          return;
        }

        const activeProviderNames = providerList.map((activeProvider) => activeProvider.name).join(',');

        fetch(`/api/models?providers=${encodeURIComponent(activeProviderNames)}`)
          .then((response) => response.json())
          .then((data) => {
            const typedData = data as { modelList: ModelInfo[] };
            setModelList(typedData.modelList);
          })
          .catch((error) => {
            console.error('Error fetching model list:', error);
          })
          .finally(() => {
            setIsModelLoading(undefined);
          });
      }
    }, [providerList, provider]);

    const onApiKeysChange = async (providerName: string, apiKey: string) => {
      const newApiKeys = { ...apiKeys, [providerName]: apiKey };
      setApiKeys(newApiKeys);
      Cookies.set('apiKeys', JSON.stringify(newApiKeys));

      setIsModelLoading(providerName);

      let providerModels: ModelInfo[] = [];

      try {
        const response = await fetch(`/api/models/${encodeURIComponent(providerName)}`);
        const data = await response.json();
        providerModels = (data as { modelList: ModelInfo[] }).modelList;
      } catch (error) {
        console.error('Error loading dynamic models for:', providerName, error);
      }

      // Only update models for the specific provider
      setModelList((prevModels) => {
        const otherModels = prevModels.filter((model) => model.provider !== providerName);
        return [...otherModels, ...providerModels];
      });
      setIsModelLoading(undefined);
    };

    useEffect(() => {
      const handleApiKeysUpdated = (event: Event) => {
        const { apiKeys, providerName } = (event as CustomEvent<ApiKeysUpdatedDetail>).detail;
        setApiKeys(apiKeys);
        setIsModelLoading(providerName);

        fetch(`/api/models/${encodeURIComponent(providerName)}`)
          .then((response) => response.json())
          .then((data) => {
            const providerModels = (data as { modelList: ModelInfo[] }).modelList;
            setModelList((currentModels) => [
              ...currentModels.filter((model) => model.provider !== providerName),
              ...providerModels,
            ]);
          })
          .catch((error) => {
            console.error('Error loading dynamic models for:', providerName, error);
          })
          .finally(() => setIsModelLoading(undefined));
      };

      window.addEventListener(API_KEYS_UPDATED_EVENT, handleApiKeysUpdated);

      return () => window.removeEventListener(API_KEYS_UPDATED_EVENT, handleApiKeysUpdated);
    }, []);

    const syncTranscriptToInput = (text: string) => {
      setTranscript(text);
      if (handleInputChange) {
        const syntheticEvent = {
          target: { value: text },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        handleInputChange(syntheticEvent);
      }
    };

    const startDoubaoListening = async () => {
      const client = new DoubaoASRClient({
        onText: (text) => syncTranscriptToInput(text),
        onError: (message) => {
          console.error('Doubao ASR error:', message);
          setIsListening(false);
        },
        onStateChange: (listening) => setIsListening(listening),
      });
      doubaoClientRef.current = client;
      try {
        await client.start();
      } catch {
        doubaoClientRef.current = null;
      }
    };

    const startListening = () => {
      if (speechEngine === 'doubao') {
        void startDoubaoListening();
      } else if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (speechEngine === 'doubao') {
        void doubaoClientRef.current?.stop();
        doubaoClientRef.current = null;
      } else if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

    const changeSpeechEngine = (engine: SpeechEngine) => {
      if (isListening) {
        stopListening();
      }
      setSpeechEngine(engine);
      setSpeechEngineState(engine);
      setIsEngineMenuOpen(false);
    };

    const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
      if (sendMessage) {
        sendMessage(event, messageInput);
        setSelectedElement?.(null);

        if (recognition) {
          recognition.abort(); // Stop current recognition
          setTranscript(''); // Clear transcript
          setIsListening(false);

          // Clear the input by triggering handleInputChange with empty value
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: '' },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        }
      }
    };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const base64Image = e.target?.result as string;
              setUploadedFiles?.([...uploadedFiles, file]);
              setImageDataList?.([...imageDataList, base64Image]);
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };

    const baseChat = (
      <div
        ref={ref}
        className={classNames(styles.BaseChat, 'relative flex h-full w-full overflow-hidden')}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => (!chatStarted ? null : <Menu />)}</ClientOnly>
        {!chatStarted && (
          <>
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,87,235,0.16), transparent 65%),' +
                  'radial-gradient(ellipse 40% 35% at 12% 20%, rgba(6,182,212,0.08), transparent 60%),' +
                  'radial-gradient(ellipse 40% 35% at 88% 25%, rgba(139,92,246,0.08), transparent 60%),' +
                  'radial-gradient(ellipse 50% 30% at 50% 110%, rgba(37,87,235,0.06), transparent 70%),' +
                  'linear-gradient(180deg, rgba(219,232,254,0.30) 0%, rgba(255,255,255,0) 45%)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(37,87,235,0.04) 1px, transparent 1px),' +
                  'linear-gradient(90deg, rgba(37,87,235,0.04) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(ellipse 70% 50% at 50% 20%, black 30%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 20%, black 30%, transparent 75%)',
              }}
            />
          </>
        )}
        {chatStarted && showChat && !showWorkbench && (
          <WorkbenchReopenButton onClick={() => workbenchStore.showWorkbench.set(true)} />
        )}
        <div className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full')}>
            {!chatStarted && (
              <div id="intro" className="mt-[16vh] max-w-4xl mx-auto text-center px-4 lg:px-0 relative">
                <h1 className="text-4xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in leading-tight tracking-tight">
                  {t('onboarding.title')}
                </h1>
                <p className="text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200 tracking-wide">
                  {t('onboarding.subtitle')}
                </p>
              </div>
            )}
            <StickToBottom
              className={classNames('pt-6 px-2 sm:px-6 relative', {
                'h-full flex flex-col modern-scrollbar': chatStarted,
              })}
              resize="smooth"
              initial="smooth"
            >
              <StickToBottom.Content className="flex flex-col gap-4 relative ">
                <ClientOnly>
                  {() => {
                    return chatStarted ? (
                      <Messages
                        className="flex flex-col w-full flex-1 max-w-chat pb-4 mx-auto z-1"
                        messages={messages}
                        isStreaming={isStreaming}
                        append={append}
                        chatMode={chatMode}
                        setChatMode={setChatMode}
                        provider={provider}
                        model={model}
                        addToolResult={addToolOutput}
                      />
                    ) : null;
                  }}
                </ClientOnly>
                <ScrollToBottom />
              </StickToBottom.Content>
              <div
                className={classNames('my-auto flex flex-col gap-2 w-full max-w-chat mx-auto z-prompt mb-6', {
                  'sticky bottom-2': chatStarted,
                })}
              >
                <div className="flex flex-col gap-2">
                  {deployAlert && (
                    <DeployChatAlert
                      alert={deployAlert}
                      clearAlert={() => _clearDeployAlert?.()}
                      postMessage={(message: string | undefined) => {
                        sendMessage?.({} as any, message);
                      }}
                    />
                  )}
                  {actionAlert && (
                    <ChatAlert
                      alert={actionAlert}
                      clearAlert={() => clearAlert?.()}
                      postMessage={(message) => {
                        sendMessage?.({} as any, message);
                        clearAlert?.();
                      }}
                    />
                  )}
                  {llmErrorAlert && <LlmErrorAlert alert={llmErrorAlert} clearAlert={() => clearLlmErrorAlert?.()} />}
                </div>
                <ToolApprovalTray messages={messages} addToolOutput={addToolOutput} />
                {incomingProgressAnnotations && <ProgressCompilation data={incomingProgressAnnotations} />}
                <ChatBox
                  isModelSettingsCollapsed={isModelSettingsCollapsed}
                  setIsModelSettingsCollapsed={setIsModelSettingsCollapsed}
                  provider={provider}
                  setProvider={setProvider}
                  providerList={providerList || (PROVIDER_LIST as ProviderInfo[])}
                  model={model}
                  setModel={setModel}
                  modelList={modelList}
                  apiKeys={apiKeys}
                  isModelLoading={isModelLoading}
                  onApiKeysChange={onApiKeysChange}
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  imageDataList={imageDataList}
                  setImageDataList={setImageDataList}
                  textareaRef={textareaRef}
                  input={input}
                  handleInputChange={handleInputChange}
                  handlePaste={handlePaste}
                  TEXTAREA_MIN_HEIGHT={TEXTAREA_MIN_HEIGHT}
                  TEXTAREA_MAX_HEIGHT={TEXTAREA_MAX_HEIGHT}
                  isStreaming={isStreaming}
                  handleStop={handleStop}
                  handleSendMessage={handleSendMessage}
                  enhancingPrompt={enhancingPrompt}
                  enhancePrompt={enhancePrompt}
                  isListening={isListening}
                  startListening={startListening}
                  stopListening={stopListening}
                  chatStarted={chatStarted}
                  exportChat={exportChat}
                  qrModalOpen={qrModalOpen}
                  setQrModalOpen={setQrModalOpen}
                  handleFileUpload={handleFileUpload}
                  chatMode={chatMode}
                  setChatMode={setChatMode}
                  agentMode={agentMode}
                  setAgentMode={setAgentMode}
                  designScheme={designScheme}
                  setDesignScheme={setDesignScheme}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  engineSelector={
                    <SpeechEngineSelector engine={speechEngine} onChange={changeSpeechEngine} />
                  }
                  onApplyPrompt={onApplyPrompt}
                />
                {!chatStarted && (
                  <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 mt-4 text-xs text-bolt-elements-textSecondary">
                    <span className="flex items-center gap-1.5">
                      <div className="i-ph:check-circle-fill text-accent-600 text-sm" />
                      可免費開始，無需信用卡
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="i-ph:check-circle-fill text-accent-600 text-sm" />
                      生成過程即時預覽
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="i-ph:check-circle-fill text-accent-600 text-sm" />
                      一鍵部署上線
                    </span>
                  </div>
                )}
              </div>
            </StickToBottom>
            <div className="flex flex-col justify-center">
              {!chatStarted && (
                <div className="flex justify-center gap-2">
                  <ImportFolderButton
                    importChat={importChat}
                    className={classNames(
                      'gap-2 bg-bolt-elements-background-depth-1',
                      'text-bolt-elements-textPrimary',
                      'hover:bg-bolt-elements-background-depth-2',
                      'border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]',
                      'h-10 px-4 py-2 min-w-[120px] justify-center',
                      'transition-all duration-200 ease-in-out rounded-lg',
                    )}
                  />
                  <ImportZipButton
                    importChat={importChat}
                    className={classNames(
                      'gap-2 bg-bolt-elements-background-depth-1',
                      'text-bolt-elements-textPrimary',
                      'hover:bg-bolt-elements-background-depth-2',
                      'border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]',
                      'h-10 px-4 py-2 min-w-[120px] justify-center',
                      'transition-all duration-200 ease-in-out rounded-lg',
                    )}
                  />
                  <GitCloneButton importChat={importChat} />
                </div>
              )}
              <div className="flex flex-col gap-5">
                {!chatStarted && false &&
                  ExamplePrompts((event, messageInput) => {
                    if (isStreaming) {
                      handleStop?.();
                      return;
                    }

                    handleSendMessage?.(event, messageInput);
                  })}
                {!chatStarted && <StarterTemplates />}
              </div>
            </div>
          </div>
          <ClientOnly>
            {() => (
              <Suspense fallback={null}>
                <LazyWorkbench
                  chatStarted={chatStarted}
                  isStreaming={isStreaming}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  exportChat={exportChat}
                />
              </Suspense>
            )}
          </ClientOnly>
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <>
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-bolt-elements-background-depth-1 to-transparent h-20 z-10" />
        <button
          className="sticky z-50 bottom-0 left-0 right-0 text-4xl rounded-lg px-1.5 py-0.5 flex items-center justify-center mx-auto gap-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm"
          onClick={() => scrollToBottom()}
        >
          Go to last message
          <span className="i-ph:arrow-down animate-bounce" />
        </button>
      </>
    )
  );
}
