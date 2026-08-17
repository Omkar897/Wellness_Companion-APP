import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface JournalEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  placeholder?: string;
  minChars?: number;
}

export function JournalEditor({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder = "What's on your mind today? Write freely — your AI companion is listening...",
  minChars = 10,
}: JournalEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [value]);

  const canSubmit = value.trim().length >= minChars && !loading;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        className="relative glass rounded-2xl overflow-hidden"
        animate={loading ? { opacity: 0.6 } : { opacity: 1 }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          aria-label="Journal entry"
          aria-multiline="true"
          rows={5}
          className="
            w-full bg-transparent text-white/90 placeholder-white/25
            resize-none p-5 text-sm leading-relaxed
            focus:outline-none min-h-[120px]
          "
        />
        {/* Character count */}
        <div className="absolute bottom-3 right-4 text-xs text-white/25">{value.length} / 5000</div>
      </motion.div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">
          {value.length < minChars ? `${minChars - value.length} more chars` : ''}
          {value.length >= minChars ? '⌘+Enter to submit' : ''}
        </span>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!canSubmit}
          loading={loading}
          size="md"
        >
          {loading ? 'Analyzing...' : 'Analyze Entry'}
        </Button>
      </div>
    </div>
  );
}
