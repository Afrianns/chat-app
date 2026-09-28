export interface InterlocutorType {
    id: string
    email: string
    avatar: string
    clerk_user_id: string
    created_at: Date
    username: string
};

export interface MessagesType {
  id: string;
  created_at: Date;
  conversation_id: string;
  sender_clerk_id: string;
  content: string;
  is_readed: boolean;
}

export interface ConversationType {
  interlocutor: InterlocutorType
  messages: MessagesType[]
}


export interface ConversationActiveType {
  id: string;
  first_user_id: string;
  second_user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PreviewConversationType {
  id: string
  interlocutor: {
    avatar: string
    username: string
    clerk_user_id: string
  };
  messages: {
      created_at: Date
      content: string
  }[];
  unreadCount?: number;
}
