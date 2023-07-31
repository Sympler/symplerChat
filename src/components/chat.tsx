import React, {useEffect, useMemo, useState} from 'react';
import {Widget, addResponseMessage, setQuickButtons, addUserMessage, toggleWidget, toggleMsgLoader, addLinkSnippet, renderCustomComponent, toggleInputDisabled} from 'react-chat-widget-custom';
import 'react-chat-widget-custom/lib/styles.css';
import axios from 'axios';
import SliderInput from './slider/slider';

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
            value: string,
          }]
        },
        input: boolean,
        key: string,
        label: string,
        placeholder: string,
        description: string,
        tableView: boolean,
        disabled?: boolean,
        type: string
        values: [{
          label: string,
          value: string,
        }]
      }
    ]
    data: any
    title: string
    _id: string
    tags: Array<string>
  }
}

interface ChatProps {
  formName?: string,
  endpoint?: string
  shouldRedeem?: string | null,
  uuid?: string | null
  uidName?: string | null
}
interface formVariablesProps {
  key: string,
  value: string,
}


const SymplerChat: React.FC<ChatProps> = ({formName, endpoint, shouldRedeem, uuid, uidName}) => {
  const [formIoData, setFormIoData] = useState<FormIoResponse>()
  const [sessionStarted, setSessionStarted] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [index, setIndex] = useState(0)
  const [inputDisabled, setInputDisabled] = useState(false);
  const [shouldSendRedemptionLink, setShouldSendRedemptionLink] = useState(true);
  const [endSurveyResponses, setEndSurveyResponses] = useState([''])
  const [otherReponses, setOtherResponses] = useState([''])
  const [cookiePresent, setCookiePresent] = useState(false);
  const [isVpn, setIsVpn] = useState(false);
  const [formSubmissionId, setFormSubmissionId] = useState('')
  const [location, setLocation] = useState<any>();
  const [cookieCheck, setCookieCheck] = useState(false);
  // const [END_SURVEY, SET_END_SURVEY] = useState(`Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`)
  const VPN_USER = `Please disable your vpn and refresh the page to continue with the survey.`
  // const formIoUrl = `https://${endpoint}.form.io/${formName}`
  const formIoUrl = `https://forms.sympler.co/${formName}`
  const [formVariables, setFormVariables] = useState<Array<formVariablesProps>>([])
  const newDate = new Date().toString();

  const END_SURVEY = useMemo(() => {
    // Check form language
    if (formIoData && formIoData.data.tags.length > 0) {
      if (formIoData.data.tags.includes('japanese')) {
        return `ありがとうございます！この調査へのご興味に感謝します。現時点ではもう質問はありませんが、将来のプロジェクトでまたお話できることを願っています。`
      } else {
        return `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
      }
    } else {
      return `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
    }
  }, [formIoData])

  useEffect(() => {
    // {{projectUrl}}/form/{{formId}}
    axios.get(formIoUrl).then(res => {
      setFormIoData(res)
    }).catch(error => {
      console.error('get error', error)
    })
  }, [])

  useEffect(() => {
    if (formName && document.cookie.includes(`SESSIONFORM${formName}=${formName}`)) {
      setCookiePresent(true)
      setCookieCheck(true)
      setIndex(1000)
    }
  },[formName])

  useEffect(() => {
    const getIp = async() => {
      try {
        const ipResponse = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a');
        setLocation(ipResponse.data)
        const ip = ipResponse.data.ip
        const vpnCheck = await axios.get(`https://dash-api.sympler.co/api/v1/vpncheck/${ip}`);
        if (vpnCheck.data.response.block === 1) {
          setIsVpn(true)
          if (!cookiePresent) {
            setIndex(1001)
            addResponseMessage(VPN_USER)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
    if (cookieCheck) {
      getIp()
    }
  },[cookieCheck])

  const submitData = async (message: string, index: number) => {
    if (formIoData) {
      if (formIoData.data.components[index].description) {
        let varName = formIoData.data.components[index].description
        var startIndex = varName.indexOf("{{") + 2;
        var endIndex = varName.indexOf("}}");
        var result = varName.substring(startIndex, endIndex);

        if (formVariables.length > 0) {
          formVariables.map(v => {
            if (v.key !== result) {
              setFormVariables([...formVariables, {key: result, value: message}])
            }
          })
        } else {
          setFormVariables([{key: result, value: message}])
        }
      }
      if (formIoData.data._id && sessionStarted === false) {
        axios.get(`${formIoUrl}/submission/${formIoData.data._id}`).then(res => {
        }).catch(async error => {
          const key = formIoData.data.components[index].key
          const obj: any = {};
          obj[key] = message          
          await axios.post(`${formIoUrl}/submission`, {
            data: {
              ...obj
            }
          }).then(result => {
            // console.log('post create submission result', result)
            setFormSubmissionId(result.data._id)
            setSessionStarted(true)
            setIndex(index + 1)
            setSubmit(false)
          }).catch(error => {
            console.error('error', error)
          })
        })
      } else if (formIoData.data._id && sessionStarted) {
        // Get the previous submissions
        axios.get(`${formIoUrl}/submission/${formSubmissionId}`).then(async res => {
          // console.log('get previous submission', res)
          const previousData = res.data.data
          const key = formIoData.data.components[index].key
          const obj: any = {};
          if (key === 'GDPR') {
            let normalizedMessage = message.toLowerCase()
            if (normalizedMessage === ('no thanks') || normalizedMessage === ('no')) {
              return
            }
          }
          if (message.includes('data:')) {
            const base64Source = message.slice(message.indexOf('(') + 1, message.lastIndexOf(')'))
            const base64Response = await fetch(base64Source)
            // console.log("base64response", base64Response)
            const blob = await base64Response.blob();
            // console.log('base64 blob', blob)
            // const file = new File([blob],  `${formIoData.data.components[index].key}_fileUpload_${new Date().toISOString()}`)
            const getExtension = (type: string) => {
              interface lookUpProps {
                [key: string]: string,
              }
              const lookUp: lookUpProps =  {
                'video/mp4': '.mp4',
                'video/webm': '.webm',
                'video/ogg': '.ogg',
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
              }
              if (lookUp[type]) {
                return lookUp[type]
              } else if (type.includes('video')) {
                return '.mp4'
              } else if (type.includes('image')) {
                return '.jpg'
              } else {
                return ''
              }
            }
            const file = new File([blob],  `${formIoData.data.title.replaceAll(' ', '') + '_' + formIoData.data.components[index].key.substring(0, 30)}_fileUpload_${Date.now()}${getExtension(blob.type)}`, {type: blob.type})
            // const file = blob.type === 'video/mp4' ? new File([blob],  `${formIoData.data.components[index].key.substring(0, 30)}_fileUpload_${new Date()}.mp4`, {type: 'video/mp4'}) : new File([blob],  `${formIoData.data.components[index].key.substring(0, 30)}_fileUpload_${new Date()}`)
            // console.log('file blbo', file)
            var formData = new FormData();
            formData.append('file', file)
            toggleMsgLoader();
            await axios.post(`https://dash-api.sympler.co/api/v1/uploadimage`,
              formData,
            ).then(result => {
              // console.log('sympler result', result)
              toggleMsgLoader();
              const imageMessage = result.data.file
              obj[key] = imageMessage
              axios.put(`${formIoUrl}/submission/${formSubmissionId}`, {
                data: {
                  ...obj,
                  ...previousData
                }
              }).then(result => {
                // console.log('result from put', result)
                setIndex(index + 1)
                setSubmit(false)
              }).catch(error => {
                console.error('error', error)
              })
            }).catch(error => {
              console.error('error sending the image to sympler', error)
            })
          } else {
            obj[key] = message
            // console.log('obj on put', obj)
            // console.log('obj previous', previousData)
            // console.log('submission id', formIoData.data._id)
            axios.put(`${formIoUrl}/submission/${formSubmissionId}`, {
              data: {
                ...obj,
                ...previousData
              }
            }).then(result => {
              // console.log('result from put', result)
              // console.log('message', message)
              
              if (endSurveyResponses.includes(message)) {
                setIndex(1000)
                toggleInputDisabled()
                setInputDisabled(true)
              } else if (message.includes('invalidUrl')) {
                setIndex(1000)
                toggleInputDisabled()
                setInputDisabled(true)
              } else {
                setIndex(index + 1)
              }
              setSubmit(false)
            }).catch(error => {
              console.error('error', error)
            })
          }
        }).catch(error => {
          console.error('Could not get submission', error)
        })

      }
    }
  }

  const askQuestion = async (message?: string) => {
    if (formIoData) {
      if (index >= formIoData?.data.components.length - 1) {
        const setCookie = (cname: string, exdays: number, cvalue?: string) => {
          const d = new Date();
          d.setTime(d.getTime() + (exdays*24*60*60*1000));
          let expires = "expires="+ d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
        if (index !== 1001) {
          setCookie(`SESSIONFORM${formName}`, 365, formName)
          // console.log('all questions have been answered')
          // @ts-ignore
          window.gtag("event", `${formIoData.data.title} Form Completed`, {
            event_category: "Form",
            event_label: formIoData.data.title
          });
        }
      } else if (formIoData.data.components[index].label.includes('GetTimeZone')) {
        setSubmit(true)
        let timezone = newDate.slice(newDate.indexOf('('), newDate.lastIndexOf(')') + 1)
        await submitData(timezone.replace('(', '').replace(')', ''), index)
        return
      } else if (formIoData.data.components[index].label.includes('GetLocation')) {
        setSubmit(true)
        try {
          if (!location) {
            let l = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a')
            setLocation(l.data)
            if (l) {
              await submitData(l.data?.country_name, index)
              return
            } else {
              await submitData('Error getting location information', index)
              return
            }
          } else {
            await submitData(location?.country_name, index)
            return
          }
        } catch (error) {
          console.error('Error ', error)
          await submitData('Error getting location information', index)
          return
        }
      
      } else if (formIoData.data.components[index].label.includes('StateProvince')){
        if (!location) {
          let l = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a')
          setLocation(l.data)
        }
        if (!formIoData.data.components[index].data.values.map(v => v.label.toLowerCase()).includes(location?.state_prov.toLowerCase()) ) {
          if (!isVpn) {
            setIndex(1000)
          }
          if (!inputDisabled) {
            toggleInputDisabled()
            setInputDisabled(true)
          }
          return
        } else {
          await submitData(location?.state_prov, index)
          return
        }
      } else if (formIoData.data.components[index].label.includes('RedemptionFlow')) {
        setSubmit(true)
        try {
          if(uuid == null || shouldRedeem == null || shouldRedeem === '2' || shouldRedeem === '3' || shouldRedeem !== '1') {
            await submitData('invalidUrl', index)
            setShouldSendRedemptionLink(false)
          } else {
            await submitData('validUrl', index)
          }
          return
        } catch (error) {
          console.error('Error ', error)
          await submitData('Error', index)
          return
        }
      }
      if (message && submit === false) {
        await submitData(message, index)
        // addResponseMessage(formIoData.data.components[index].label)
        if (inputDisabled) {
          toggleInputDisabled()
          setInputDisabled(false)
        }
        if (formIoData.data.components[index].data) {
          if (!inputDisabled) {
            toggleInputDisabled();
            setInputDisabled(true)
          }
          setQuickButtons(formIoData.data.components[index].data.values ?? [])
        } else {
          setQuickButtons([])
        }
      } else if (index !== 1000) {
        // console.log('index before it adds reponse', index)
        let responseText = formIoData.data.components[index].label
        if (formIoData.data.components[index].label.match(/{{(.*?)}}/g)) {
          let matches = formIoData.data.components[index].label.match(/{{(.*?)}}/g);
          // console.log('matches', matches);
          formVariables.map(v => {
            if (matches?.includes(`{{${v.key}}}`)) {
              responseText = formIoData.data.components[index].label.replaceAll(`{{${v.key}}}`, v.value)
            }
          })
        }
        if (formIoData.data.components[index].disabled === true) {
          if (!inputDisabled) {
            toggleInputDisabled()
            setInputDisabled(true)
          }
        }
        if (inputDisabled) {
          toggleInputDisabled()
          setInputDisabled(false)
        }
        addResponseMessage(responseText)
        if(formIoData.data.components[index].placeholder !== '' && formIoData.data.components[index].placeholder !== undefined && shouldSendRedemptionLink) {
          const name = uidName ?? 'uid';
          let redemptionLink: string | undefined;
          if (uuid) {
            redemptionLink = formIoData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${uuid}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          } else {
            redemptionLink = formIoData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${formSubmissionId}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          }
          // if (uuid && shouldRedeem && shouldRedeem !== '2' && shouldRedeem !== '3' && shouldRedeem === '1'){
          //   redemptionLink = formIoData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${uuid}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          // }
          // console.log('redemption link', redemptionLink);
          // console.log(`should redeem ${shouldRedeem}`);
          // console.log(`uuid ${uuid}`);
          // if ((!shouldRedeem && !uuid) || (uuid && shouldRedeem && shouldRedeem !== '2' && shouldRedeem !== '3' && shouldRedeem === '1')){
          if (redemptionLink) {
            addLinkSnippet({
              title: '',
              link: redemptionLink,
              target: '_blank'
            })
          }

        }
        if(formIoData.data.components[index].type === 'radio') {
          let labels = formIoData.data.components[index].values
          const sliderResponse = async (value: string) => {
            addUserMessage(value)
            await submitData(value, index)
          }
          if (!inputDisabled) {
            toggleInputDisabled();
            setInputDisabled(true)
          }
          renderCustomComponent(SliderInput, {min: 0, max: labels.length - 1, labels: labels, confirmValue: sliderResponse}, false);
        }
        if (formIoData.data.components[index].data) {
          if(!inputDisabled) {
            toggleInputDisabled();
            setInputDisabled(true)
          }
          setEndSurveyResponses(formIoData.data.components[index].data.values.filter(v => v.value.includes('END_SURVEY') ? v : null).map(v => v.label))
          setOtherResponses(formIoData.data.components[index].data.values.filter(v => v.value === 'OTHER' ? v : null).map(v => v.label))
          formIoData.data.components[index].data.values.map(v => v.value = v.label)
          setQuickButtons(formIoData.data.components[index].data.values ?? [])
        } else {
          setQuickButtons([])
        }
        if (message) {
          // console.log('askquesion is being run not insided')
          // console.log('new message', message)
          await submitData(message, index)
        }
      } else {
        addResponseMessage(END_SURVEY)
        setQuickButtons([])
        if (!inputDisabled) {
          toggleInputDisabled()
          setInputDisabled(true)
        }
      }
     
    }
  }

  useEffect(() => {
    askQuestion()
  }, [index, formIoData])

  useEffect(() => {
    
  })
  // useEffect(() => {
  //   console.log('image being passed to', image)
  //   if (image.length >= 1) {
  //   }, [image])


  const hanleQuckButtonClick = (e: string) => {
    if (otherReponses.includes(e)) {
      if(inputDisabled) {
        toggleInputDisabled()
        setInputDisabled(false)
      }
      setQuickButtons([])
    } else {
      addUserMessage(e);
      askQuestion(e);
    }
  };

  useEffect(() => {
    toggleWidget();
  }, []);

  return (
    <div className="App">
      <Widget
        quickButtonsInMessage={true}
        handleNewUserMessage={askQuestion}
        title="Messages"
        subtitle="Sympler"
        handleQuickButtonClicked={hanleQuckButtonClick}
        emojis={false}
        imagePreview={true}
      />
    </div>
  );
}

export default SymplerChat;