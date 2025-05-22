import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import copy from 'copy-to-clipboard';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export default function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copy(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied' : 'Copy content'}</TooltipContent>
    </Tooltip>
  );
}
