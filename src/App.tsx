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
  const [isVpn, setIsVpn] = useState(false);

  const END_SURVEY = `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
  const VPN_USER = `Please disable your vpn to continue with the survey.`
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

  useEffect(() => {
    const getIp = async() => {
      try {
        const ipResponse = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a');
        const ip = ipResponse.data.ip
        const vpnCheck = await axios.get(`https://dash-api.sympler.co/api/v1/vpncheck/${ip}`);
        if (vpnCheck.data.response.block === 1) {
          setIsVpn(true)
        }
      } catch (error) {
        console.error(error)
      }
    }
    getIp()
    
  },[])

  return (
    <div className="App">
      <NavBar />
      {endpoint && formName && !cookiePresent && !isVpn ?(
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
        <h2>{isVpn ? VPN_USER : END_SURVEY}</h2>
      </div>
      }
    </div>
  );
}

export default App;