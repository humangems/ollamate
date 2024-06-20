import { Tooltip, IconButton } from "@radix-ui/themes";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import copy from "copy-to-clipboard";

export default function CopyButton({content}: {content: string}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {

    copy(content)
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip content={copied ? "Copied" : "Copy content"}>
      <IconButton size="1" color="gray" variant="ghost" onClick={handleCopy}>
        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      </IconButton>
    </Tooltip>
  );
}