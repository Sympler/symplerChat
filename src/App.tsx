import React, {useEffect, useState} from 'react';
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
  urlParams?: string | null,
  urlFormSubmissionId?: string | null,
}



const App: React.FC<ChatProps> = () => {

  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [formName, setFormName] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<any | null>(null);
  const [shouldRedeem, setShouldRedeem] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [uidName, setUidName] = useState<string | null>(null);
  const [urlParams, setUrlParams] = useState<string | null>(null)
  const [urlformSubmissionId, setUrlFormSubmissionId] = useState('')

  useEffect(() => {
    const isBrowser = typeof window !== "undefined"
    if (isBrowser) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      let endpoint = params.endpoint;
      let formName = params.formName;
      let shouldRedeem = params.status;
      let uidName = params.uidName;
      let uuid: string | null = null;
      if (uidName) {
        uuid = params[uidName];
      }
      if (params && params.formSubmissionId) {
        setUrlFormSubmissionId(params.formSubmissionId)
        delete params.formSubmissionId
      }
      setUrlParams(JSON.stringify(params))
      setUuid(uuid)
      setUidName(uidName);
      setShouldRedeem(shouldRedeem);
      setEndpoint(endpoint);
      setFormName(formName);

      const jsonBase64 = params.json;
      if (jsonBase64) {
        const decodedJson = atob(jsonBase64);
        const parsedJson = JSON.parse(decodedJson);


        console.log(`parsedJson: `, parsedJson);

        setJsonData(parsedJson);
        if (parsedJson?.endpoint) {
          setEndpoint(parsedJson.endpoint);
        }
        if (parsedJson?.formName) {
          setFormName(parsedJson.formName);
        }
        if (parsedJson?.status) {
          setShouldRedeem(parsedJson.status);
        }
        if (parsedJson?.uidName) {
          setUuid(parsedJson.uidName);
        }
      }
    }
  }, []);

  useEffect(() => {
    
  }, [jsonData]);


  return (
    <div className="App">
      <NavBar />
      {endpoint && formName ?(
        <SymplerChat 
          endpoint={endpoint} 
          formName={formName} 
          shouldRedeem={shouldRedeem} 
          uuid={uuid} 
          uidName={uidName} 
          urlParams={urlParams} 
          urlFormSubmissionId={urlformSubmissionId} 
          jsonData={jsonData}
        />
      ): null}
    </div>
  );
}

export default App;