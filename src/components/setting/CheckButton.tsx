import { Ollama } from 'ollama/browser';
import { useState } from 'react';
import { CheckCircle2Icon, LoaderCircleIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

type CheckState = 'success' | 'error';

export default function CheckButton({ disabled = false, url }: { disabled?: boolean; url: string }) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<CheckState | null>(null);

  const handleCheck = async () => {
    if (!url.trim()) {
      toast.error('Enter an Ollama server URL before checking the connection.');
      return;
    }

    setChecking(true);
    try {
      const instance = new Ollama({ host: url });
      await instance.list();
      setStatus('success');
      toast.success('Connection successful.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(error);
      setStatus('error');
      toast.error(`Failed to connect to ${url}`, {
        description: message,
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Button variant="outline" type="button" onClick={handleCheck} disabled={disabled || checking}>
      {checking ? <LoaderCircleIcon className="animate-spin" /> : null}
      {!checking && status === 'success' ? <CheckCircle2Icon /> : null}
      {!checking && status === 'error' ? <XCircleIcon /> : null}
      {checking ? 'Checking...' : 'Check'}
    </Button>
  );
}
