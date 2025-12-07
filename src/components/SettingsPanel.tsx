import { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Sun, Moon, Smartphone, Home, Zap, Volume2 } from 'lucide-react';
import { ColorPalette } from '@/hooks/useColorPalette';

interface Settings {
  ollamaUrl: string;
  ollamaModel: string;
  geminiApiKey: string;
  groqApiKey: string;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  providerPriority: ('ollama' | 'gemini' | 'groq')[];
  voiceOutputEnabled: boolean;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  theme?: 'dark' | 'light';
  onThemeChange?: () => void;
  colorPalette?: ColorPalette;
  onColorPaletteChange?: (palette: ColorPalette) => void;
}

const colorPaletteOptions: { id: ColorPalette; label: string; colors: string[]; icon: string }[] = [
  { 
    id: 'rose-blue', 
    label: 'Rose & Blue', 
    colors: ['hsl(320, 70%, 60%)', 'hsl(280, 65%, 60%)', 'hsl(210, 80%, 60%)'],
    icon: '💜'
  },
  { 
    id: 'ocean', 
    label: 'Ocean', 
    colors: ['hsl(200, 85%, 55%)', 'hsl(180, 75%, 50%)', 'hsl(160, 70%, 55%)'],
    icon: '🌊'
  },
  { 
    id: 'aurora', 
    label: 'Aurora', 
    colors: ['hsl(280, 70%, 55%)', 'hsl(160, 75%, 50%)', 'hsl(200, 80%, 55%)'],
    icon: '✨'
  },
  { 
    id: 'sunset', 
    label: 'Sunset', 
    colors: ['hsl(20, 85%, 55%)', 'hsl(340, 75%, 55%)', 'hsl(45, 80%, 55%)'],
    icon: '🌅'
  },
];

const voiceCommands = [
  { category: 'Greetings', commands: ['Hi ZOEY', 'Hello', 'Good morning', 'Good night'] },
  { category: 'Appearance', commands: ['Dark mode', 'Light mode', 'Change theme', 'Change color'] },
  { category: 'Device Control', commands: ['Turn off screen', 'Lock phone', 'Clear cache', 'Battery status'] },
  { category: 'Apps', commands: ['Open camera', 'Open settings', 'Close app', 'Open browser'] },
  { category: 'Smart Home', commands: ['Turn on lights', 'Turn off lights', 'Set thermostat', 'Lock doors'] },
];

