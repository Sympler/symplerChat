import React, {useEffect, useState} from 'react';
import {Widget, addResponseMessage, setQuickButtons, addUserMessage, toggleWidget} from 'react-chat-widget-custom';
import 'react-chat-widget-custom/lib/styles.css';
import axios from 'axios';
import SymplerChat from './components/chat';
import NavBar from './components/navbar';

export type TFile = {
  source?: string;
  file: File;
}

interface FormIoResponse {
  data: {
    components: [
      {
        data: {
          values: [{
            label: string,
            value: string
          }]
        },
        input: boolean,
        key: string,
        label: string,
        tableView: boolean,
        type: string
      }
    ]
    data: any
    _id: string
  }
}

interface ChatProps {
  formName?: string,
  endpoint?: string
}



const App: React.FC<ChatProps> = () => {

  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [formName, setFormName] = useState<string | null>(null);

  useEffect(() => {
    const isBrowser = typeof window !== "undefined"
    if (isBrowser) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      let endpoint = params.endpoint;
      let formName = params.formName;
      setEndpoint(endpoint);
      setFormName(formName);
    }
  }, []);
  
  return (
    <div className="App">
      <NavBar />
      {endpoint && formName && (
        <SymplerChat endpoint={endpoint} formName={formName} />
      )}
    </div>
  );
}

export default App;