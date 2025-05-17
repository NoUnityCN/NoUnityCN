import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  initialContent?: React.ReactNode;
}

export function Chat({ initialContent }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantMessage,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '服务器繁忙，请稍后再试'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4">
        <div className="p-4">
          {initialContent}
        </div>
        
        {messages.length > 0 && (
          <div className="border-t pt-4">
            <div className="px-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex w-full",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[90%] rounded-lg p-4 bg-white border shadow-sm",
                      message.role === 'user'
                        ? 'mr-2'
                        : 'ml-2'
                    )}
                  >
                    {message.role === 'assistant' ? (
  <ReactMarkdown 
    components={{
      code({node, className, children, ...props}) {
        return (
          <code className={cn("bg-gray-100 p-1 rounded text-sm", className)} {...props}>
            {children}
          </code>
        )
      },
      pre({node, className, children, ...props}) {
        return (
          <pre className={cn("bg-gray-100 p-4 rounded-md overflow-x-auto my-2", className)} {...props}>
            {children}
          </pre>
        )
      }
    }}
  >
    {message.content}
  </ReactMarkdown>
) : message.content}
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-2 mb-8">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            disabled={isLoading}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-2 text-center text-xs text-gray-400 bg-transparent">
      内容为AI生成，仅供参考!
        </div>
      </form>
    </div>
  );
}