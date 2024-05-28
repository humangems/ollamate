import Markdown from "react-markdown";
import { Message } from "../../lib/types";

function InputImage({data}: {data: string}) {
  // render image here
  return <img src={`data:image/jpeg;base64,${data}`} alt="image" />;
}

export default function UserMessage({ message }: { message: Message }) {
  return (
    <div className="w-full flex justify-end py-4">
      <div className="bg-gray-3 max-w-[75%] py-2 px-3 rounded-4">
        <div className="prose flex-1">
          {message.images && <div><InputImage data={message.images[0]}/></div>}
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}