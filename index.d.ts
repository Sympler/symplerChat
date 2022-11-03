import React from 'react';
export declare type TFile = {
    source?: string;
    file: File;
};
interface ChatProps {
    formName: string;
    endpoint: string;
}
declare const SymplerChat: React.FC<ChatProps>;
export default SymplerChat;
