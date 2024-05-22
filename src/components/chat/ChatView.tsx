import { Button, TextField } from '@radix-ui/themes';

import ollama from 'ollama/browser';
import Markdown from 'react-markdown';
import { useForm } from '@mantine/form';

import { useState } from 'react';
import { Chat } from '../../lib/types';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { newMessageThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';

type FormValues = {
  message: string;
};

type ChatViewProps = {
  chat: Chat;
};

export default function ChatView({ chat }: ChatViewProps) {
  const form = useForm<FormValues>({
    initialValues: {
      message: '',
    },
  });

  const messages = useAppSelector((state) => selectMessagesByChatId(state, chat.id));

  const dispatch = useAppDispatch();

  const handleSubmit = async (values: FormValues) => {
    dispatch(newMessageThunk({ chat_id: chat.id, content: values.message }))
    form.reset();
  };


  return (
    <div>
      <h1>Chat: Redux Version</h1>
      <hr />
      <div className="mt-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-4">
            <div className="w-12 shrink-0 font-medium text-gray-11 text-2">
              {message.role === 'user' ? 'You' : 'Assit.'}
            </div>
            <div className="prose flex-1">
              <Markdown>{message.content}</Markdown>
              <div>{(message.eval_count * 10 ^ 9 / message.eval_duration)}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="flex items-center mt-4">
          <TextField.Root {...form.getInputProps('message')} className="flex-1"></TextField.Root>
          <Button type="submit">Chat!</Button>
        </div>
      </form>
    </div>
  );
}
