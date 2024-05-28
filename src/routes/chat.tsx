import { LoaderFunction, useParams } from "react-router-dom";
import { getNote } from "../lib/rxdb";
import { Note } from "../lib/types";
import ChatView from "../components/chat/ChatView";
import { useAppSelector } from "../redux/store";
import { chatSelectors } from "../redux/slice/chatSlice";

type LoaderData = {
  note: Note;
}

export const loader: LoaderFunction = async({ params}): Promise<LoaderData> => {
  const note = await getNote(params.noteId!);
  return { note };
}

export default function NotePage() {

  const {chatId} = useParams();

  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId!));

  if (!chat) return null;

  return (
    <div className="">
      <ChatView chat={chat} isNewChat={false} />
    </div>
  );
}
