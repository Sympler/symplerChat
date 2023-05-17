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
  shouldRedeem?: string | null,
  uuid?: string | null,
}



const App: React.FC<ChatProps> = () => {

  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [formName, setFormName] = useState<string | null>(null);
  const [shouldRedeem, setShouldRedeem] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [cookiePresent, setCookiePresent] = useState(false);
  const END_SURVEY = `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
  useEffect(() => {
    const isBrowser = typeof window !== "undefined"
    if (isBrowser) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      let endpoint = params.endpoint;
      let formName = params.formName;
      let shouldRedeem = params.status;
      let uuid = params.uid;

      setUuid(uuid)
      setShouldRedeem(shouldRedeem);
      setEndpoint(endpoint);
      setFormName(formName);

      if (formName && document.cookie.includes(`SESSIONFORM${formName}=${formName}`)) {
        setCookiePresent(true)
      }
    }
  }, []);
  
  return (
    <div className="App">
      <NavBar />
      {endpoint && formName && !cookiePresent ?(
        <SymplerChat endpoint={endpoint} formName={formName} shouldRedeem={shouldRedeem} uuid={uuid} />
      ):
      <div style={{
        padding: '20px',
        width: '80%',
        textAlign: 'center',
        position: 'absolute',
        right: 0,
        top: '50%',
      }}>
        <h2>{END_SURVEY}</h2>
      </div>
      }
    </div>
  );
}

export default App;