import { RabbitIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { Message } from '../../lib/types';

export default function OtherMessage({ message }: { message: Message }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-start space-x-2">
        <div className="w-12 shrink-0 font-medium text-gray-11 text-2">
          <div className='border size-8 rounded-full flex items-center justify-center'>
            <RabbitIcon className='size-5' />
          </div>
        </div>
        <div className="prose flex-1">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
