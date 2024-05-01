import React, {useEffect, useMemo, useState} from 'react';
import {Widget, addResponseMessage, setQuickButtons, addUserMessage, toggleWidget, toggleMsgLoader, addLinkSnippet, renderCustomComponent, toggleInputDisabled} from 'react-chat-widget-custom';
import 'react-chat-widget-custom/lib/styles.css';
import axios from 'axios';
import SliderInput from './slider/slider';
import SelectBoxes from './selectBoxes/selectBoxes';

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
        tooltip: string,
		    defaultValue: string,
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
  urlParams?: string | null
}
interface formVariablesProps {
  key: string,
  value: string,
}


const SymplerChat: React.FC<ChatProps> = ({formName, endpoint, shouldRedeem, uuid, uidName, urlParams}) => {
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
  const [continueToForm, setContinueToForm] = useState(false)
  const [rejectionLink, setRejectionLink] = useState<string>()


  const END_SURVEY = useMemo(() => {
    // Check form language
    if (formIoData && formIoData.data.tags.length > 0) {
      if (formIoData.data.tags.includes('japanese')) {
        return `ありがとうございます！この調査へのご興味に感謝します。現時点ではもう質問はありませんが、将来のプロジェクトでまたお話できることを願っています。`
      } else if (formIoData.data.tags.includes('french')) {
        return `D'accord, merci beaucoup ! Nous n'avons pas d'autres questions à vous poser pour le moment, mais nous espérons pouvoir bientôt vous en parler dans le cadre d'une autre étude. Passe une bonne journée!`
      } else if (formIoData.data.tags.includes('arabic')) {
        return `شكرًا جزيلاً على اهتمامك بإجراء هذا الاستطلاع! ليس لدينا أية أسئلة أخرى لكِ في هذا الوقت، ولكننا نأمل أن نتحدث إليكِ مرة أخرى في مشروع مستقبلي:`
      } else if (formIoData.data.tags.includes('spanish')) {
        return `¡Muchas gracias por su interés en participar en esta encuesta! En este momento no tenemos más preguntas, pero esperamos volver a hablar con usted en un proyecto futuro! `
      } else if (formIoData.data.tags.includes('korean')) { 
        return `본 설문조사에 참여해 주셔서 대단히 감사합니다! 현재로서는 더 이상 질문이 없지만 향후 다른 프로젝트에서 다시 이야기할 수 있기를 바랍니다 : `
      } else if (formIoData.data.tags.includes('german')) {
        return `Vielen Dank für Ihr Interesse an dieser Umfrage! Wir haben zu diesem Zeitpunkt keine weiteren Fragen an Sie, aber wir hoffen, bei einem zukünftigen Projekt wieder mit Ihnen sprechen zu können : ` 
      } else {
        return `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
      }
    } else {
      return `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
    }
  }, [formIoData])


  useEffect(() => {
    if(!formIoData && !continueToForm)
    axios.get(formIoUrl).then(res => {
      const fioData: FormIoResponse = res
      // if(!urlParams || urlParams === null || !fioData || !continueToForm || !formSubmissionId) {
      //   return;
      // }
      let params = JSON.parse(urlParams ? urlParams : '')
      if(Object.keys(params).length > 2) {
        let components: Object[] = []
        for (let i=0; i<Object.keys(params).length; i++) {
          let key = Object.keys(params)[i];
          if (!fioData.data.components.find(c => c.key === key) && key !== "formName" && key !== "endpoint") {
            let component = {
              "input": true,
              "tableView": true,
              "inputType": "text",
              "inputMask": "",
              "label": key,
              "key": key,
              "placeholder": "",
              "prefix": "",
              "suffix": "",
              "multiple": false,
              "defaultValue": "",
              "protected": false,
              "unique": false,
              "persistent": true,
              "validate": {
                  "required": false,
                  "minLength": "",
                  "maxLength": "",
                  "pattern": "",
                  "custom": "",
                  "customPrivate": false
              },
              "conditional": {
                  "show": "",
                  "when": null,
                  "eq": ""
              },
              "type": "textfield",
              "tags": [],
              "lockKey": true,
              "isNew": false
            }
            components.push(component)
          }
        }
        const createField = async() => {
          try {
            let login = await axios.get("https://dash-api.sympler.co/api/v1/formiotoken")
            let token = login.data.data['x-jwt-token'];
            
            await axios.put(`https://forms.sympler.co/form/${fioData.data._id}`,
              {
                  "components": [...components, ...fioData.data.components]
              },
              {
                headers: {
                  'x-jwt-token': token
                }
              },
            );
            setContinueToForm(true)
            try {
              let res = await axios.get(formIoUrl)
              setFormIoData(res)
            } catch (error) {
              console.error('get error', error)
            }
          } catch (error) {
            console.error(error)
          }
        }
        if (components.length > 0) {
          createField()
        } else {
          setFormIoData(fioData)
          setContinueToForm(true)
        }
      } else {
        setFormIoData(fioData)
        setContinueToForm(true)
      }
    }).catch(error => {
      console.error('get error', error)
    })
  }, [urlParams, formIoData, continueToForm, formSubmissionId])

  useEffect(() => {
    if (formName && document.cookie.includes(`SESSIONFORM${formName}=${formName}`)) {
      setCookiePresent(true)
      setIndex(1000)
    }
    setCookieCheck(true)
  },[formName])
  
  useEffect(() => {
    const getIp = async() => {
      try {
        // const ipResponse = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a');
        const ipResponse = await axios.get(`https://ipinfo.io?token=36639d7493f191`)
        setLocation(ipResponse.data)
        const ip = ipResponse.data.ip
        const vpnCheck = await axios.get(`https://dash-api.sympler.co/api/v1/vpncheck/${ip}`);
        if (vpnCheck.data.response.block === 1) {
          setIsVpn(true)
          if (!cookiePresent) {
            setIndex(1001)
            toggleMsgLoader()
            setTimeout(() => {
              toggleMsgLoader()
            }, 3000)
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
      // if (index < formIoData?.data.components.length - 1) {
      //   toggleMsgLoader()
      // }
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
        // axios.get(`${formIoUrl}/submission/${formIoData.data._id}`).then(res => {
        // }).catch(async error => {
          const key = formIoData.data.components[index].key
          const obj: any = {};
          obj[key] = message          
          await axios.post(`${formIoUrl}/submission`, {
            data: {
              ...obj
            }
          }).then(result => {
            setFormSubmissionId(result.data._id)
            setSessionStarted(true)
            setIndex(index + 1)
            setSubmit(false)
          }).catch(error => {
            console.error('error', error)
          })
        // })
      } else if (formIoData.data._id && sessionStarted) {
        // Get the previous submissions
        axios.get(`${formIoUrl}/submission/${formSubmissionId}`).then(async res => {
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
            const blob = await base64Response.blob();
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
        if (!inputDisabled) {
          toggleInputDisabled();
          setInputDisabled(true)
        }
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
      } else if (formIoData.data.components[index].label.includes('RejectionLink')) {
        setSubmit(true)
        let link = ""
        if (urlParams && Object.keys(JSON.parse(urlParams)).length > 2) {
          // For swagbucks code
          let keys = Object.keys(JSON.parse(urlParams ? urlParams : ''));
          if (formIoData.data.components[index].defaultValue) {
            let key = keys.indexOf('transaction_id')
            let value = Object.values(JSON.parse(urlParams ? urlParams : ''))[key] as string
            link = formIoData.data.components[index].defaultValue?.replace('id=1234', `id=${value}` )
          }
        } else {
          link = formIoData.data.components[index].defaultValue?.replace('id=1234', `id=${formSubmissionId}` )
        }
        setRejectionLink(link)
        await submitData(formIoData.data.components[index].defaultValue, index)
        return
      } else if (formIoData.data.components[index].label.includes('GetLocation')) {
        setSubmit(true)
        try {
          if (!location) {
            // let l = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a')
            const l = await axios.get(`https://ipinfo.io?token=36639d7493f191`)
            setLocation(l.data)
            if (l) {
              // await submitData(l.data?.country_name, index)
              await submitData(l.data?.country, index)
              return
            } else {
              await submitData('Error getting location information', index)
              return
            }
          } else {
            // await submitData(location?.country_name, index)
            await submitData(location?.country, index)
            return
          }
        } catch (error) {
          console.error('Error ', error)
          await submitData('Error getting location information', index)
          return
        }
      
      } else if (formIoData.data.components[index].label.includes('StateProvince')){
        if (!location) {
          // let l = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a')
          const l = await axios.get(`https://ipinfo.io?token=36639d7493f191`)
          setLocation(l.data)
        }
        // if (!formIoData.data.components[index].data.values.map(v => v.label.toLowerCase()).includes(location?.state_prov.toLowerCase()) ) {
        if (!formIoData.data.components[index].data.values.map(v => v.label.toLowerCase()).includes(location?.region.toLowerCase()) ) {
          if (!isVpn) {
            setIndex(1000)
          }
          if (!inputDisabled) {
            toggleInputDisabled()
            setInputDisabled(true)
          }
          return
        } else {
          // await submitData(location?.state_prov, index)
          await submitData(location?.region, index)
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
      } else if (urlParams && Object.keys(JSON.parse(urlParams)).length > 2){
        let keys = Object.keys(JSON.parse(urlParams ? urlParams : ''));
        if (keys.includes(formIoData.data.components[index].label)) {
          setSubmit(true)
          let key = keys.indexOf(formIoData.data.components[index].label)
          let value = Object.values(JSON.parse(urlParams ? urlParams : ''))[key] as string
          await submitData(value, index)
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

        let responseText = formIoData.data.components[index].label
        if (formIoData.data.components[index].tooltip !== "") {
          responseText = formIoData.data.components[index].tooltip
        }
        if (formIoData.data.components[index].label.match(/{{(.*?)}}/g)) {
          let matches = formIoData.data.components[index].label.match(/{{(.*?)}}/g);

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
        
        let typingTime = 1000 + responseText.length;
        if (responseText.length > 150) {
          typingTime = 1500 + responseText.length;
        } else if (responseText.length > 500) {
          typingTime = 3000 + responseText.length;
        }
        toggleMsgLoader()
        setTimeout(() => {
          addResponseMessage(responseText)
          toggleMsgLoader()
        }, typingTime)
        if(formIoData.data.components[index].placeholder !== '' && formIoData.data.components[index].placeholder !== undefined && shouldSendRedemptionLink) {
          const name = uidName ?? 'uid';
          let redemptionLink: string | undefined;
          if (uuid) {
            redemptionLink = formIoData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${uuid}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          } else if (formIoData.data.components[index].placeholder.includes('transaction_id')) {
            //////////////// For swagbucks code
            console.log('testing')
            if (urlParams && Object.keys(JSON.parse(urlParams)).length > 2) {
              let keys = Object.keys(JSON.parse(urlParams ? urlParams : ''));
              let key = keys.indexOf('transaction_id')
              let value = Object.values(JSON.parse(urlParams ? urlParams : ''))[key] as string
              redemptionLink = formIoData.data.components[index].placeholder.replace(`id=1234`, `id=${value}`);
            } else {
              redemptionLink = formIoData.data.components[index].placeholder.replace(`id=1234`, `id=${formSubmissionId}`);
            }
          } else {
            redemptionLink = formIoData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${formSubmissionId}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          }
          console.log(redemptionLink)
          // if (uuid && shouldRedeem && shouldRedeem !== '2' && shouldRedeem !== '3' && shouldRedeem === '1'){
          //   redemptionLink = formIoData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${uuid}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          // }
          // console.log('redemption link', redemptionLink);
          // console.log(`should redeem ${shouldRedeem}`);
          // console.log(`uuid ${uuid}`);
          // if ((!shouldRedeem && !uuid) || (uuid && shouldRedeem && shouldRedeem !== '2' && shouldRedeem !== '3' && shouldRedeem === '1')){
          setTimeout(() => {
            if (redemptionLink) {
              addLinkSnippet({
                title: '',
		linkMask: "Click Here!",
                link: redemptionLink,
                target: '_blank'
              })
            }
          }, typingTime)
    

        }
        if (formIoData.data.components[index].type === "selectboxes") {
          let labels = formIoData.data.components[index].values
          const sliderResponse = async (value: string) => {
            addUserMessage(value)
            await submitData(value, index)
          }
          if (!inputDisabled) {
            toggleInputDisabled();
            setInputDisabled(true)
          }
          setTimeout(() => {
            renderCustomComponent(SelectBoxes, {labels: labels, confirmValue: sliderResponse}, false);
          }, typingTime + 10)
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
          setTimeout(() => {
            renderCustomComponent(SliderInput, {min: 0, max: labels.length - 1, labels: labels, confirmValue: sliderResponse}, false);
          }, typingTime - 10)
        }
        if (formIoData.data.components[index].data) {
          if(!inputDisabled) {
            toggleInputDisabled();
            setInputDisabled(true)
          }
          setEndSurveyResponses(formIoData.data.components[index].data.values.filter(v => v.value.includes('END_SURVEY') ? v : null).map(v => v.label))
          setOtherResponses(formIoData.data.components[index].data.values.filter(v => v.value === 'OTHER' ? v : null).map(v => v.label))
          formIoData.data.components[index].data.values.map(v => v.value = v.label)
          console.log('here they are', formIoData.data.components[index].data ?? [])
          setTimeout(() => {
            setQuickButtons(formIoData.data.components[index].data.values ?? [])
          }, typingTime - 10)
        } else {
          setQuickButtons([])
          setTimeout(() => {
          }, typingTime)
        }
        if (message) {
          await submitData(message, index)
        }
      } else {
        toggleMsgLoader()
        setTimeout(() => {
          toggleMsgLoader()
		      if (!rejectionLink){
                addResponseMessage(END_SURVEY)
          } else {
            addLinkSnippet({
              title: END_SURVEY,
	            linkMask: "Click Here!",
              link: rejectionLink,
              target: '_blank'
            })
          }
        }, 1500)
        setQuickButtons([])
        // if (!inputDisabled) {
        //   toggleInputDisabled()
        //   setInputDisabled(true)
        // }
      }
     
    }
  }

  useEffect(() => {
    askQuestion()
  }, [index, formIoData])



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
