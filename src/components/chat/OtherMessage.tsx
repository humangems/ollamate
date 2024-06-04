import 'katex/dist/katex.min.css';
import { LoaderIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeMathjax from 'rehype-mathjax';
import rehypeMermaid from 'rehype-mermaid';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { Message } from '../../lib/types';
import { useAppSelector } from '../../redux/store';
import OllamaIcon from '../icons/Ollama';


export default function OtherMessage({ message }: { message: Message }) {
  const isStreaming = useAppSelector((state) => state.messages.isStreaming[message.id]);

  return (
    <div className="w-full py-4">
      <div className="flex items-start space-x-2">
        <div className="w-12 shrink-0 font-medium text-gray-11 text-2">
          <div className=" size-9 overhi bg-grayA-3 rounded-full flex items-center justify-center">
            <div className="p-2">
              <OllamaIcon />
            </div>
          </div>
        </div>
        <div className="prose flex-1">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeMathjax, rehypeMermaid]}
          >
            {message.content}
          </Markdown>
          <div className="flex items-center space-x-1 text-2 text-gray-11">
            <div>{message.model}</div>
            {isStreaming && <LoaderIcon className="animate-spin" size={14} />}
          </div>
        </div>
      </div>
    </div>
  );
}
