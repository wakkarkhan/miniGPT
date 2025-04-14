export const SOCKET_EVENT_NAME = {
  TYPING: 'typing',
  MESSAGES: 'messages',
  MESSAGE_CHUNK: 'message_chunk',
  MESSAGE_DONE: 'message_done',
  NEW_MESSAGE: 'new_message',
  ERROR: 'error',
  STREAM_STOPPED: 'stream_stopped'
} as const; 