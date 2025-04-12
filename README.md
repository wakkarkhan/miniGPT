# AI Chat Interface with Fully Formatted Output

A ChatGPT-style frontend built with Next.js that displays beautifully formatted AI responses including markdown, code blocks, tables, and math expressions.

## Features

- 💬 Chat interface with user and assistant messages
- 📝 Markdown rendering with support for:
  - Headings (h1-h4)
  - Bulleted & numbered lists
  - Tables
  - Code blocks with syntax highlighting
  - Math expressions using LaTeX
  - Essays and paragraphs
- 🌓 Light and dark mode support
- 📱 Fully responsive design
- 📋 Copy button for code blocks
- 🔄 Optional streaming support
- 🔐 Local storage for API key

## Tech Stack

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS with Typography plugin
- **Markdown Rendering**: ReactMarkdown with various plugins
- **API**: OpenAI GPT-3.5/GPT-4 API

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your OpenAI API key when prompted
2. Type a message in the input box and click "Send" or press Cmd/Ctrl+Enter
3. Try out different types of prompts to see the formatting capabilities:
   - "Write a bulleted list of frontend frameworks."
   - "Create a markdown table comparing React and Angular."
   - "Explain recursion with a code example."
   - "Write a short essay on climate change with subheadings."
   - "Give me multiplication table in a table format."

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout with ThemeProvider
│   └── globals.css       # Global styles
├── components/
│   ├── ChatInput.tsx     # Text input component
│   ├── ChatWindow.tsx    # Chat messages container
│   ├── MarkdownRenderer.tsx # Renders markdown content
│   ├── MessageBubble.tsx # Individual message component
│   ├── ThemeToggle.tsx   # Light/dark mode toggle
│   └── theme-provider.tsx # Next-themes provider
└── services/
    └── openai.ts         # OpenAI API integration
```

## Environment Variables

No environment variables are required as the OpenAI API key is entered by the user and stored in localStorage.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
