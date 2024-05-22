import { Button, TextField } from "@radix-ui/themes";

import ollama from 'ollama/browser';
import Markdown from 'react-markdown';
import { useForm } from '@mantine/form';

import { useState } from "react";

type FormValues = {
  message: string;
};


export default function ChatView() {
  const [res, setRes] = useState('');
  const form = useForm<FormValues>({
    initialValues: {
      message: 'Why is the sky blue?',
    },
  });

  const handleClick = async () => {
    const message = { role: 'user', content: 'Why is the sky blue?' };
    const response = await ollama.chat({
      model: 'llama3:latest',
      messages: [message],
      stream: true,
    });
    for await (const part of response) {
      // process.stdout.write(part.message.content);
      setRes((old) => old + part.message.content);
    }
  }

  const handleSubmit = async (values: FormValues) => {
    const message = { role: 'user', content: values.message };
    setRes('')
    const response = await ollama.chat({
      model: 'llama3:latest',
      messages: [message],
      stream: true,
    });
    for await (const part of response) {
      // process.stdout.write(part.message.content);
      setRes((old) => old + part.message.content);
    }
  }

  return (
    <div>
      <h1>Chat</h1>
      <hr />
      <div className="prose mt-4">
        <Markdown>{res}</Markdown>
      </div>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextField.Root {...form.getInputProps("message")}></TextField.Root>
        <Button type="submit">Chat!</Button>
      </form>
    </div>
  );
}