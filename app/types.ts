export interface InterlocutorType {
    id: string
    email: string
    clerk_user_id: string
    created_at: Date
    username: string
};

export interface MessagesType {
  id: string;
  created_at: Date;
  conversation_id: string;
  sender_id: string;
  content: string;
  updated_at: Date;
}[]

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
      username: string
      clerk_user_id: string
  };
  messages: {
      created_at: Date
      content: string
  }[];
}
