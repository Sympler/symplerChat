import React from 'react';
import './App.css';
import 'drew-react-chat-widget-custom/lib/styles.css';
export declare type TFile = {
    source?: string;
    file: File;
};
interface ChatProps {
    urlParam: string;
}
declare const SymplerChat: React.FC<ChatProps>;
export default SymplerChat;
