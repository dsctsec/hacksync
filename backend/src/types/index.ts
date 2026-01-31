export interface Message {
    id: string;
    sender: string;
    recipient: string;
    content: string;
    timestamp: Date;
}

export interface Conversation {
    id: string;
    participants: string[];
    messages: Message[];
    status: 'active' | 'completed' | 'pending';
}