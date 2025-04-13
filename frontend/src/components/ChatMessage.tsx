import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Edit, Camera, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { ChatCard } from "./ui/chat-card";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAi?: boolean;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
  onEdit?: (newMessage: string) => void;
  onFeedback?: (type: 'positive' | 'negative', details?: string) => void;
}

import type { ReactNode } from "react";
import type { Element } from "react-markdown/lib/ast-to-react";

interface CodeProps {
  node?: Element;
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

const tryParseCard = (text: string) => {
  if (!text.includes('Title:')) return null;
  try {
    const title = text.match(/Title:\s*([^\n]+)/)?.[1] || '';
    const subtitle = text.match(/Subtitle:\s*([^\n]+)/)?.[1];
    const description = text.match(/Description:\s*([^\n]+)/)?.[1] || '';
    const buttonsMatch = text.match(/Buttons:\n((?:- [^\n]+\n?)*)/);
    const buttons = buttonsMatch?.[1].split('\n').filter(line => line.startsWith('- ')).map(button => {
      const [icon, label, link] = button.replace('- ', '').match(/([^\s]+)\s+([^(]+)\s*\(link:\s*([^)]+)\)/)?.slice(1) || [];
      return {
        icon,
        label: label.trim(),
        link
      };
    }) || [];
    return {
      title,
      subtitle,
      description,
      buttons
    };
  } catch (error) {
    console.error('Error parsing card:', error);
    return null;
  }
};

export const ChatMessage = ({
  message,
  isAi = false,
  attachments = [],
  onEdit,
  onFeedback
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const timestamp = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const cardData = tryParseCard(message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };
  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(editedMessage);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };
  const handleScreenshot = async () => {
    try {
      const messageElement = document.getElementById(`message-${message.slice(0, 10)}`);
      if (messageElement) {
        const canvas = await html2canvas(messageElement);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'chat-screenshot.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Screenshot saved");
      }
    } catch (err) {
      toast.error("Failed to take screenshot");
    }
  };

  const canShowFeedback = isAi && !feedbackGiven && localStorage.getItem('COLLECT_FEEDBACK') !== 'false';

  const submitFeedback = (type: 'positive' | 'negative') => {
    if (type === 'negative' && localStorage.getItem('DETAILED_NEGATIVE_FEEDBACK') !== 'false') {
      setShowFeedbackForm(true);
      return;
    }

    const feedback = JSON.parse(localStorage.getItem('FEEDBACK') || '[]');
    feedback.push({
      type,
      message,
      details: feedbackDetails,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('FEEDBACK', JSON.stringify(feedback));

    if (onFeedback) {
      onFeedback(type, feedbackDetails);
    }

    setFeedbackGiven(true);
    setShowFeedbackForm(false);
  };

  const renderFeedbackUI = () => {
    if (!canShowFeedback) return null;

    if (showFeedbackForm) {
      return (
        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
          <p className="text-sm text-gray-300 mb-2">What could be improved?</p>
          <textarea
            className="w-full p-2 rounded bg-white/10 border border-white/20 text-gray-200 text-sm mb-2"
            placeholder="Please tell us what was incorrect or unhelpful..."
            value={feedbackDetails}
            onChange={(e) => setFeedbackDetails(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button 
              className="px-3 py-1 text-sm rounded bg-white/10 hover:bg-white/20 text-gray-300"
              onClick={() => setShowFeedbackForm(false)}
            >
              Cancel
            </button>
            <button 
              className="px-3 py-1 text-sm rounded bg-gradient-to-tr from-[#9b87f5] to-[#8B5CF6] text-white"
              onClick={() => submitFeedback('negative')}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      );
    }

    if (showFeedback) {
      return (
        <div className="mt-2 flex space-x-2 items-center justify-end">
          <span className="text-xs text-gray-400">Was this helpful?</span>
          <button 
            className="p-1 rounded hover:bg-green-500/20 text-green-400"
            onClick={() => submitFeedback('positive')}
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button 
            className="p-1 rounded hover:bg-red-500/20 text-red-400"
            onClick={() => submitFeedback('negative')}
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-end mt-1">
        <button 
          className="text-xs text-gray-400 flex items-center hover:text-gray-300"
          onClick={() => setShowFeedback(true)}
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Feedback
        </button>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "py-6 px-2 md:px-4 w-full animate-message-fade-in relative backdrop-blur-sm",
        isAi ? "bg-[#1A1F2C]/50" : "bg-[#1A1F2C]/30"
      )} 
      id={`message-${message.slice(0, 10)}`}
    >
      <div className="max-w-5xl mx-auto flex gap-4">
        <div 
          className={cn(
            "w-2 h-2 mt-2 rounded-full flex-shrink-0",
            isAi 
              ? "bg-gradient-to-tr from-[#9b87f5] to-[#8B5CF6] animate-pulse" 
              : "bg-gradient-to-r from-[#D946EF] to-[#8B5CF6]"
          )}
        />

        <div className="flex-1 space-y-2">
          <div 
            className={cn(
              "p-4 rounded-xl text-white shadow-lg transition-all duration-300",
              isAi 
                ? "bg-gradient-to-br from-[#2A2F3C] to-[#1A1F2C] border border-[#9b87f5]/10" 
                : "bg-gradient-to-br from-[#D946EF] to-[#8B5CF6]",
              "animate-scale-in"
            )}
          >
            {isEditing ? (
              <textarea
                value={editedMessage}
                onChange={e => setEditedMessage(e.target.value)}
                className="w-full bg-[#1A1F2C] text-white rounded-lg p-3 min-h-[100px] border border-[#9b87f5]/20"
              />
            ) : cardData ? (
              <ChatCard {...cardData} />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code: ({
                    node,
                    inline,
                    className,
                    children,
                    ...props
                  }: CodeProps) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? <div className="relative group my-6">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                              <div className="relative rounded-lg overflow-hidden">
                                <div className="bg-[#2A2F3C] text-xs text-gray-400 px-4 py-1 flex justify-between items-center">
                                  <span>{match[1].toUpperCase()}</span>
                                  <button onClick={handleCopy} className="p-1 hover:bg-[#1A1F2C] rounded">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                </div>
                                <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" customStyle={{
                          margin: 0,
                          background: '#1A1F2C',
                          padding: '1rem',
                          fontSize: '0.9rem',
                          borderRadius: '0 0 0.5rem 0.5rem'
                        }}>
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            </div> : <code {...props} className={cn(className, "bg-[#2A2F2C] px-1.5 py-0.5 rounded-md font-mono text-sm")}>
                              {children}
                            </code>;
                  },
                  p: ({
                    children
                  }) => <p className="mb-4 leading-7 text-justify">{children}</p>,
                  ul: ({
                    children
                  }) => <ul className="mb-4 pl-6 list-disc space-y-2">{children}</ul>,
                  ol: ({
                    children
                  }) => <ol className="mb-4 pl-6 list-decimal space-y-2">{children}</ol>,
                  li: ({
                    children
                  }) => <li className="leading-7 text-justify">{children}</li>,
                  h1: ({
                    children
                  }) => <h1 className="text-2xl font-bold mb-4 mt-6 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] bg-clip-text text-transparent">{children}</h1>,
                  h2: ({
                    children
                  }) => <h2 className="text-xl font-bold mb-3 mt-5 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] bg-clip-text text-transparent">{children}</h2>,
                  h3: ({
                    children
                  }) => <h3 className="text-lg font-bold mb-3 mt-5 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] bg-clip-text text-transparent">{children}</h3>,
                  h4: ({
                    children
                  }) => <h4 className="text-base font-bold mb-2 mt-4 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] bg-clip-text text-transparent">{children}</h4>,
                  blockquote: ({
                    children
                  }) => <blockquote className="border-l-4 border-[#9b87f5] pl-4 italic my-4 text-gray-300 bg-[#2A2F3C]/50 py-2 rounded-r-md">
                            {children}
                          </blockquote>,
                  a: ({
                    href,
                    children
                  }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#9b87f5] hover:underline font-medium">
                            {children}
                          </a>,
                  table: ({
                    children
                  }) => <div className="overflow-x-auto my-6 rounded-lg border border-[#9b87f5]/20">
                            <table className="min-w-full rounded-lg overflow-hidden">
                              {children}
                            </table>
                          </div>,
                  thead: ({
                    children
                  }) => <thead className="bg-[#2A2F3C]">{children}</thead>,
                  tbody: ({
                    children
                  }) => <tbody className="divide-y divide-[#2A2F3C]">{children}</tbody>,
                  tr: ({
                    children
                  }) => <tr className="hover:bg-[#2A2F3C]/50 transition-colors">{children}</tr>,
                  th: ({
                    children
                  }) => <th className="px-4 py-3 text-left font-semibold text-[#9b87f5]">{children}</th>,
                  td: ({
                    children
                  }) => <td className="px-4 py-3">{children}</td>,
                  img: ({
                    src,
                    alt
                  }) => <div className="my-4">
                            <img src={src} alt={alt} className="rounded-lg max-w-full h-auto border border-[#9b87f5]/20 shadow-lg" />
                            {alt && <p className="text-center text-sm text-gray-400 mt-2">{alt}</p>}
                          </div>
                }}
                className="prose prose-invert max-w-none"
              >
                {message}
              </ReactMarkdown>
            )}
          </div>
          
          {renderFeedbackUI()}
          
          {isAi && (
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-xs text-gray-400">Was this helpful?</span>
              <button 
                className="p-1 rounded hover:bg-green-500/20 text-green-400"
                onClick={() => {
                  try {
                    console.log("Submitting positive feedback");
                    // Simple feedback storage
                    const feedback = JSON.parse(localStorage.getItem('FEEDBACK') || '[]');
                    const newFeedback = {
                      id: Date.now().toString(),
                      type: 'positive',
                      message: message,
                      timestamp: new Date().toISOString()
                    };
                    feedback.push(newFeedback);
                    localStorage.setItem('FEEDBACK', JSON.stringify(feedback));
                    console.log("Feedback saved:", newFeedback);
                    alert("Thank you for your positive feedback!");
                  } catch (error) {
                    console.error("Error saving feedback:", error);
                    alert("Could not save feedback. Please try again.");
                  }
                }}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button 
                className="p-1 rounded hover:bg-red-500/20 text-red-400"
                onClick={() => {
                  try {
                    console.log("Submitting negative feedback");
                    // Simple feedback storage
                    const feedback = JSON.parse(localStorage.getItem('FEEDBACK') || '[]');
                    const newFeedback = {
                      id: Date.now().toString(),
                      type: 'negative',
                      message: message,
                      timestamp: new Date().toISOString()
                    };
                    feedback.push(newFeedback);
                    localStorage.setItem('FEEDBACK', JSON.stringify(feedback));
                    console.log("Feedback saved:", newFeedback);
                    alert("Thank you for your feedback. We'll work to improve this response.");
                  } catch (error) {
                    console.error("Error saving feedback:", error);
                    alert("Could not save feedback. Please try again.");
                  }
                }}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="text-xs text-gray-400 ml-1 flex items-center gap-2">
            <span>{timestamp}</span>
            <div className="h-1 w-1 rounded-full bg-gray-500"></div>
            <span>{isAi ? 'AI Assistant' : 'You'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!isAi && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-[#2A2F3C] text-gray-400 hover:text-white transition-colors"
            >
              {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-[#2A2F3C] text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {attachments && attachments.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {attachments.map((attachment, index) => 
            attachment && attachment.type === 'image' ? (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <img 
                  src={attachment.url} 
                  alt={attachment.name} 
                  className="relative rounded-lg max-h-64 object-cover w-full border border-[#9b87f5]/10" 
                />
              </div>
            ) : attachment ? (
              <a 
                key={index} 
                href={attachment.url} 
                download={attachment.name} 
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center gap-2 p-3 rounded-lg bg-[#2A2F3C] hover:bg-[#343B4C] transition-colors border border-[#9b87f5]/10">
                  📎 {attachment.name}
                </div>
              </a>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};
