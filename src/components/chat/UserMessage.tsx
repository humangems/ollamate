import Markdown from "react-markdown";
import { Message } from "../../lib/types";

export default function UserMessage({ message }: { message: Message }) {
  return (
    <div className="w-full flex justify-end py-4">
      <div className="bg-gray-3 max-w-[75%] py-2 px-3 rounded-4">
        <div className="prose flex-1">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}