const SettingsPanel = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  theme = 'dark',
  onThemeChange,
  colorPalette = 'rose-blue',
  onColorPaletteChange
}: SettingsPanelProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const sections = [
    { id: 'appearance', label: 'APPEARANCE', icon: '🎨' },
    { id: 'commands', label: 'VOICE_COMMANDS', icon: '🎤' },
    { id: 'device', label: 'DEVICE_CONTROL', icon: '📱' },
    { id: 'ollama', label: 'OLLAMA_CONFIG', icon: '🔧' },
    { id: 'gemini', label: 'GEMINI_API', icon: '🌟' },
    { id: 'groq', label: 'GROQ_API', icon: '⚡' },
    { id: 'elevenlabs', label: 'ELEVENLABS_VOICE', icon: '🔊' },
    { id: 'priority', label: 'PROVIDER_PRIORITY', icon: '📊' },
    { id: 'about', label: 'ABOUT', icon: '💜' },
  ];

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div>
              <p className="text-terminal-text/60 text-xs font-mono mb-3">
                # THEME_MODE
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onThemeChange}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10 text-foreground' 
                      : 'border-terminal-border/30 text-muted-foreground hover:border-terminal-border/50'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="font-mono text-sm">Dark</span>
                </button>
                <button
                  onClick={onThemeChange}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10 text-foreground' 
                      : 'border-terminal-border/30 text-muted-foreground hover:border-terminal-border/50'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span className="font-mono text-sm">Light</span>
                </button>
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <p className="text-terminal-text/60 text-xs font-mono mb-3">
                # COLOR_PALETTE
              </p>
              <div className="grid grid-cols-2 gap-3">
                {colorPaletteOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onColorPaletteChange?.(option.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      colorPalette === option.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-terminal-border/30 hover:border-terminal-border/50'
                    }`}
                  >
                    <div className="flex gap-1.5">
                      {option.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs text-foreground">{option.label}</span>
                    {colorPalette === option.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'commands':
        return (
          <div className="space-y-5">
            <p className="text-terminal-text/60 text-xs font-mono mb-2">
              # Offline voice commands ZOEY understands
            </p>
            {voiceCommands.map((group) => (
              <div key={group.category} className="space-y-2">
                <p className="text-xs text-primary font-mono flex items-center gap-2">
                  <Volume2 className="w-3 h-3" />
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.commands.map((cmd) => (
                    <span
                      key={cmd}
                      className="px-3 py-1.5 rounded-full text-xs font-mono bg-muted/30 text-muted-foreground border border-terminal-border/20"
                    >
                      "{cmd}"
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'device':
        return (
          <div className="space-y-4">
            <p className="text-terminal-text/60 text-xs font-mono mb-4">
              # ZOEY can control your devices via voice
            </p>
            
            <div className="p-4 rounded-xl bg-muted/20 border border-terminal-border/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/15">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Phone Control</p>
                  <p className="text-xs text-muted-foreground">Screen, apps, cache, battery</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-secondary/15">
                  <Home className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Smart Home</p>
                  <p className="text-xs text-muted-foreground">Lights, thermostat, locks</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-accent/15">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Quick Actions</p>
                  <p className="text-xs text-muted-foreground">Shortcuts, automation</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">💡 Tip:</span> Say "Hey ZOEY, turn off the lights" to control your smart home
              </p>
            </div>
          </div>
        );

      case 'ollama':
        return (
          <div className="space-y-4">
            <TerminalInput
              label="OLLAMA_BASE_URL"
              value={localSettings.ollamaUrl}
              onChange={(v) => updateSetting('ollamaUrl', v)}
              placeholder="http://localhost:11434"
            />
            <TerminalInput
              label="OLLAMA_MODEL"
              value={localSettings.ollamaModel}
              onChange={(v) => updateSetting('ollamaModel', v)}
              placeholder="llama2"
            />
          </div>
        );
      case 'gemini':
        return (
          <div className="space-y-4">
            <TerminalInput
              label="GEMINI_API_KEY"
              value={localSettings.geminiApiKey}
              onChange={(v) => updateSetting('geminiApiKey', v)}
              placeholder="Enter your Gemini API key"
              type="password"
            />
          </div>
        );
      case 'groq':
        return (
          <div className="space-y-4">
            <TerminalInput
              label="GROQ_API_KEY"
              value={localSettings.groqApiKey}
              onChange={(v) => updateSetting('groqApiKey', v)}
              placeholder="Enter your Groq API key"
              type="password"
            />
          </div>
        );
      case 'elevenlabs':
        return (
          <div className="space-y-4">
            <TerminalInput
              label="ELEVENLABS_API_KEY"
              value={localSettings.elevenLabsApiKey}
              onChange={(v) => updateSetting('elevenLabsApiKey', v)}
              placeholder="Enter your ElevenLabs API key"
              type="password"
            />
            <TerminalInput
              label="VOICE_ID"
              value={localSettings.elevenLabsVoiceId}
              onChange={(v) => updateSetting('elevenLabsVoiceId', v)}
              placeholder="EXAVITQu4vr4xnSDxMaL"
            />
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-xs text-muted-foreground">
                Popular voices: Sarah (EXAVITQu4vr4xnSDxMaL), Charlotte (XB0fDUnXU5powFXDhCwa), Aria (9BWtsMINqrJLrRacOk9x)
              </p>
            </div>
          </div>
        );
      case 'priority':
        return (
          <div className="space-y-3">
            <p className="text-terminal-text/60 text-xs font-mono mb-4">
              # Provider fallback order
            </p>
            {localSettings.providerPriority.map((provider, index) => (
              <div
                key={provider}
                className="flex items-center gap-3 p-3 border border-terminal-border/30 rounded-lg bg-muted/20"
              >
                <span className="text-terminal-text font-mono text-sm w-6">{index + 1}.</span>
                <span className="text-foreground font-mono text-sm uppercase flex-1">{provider}</span>
                <Check className="w-4 h-4 text-terminal-text" />
              </div>
            ))}
          </div>
        );
      case 'about':
        return (
          <div className="space-y-5">
            <div className="text-center py-6">
              <div className="text-5xl mb-4">💜</div>
              <h2 className="text-2xl font-bold text-gradient mb-2">ZOEY</h2>
              <p className="text-muted-foreground text-sm">Version 1.0.0</p>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/20 border border-terminal-border/20 space-y-3">
              <p className="text-foreground text-sm font-medium">Made only for you,</p>
              <p className="text-2xl font-bold text-gradient">Punsara</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="text-terminal-text">✦</span> Personal AI Assistant
              </p>
              <p className="text-muted-foreground">
                <span className="text-terminal-text">✦</span> Multi-Provider Fallback System
              </p>
              <p className="text-muted-foreground">
                <span className="text-terminal-text">✦</span> Voice Input & Output with ElevenLabs
              </p>
              <p className="text-muted-foreground">
                <span className="text-terminal-text">✦</span> Device & Smart Home Control
              </p>
              <p className="text-muted-foreground">
                <span className="text-terminal-text">✦</span> Liquid Glass Interface Design
              </p>
            </div>

            <div className="pt-4 border-t border-terminal-border/20 text-center">
              <p className="text-xs text-muted-foreground/70">
                Crafted with 💜 for Punsara
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-fade-in">
      <div className="terminal-panel w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-terminal-border/30">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-terminal-text font-mono text-sm ml-2">
              zoey://settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-5 font-mono text-sm">
            <p className="text-terminal-text mb-1">
              <span className="text-muted-foreground">$</span> cat /etc/zoey/config
            </p>
            <p className="text-muted-foreground text-xs mb-5">
              # Select a section to configure
            </p>

            {!activeSection ? (
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-terminal-border/20 hover:border-terminal-border/50 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-foreground flex-1 text-left font-medium">{section.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-terminal-text transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="animate-slide-up">
                <button
                  onClick={() => setActiveSection(null)}
                  className="flex items-center gap-2 text-terminal-text hover:text-foreground mb-5 transition-colors"
                >
                  <span className="text-lg">←</span>
                  <span className="text-sm">BACK</span>
                </button>
                <p className="text-terminal-text mb-5">
                  <span className="text-muted-foreground">$</span> nano{' '}
                  {sections.find(s => s.id === activeSection)?.label}
                </p>
                {renderSectionContent()}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-terminal-border/20">
              <p className="text-muted-foreground text-xs">
                <span className="text-terminal-text animate-terminal-blink">█</span> Settings saved automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TerminalInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password';
}

const TerminalInput = ({ label, value, onChange, placeholder, type = 'text' }: TerminalInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-terminal-text text-xs font-mono">{label}=</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted/30 border border-terminal-border/30 rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-terminal-border focus:outline-none focus:ring-2 focus:ring-terminal-border/30 transition-all"
      />
    </div>
  );
};

export default SettingsPanel;