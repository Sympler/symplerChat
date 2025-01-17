import React, {useEffect, useMemo, useState} from 'react';
import {Widget, addResponseMessage, setQuickButtons, addUserMessage, toggleWidget, toggleMsgLoader, addLinkSnippet, renderCustomComponent, toggleInputDisabled, toggleForcedScreenRecorder} from 'react-chat-widget-custom';
import 'react-chat-widget-custom/lib/styles.css';
import axios from 'axios';
import SliderInput from './slider/slider';
import SelectBoxes from './selectBoxes/selectBoxes';
import Dropdown from './dropdown/dropdown';
import ImageRenderer from './imageRenderer/imageRenderer';
import VideoRenderer from './videoRenderer/videoRenderer';
import * as Sentry from "@sentry/react";

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
        inputMask: string,
        prefix: string;
        suffix: string;
        tooltip: string,
		    defaultValue: string,
        placeholder: string,
        description: string,
        tableView: boolean,
        disabled?: boolean,
        type: string,
        tags: string[],
        properties: {
          [key: string]: string
        }
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
  jsonData?: any
  formName?: string,
  endpoint?: string
  shouldRedeem?: string | null,
  uuid?: string | null
  uidName?: string | null
  urlParams?: string | null
  urlFormSubmissionId?: string | null
}
interface formVariablesProps {
  key: string,
  value: string,
}

interface ResolvePaths {
  label: string,
  value: string
}


const SymplerChat: React.FC<ChatProps> = ({formName, endpoint, shouldRedeem, uuid, uidName, urlParams, urlFormSubmissionId, jsonData}) => {
  const [formIoData, setFormIoData] = useState<FormIoResponse>()
  const [sessionStarted, setSessionStarted] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [index, setIndex] = useState(0)
  const [inputDisabled, setInputDisabled] = useState(false);
  const [shouldSendRedemptionLink, setShouldSendRedemptionLink] = useState(true);
  const [endSurveyResponses, setEndSurveyResponses] = useState([''])
  const [otherReponses, setOtherResponses] = useState([''])
  const [surveyBlock, setSurveyBlock] = useState(false)
  const [surveyBlockResponses, setSurveyBlockResponses] = useState<string[]>([])
  const [cookiePresent, setCookiePresent] = useState(false);
  const [isVpn, setIsVpn] = useState(false);
  const [formSubmissionId, setFormSubmissionId] = useState('')
  const [location, setLocation] = useState<any>();
  const [cookieCheck, setCookieCheck] = useState(false);
  const [screenerBlockEnd, setScreenerBlockEnd] = useState(false)
  const [isNumeric, setIsNumeric] = useState(false)
  // const [END_SURVEY, SET_END_SURVEY] = useState(`Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`)
  const VPN_USER = `Please disable your vpn and refresh the page to continue with the survey.`
  // const formIoUrl = `https://${endpoint}.form.io/${formName}`
  const formIoUrl = `https://forms.sympler.co/${formName}`
  const [formVariables, setFormVariables] = useState<Array<formVariablesProps>>([])
  const newDate = new Date().toString();
  const [continueToForm, setContinueToForm] = useState(false)
  const [rejectionLink, setRejectionLink] = useState<string>()
  const [hasLoadedUserResponses, setHasLoadedUserResponses] = useState(false)
  const [initialized, setInitialized] = useState({queryParams: false, repeatRespondents: false, session: false, ip: false})
  const [canToggleInput, setCanToggleInput] = useState(false)
  const [pathResponses, setPathResponses] = useState<ResolvePaths[]>([])
  const [path, setPath] = useState("")
  const [resolvePaths, setResolvePaths] = useState<ResolvePaths[]>([])
  const [pathChanged, setPathChanged] = useState(false)
  const [imageOrder, setImageOrder] = useState('')
  const [usedRandomImages, setUsedRandomImages] = useState<string[]>([])

  useEffect(() => {
    if (jsonData) {
      const formattedData = Object.keys(jsonData).map(key => ({
        key: key,
        value: jsonData[key]
      }));
      setFormVariables([...formVariables, ...formattedData]);
    }
  }, [jsonData]);

  const setCookie = (cname: string, exdays: number, cvalue?: string) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

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
        // return `Vielen Dank für Ihr Interesse an dieser Umfrage! Wir haben zu diesem Zeitpunkt keine weiteren Fragen an Sie, aber wir hoffen, bei einem zukünftigen Projekt wieder mit Ihnen sprechen zu können : ` 
        return `Danke für die Antwort. Wir haben zu diesem Zeitpunkt keine weiteren Fragen an Sie. Sie können dieses Fenster jetzt schließen.`
      } else {
        return `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
      }
    } else {
      return `Okay, thanks so much! We don't have any other questions for you at this time, but we hope to talk to you in another study soon. Have a great day!`
    }
  }, [formIoData])


  const checkForQueryParams = async () => {
    await axios.get(formIoUrl).then(res => {
      const fioData: FormIoResponse = res
      let params = JSON.parse(urlParams ? urlParams : '')
      if(Object.keys(params).length > 2) {
        let components: Object[] = []
        for (let i=0; i<Object.keys(params).length; i++) {
          let key = Object.keys(params)[i];
          if (!fioData.data.components.find(c => c.key === key || c.key === key + 'url_param') && key !== "formName" && key !== "endpoint") {
            let component = {
              "input": true,
              "tableView": true,
              "label": key,
              "key": key + 'url_param',
              "protected": false,
              "unique": false,
              "persistent": true,
              "type": "hidden",
              "tags": [],
              "conditional": {
                 "show": "",
                 "when": null,
                 "eq": ""
            },
              "properties": {},
              "defaultValue": ""
            };
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
      setInitialized(initialized => ({queryParams: true, repeatRespondents: initialized.repeatRespondents, session: initialized.session, ip: initialized.ip}))
    }).catch(error => {
      console.error('get error', error)
    })
  }

  const checkForRepeatRespondents = () => {
    if (formName && document.cookie.includes(`SESSIONFORM${formName}=${formName}`) && formIoData && !formIoData.data.tags.includes('block_rr_off')) {
      setCookiePresent(true)
      setIndex(1000)
    }
    setCookieCheck(true)
    setInitialized(initialized => ({queryParams: initialized.queryParams, repeatRespondents: true, session: initialized.session, ip: initialized.ip}))
  }

  const addChatHistory = (responses: any, index: number) => {
    const components = formIoData?.data.components ?? []

    console.log(`components: `, components);

    for(let i=0; i<index; i++) {
      if (components[i].label !== undefined) {
        if (components[i].label === 'GetTimeZone' ||
          components[i].label === 'RejectionLink' ||
          components[i].label === 'StateProvince' ||
          components[i].label === 'GetLocation' ||
          components[i].label === 'RedemptionFlow' ||
          components[i].type === 'hidden' ||
          components[i].label === 'Path' ||
          components[i].label.includes('MediaOrder') ||
          components[i].label === 'ScreenOutuser' ||
          components[i].label === 'ScreenedOut' ||
          components[i].label === 'RandomImagePerQuestion'
        ) {
          if (components[i].label === 'Path') {
            setPath(responses[i][1])
          }
        } else if (urlParams && Object.keys(JSON.parse(urlParams)).length > 2){
          let keys = Object.keys(JSON.parse(urlParams ? urlParams : ''));
          if (keys.includes(components[i].label)) {
          } else if (components[i].type === 'hidden') {
          } else {
            addResponseMessage(components[i].label)
            addUserMessage(responses[i][1])
          }
        } else {
          addResponseMessage(components[i].label)
          if (components[i].tags && components[i].tags.length > 0 && components[i].tags.includes('images')) {
            const images = components[i].properties.images?.split(',')
            const shouldRandomize = components[i].properties.shouldRandomize?.toString() === '1'
            renderCustomComponent(ImageRenderer, {images, shouldRandomize, updateImageOrder}, false)
          }
          if (components[i].tags && components[i].tags.length > 0 && components[i].tags.includes('videos')) {
            const videos = components[i].properties.videos?.split(',')
            const shouldRandomize = components[i].properties.shouldRandomize?.toString() === '1'
            renderCustomComponent(VideoRenderer, {videos, shouldRandomize, updateImageOrder}, false)
          }
          let userMessage = responses[i][1]
          if (typeof userMessage === 'object') {
            const messageKeys = Object.keys(userMessage).filter(key => userMessage[key])
            userMessage = messageKeys.join(',')
          }
          addUserMessage(userMessage)
        }
      }
    }
  }

  const checkForSession = () => {
    if (formName && document.cookie.includes(`SUBMISSION${formName}=`) && !formSubmissionId) {
      const cookies = document.cookie.split('; ')
      cookies.map(c => {
        const cookie = c.split('=')
        let key = cookie[0]
        let value = cookie[1]
        if (key === `SUBMISSION${formName}` && index === 0) {
          setFormSubmissionId(value)
          setSessionStarted(true)
          const getIndex = async () => {
            try {
              const res = await axios.get(`${formIoUrl}/submission/${value}`)
              const responses = res.data.data
              if (responses) {
                setIndex(Object.keys(responses).length)
                setHasLoadedUserResponses(true)
                addChatHistory(Object.entries(responses), Object.keys(responses).length)
              }
              setInitialized(initialized => ({queryParams: initialized.queryParams, repeatRespondents: initialized.repeatRespondents, session: true, ip: initialized.ip}))
            } catch (error) {
              console.error(`Failed to get the submission for the checkForSession function: `, error);
            }
          }
          if (!hasLoadedUserResponses) {
            getIndex()
          }
        }
      })
    } else if (urlFormSubmissionId && urlFormSubmissionId !== '' && !formSubmissionId) {
      setFormSubmissionId(urlFormSubmissionId)
      setSessionStarted(true)
      const getIndex = async () => {
        try {
          const res = await axios.get(`${formIoUrl}/submission/${urlFormSubmissionId}`)
          const responses = res.data.data
          if (responses) {
            setIndex(Object.keys(responses).length)
            setHasLoadedUserResponses(true)
            addChatHistory(Object.entries(responses), Object.keys(responses).length)
          }
        } catch (error) {
          console.error(`Failed to get the submission for the checkForSession function: `, error);
        }
        setInitialized(initialized => ({queryParams: initialized.queryParams, repeatRespondents: initialized.repeatRespondents, session: true, ip: initialized.ip}))
      }
      if (!hasLoadedUserResponses) {
        getIndex()
      }
    } else if (formSubmissionId) {
      setCookie(`SUBMISSION${formName}`, 365, formSubmissionId)
    }
  }

  const getIp = async () => {
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
    setInitialized(initialized => ({queryParams: initialized.queryParams, repeatRespondents: initialized.repeatRespondents, session: initialized.repeatRespondents, ip: true}))
  }

  const isInitialized = () => {
    if (initialized.queryParams === true &&
        initialized.repeatRespondents === true &&
        initialized.session === true &&
        initialized.ip === true
    ) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    if(!formIoData && !continueToForm)
    checkForQueryParams()
  }, [urlParams, formIoData, continueToForm, formSubmissionId])

  useEffect(() => {
    if (formIoData && initialized.repeatRespondents === true)
    checkForSession()
  }, [formSubmissionId, formIoData, initialized])

  useEffect(() => {
    if (formName && formIoData)
    checkForRepeatRespondents()
  },[formName, formIoData])


  useEffect(() => {
    if (cookieCheck) {
      getIp()
    }
  },[cookieCheck])

  function updateImageOrder(order: string) {
    setImageOrder(order)
  }

  function playClick() {
    try {
      var audio = new Audio('/click.wav');
      var playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented
          // We don't need to do anything here, just catching the error silently
          console.debug('Audio playback was prevented:', error);
        });
      }
    } catch (error) {
      console.debug('Audio playback error:', error);
    }
  }

  const screenOutUser = async () => {
    if (formIoData)
    await axios.get(`${formIoUrl}/submission/${formSubmissionId}`).then(async res => {
      const previousData = res.data.data
      // const key = formIoData.data.components[index].key
      const obj: any = {};
      obj['screenedOut'] = true;
      axios.put(`${formIoUrl}/submission/${formSubmissionId}`, {
        data: {
          ...previousData,
          ...obj,
        }
      }).catch((error) => console.error(error))

    })
  }

  const savePath = async (pathValue: string) => {
    if (formIoData)
      await axios.get(`${formIoUrl}/submission/${formSubmissionId}`).then(async res => {
        const previousData = res.data.data
        // const key = formIoData.data.components[index].key
        const obj: any = {};
        obj['path'] = pathValue;
        axios.put(`${formIoUrl}/submission/${formSubmissionId}`, {
          data: {
            ...previousData,
            ...obj,
          }
        }).catch((error) => console.error(error))
    })
  }

  const submitData = async (message: string, index: number, endResponses?: string[], pResponses?: ResolvePaths[]) => {
    if (formIoData) {
      toggleForcedScreenRecorder(false)
      let surveyResponses: string[] = []
      if (surveyBlock || screenerBlockEnd) {
        setSurveyBlockResponses([...surveyBlockResponses, message.trim()[0]]) //This code expects the quick reply message to either be a letter or be prefixed by a letter e.g. A. option1, B. option2
        surveyResponses = [...surveyBlockResponses, message.trim()[0]]
        setScreenerBlockEnd(false)
      }

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
            setIndex(index => index + 1)
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
                // if (formIoData.data.components[index].disabled === true) {
                //   toggleInputDisabled(false)
                // }
                setIndex(index => index + 1)
                setSubmit(false)
              }).catch(error => {
                Sentry.captureException(error);
                console.error('error', error)
              })
            }).catch(error => {
              console.error('error sending the image to sympler', error)
            })
          } else {
            obj[key] = message
            // if (path && path !== "") {
            //   obj['path'] = path
            // }

            if (
              formIoData.data.components[index].tags && 
              formIoData.data.components[index].tags.length > 0 && 
              (formIoData.data.components[index].tags.includes('images') ||
                formIoData.data.components[index].tags.includes('videos'))
            ) {
              obj[`mediaOrder${key.trim()}`] = imageOrder
            }

            if (
              formIoData.data.components[index].tags && 
              formIoData.data.components[index].tags.length > 0 && 
              (formIoData.data.components[index].tags.includes('images') ||
                formIoData.data.components[index].tags.includes('videos'))
            ) {
              obj[`randomImagePerQuestion`] = usedRandomImages.join(',')
            }

            axios.put(`${formIoUrl}/submission/${formSubmissionId}`, {
              data: {
                ...previousData,
                ...obj,
              }
            }).then(result => {
              if (formIoData.data.components[index].tags && formIoData.data.components[index].tags.length > 0 && formIoData.data.components[index].tags.includes('numeric')) {
                let rangeStart = Number(formIoData.data.components[index].properties.rangeStart)
                let rangeEnd = Number(formIoData.data.components[index].properties.rangeEnd)
                let number = Number(message)
                if (rangeStart !== undefined && rangeEnd !== undefined) {
                  if (number < rangeStart || number > rangeEnd) {
                    screenOutUser()
                    setIndex(1000)
                    return
                  }
                }
              }


              // Set user's path if there is a path associated with a response
              let newPathChange = false
              if (
                  ((pathResponses && pathResponses.filter(p => p.label.trim() === message.trim())) ||
                  (pResponses && pResponses.filter(p => p.label.trim() === message.trim())))
                  &&
                  !(endSurveyResponses.includes(message) ||
                  endResponses?.includes(message)))
              {
                  let p = pathResponses.find(p => p.label.trim().includes(message.trim())) //?.value.replace('[', '').replace(']', '')
                  if (p === undefined && pResponses) {
                    p = pResponses.find(p => message.trim().includes(p.label.trim()))
                  }
                  if (p && p.value) {
                    setPath(p.value.replace('[', '').replace(']', ''))
                    savePath(p.value.replace('[', '').replace(']', ''))
                    if (path !== '' && path !== p?.value.replace('[', '').replace(']', '')) { //Ensure that the user is still on the same path through every path question
                      setPathChanged(true)
                      newPathChange = true
                    } else {
                      setPathChanged(false)
                      newPathChange = false
                    }

                    if (path === '' && p) {
                      newPathChange = true
                      setPathChanged(true)
                    }
                  }
              }
          
              const answers = message.split(',').map(m => m.trim()).filter(m => m !== '')

              let screenOut = false
              let endSurveyAnswers = []
              let validResponses = []
              if ((endResponses && endResponses.length > 0 && endResponses.every(response => response !== '')) || (endSurveyResponses && endSurveyResponses.length > 0 && endSurveyResponses.every(response => response !== ''))) {
                for (const answer of answers) {
                  if (endSurveyResponses.includes(answer) || endResponses?.includes(answer) || endResponses?.find(e => message.includes(e)) || endSurveyResponses?.find(e => message.includes(e))) {
                    screenOut = true
                    endSurveyAnswers.push(answer)
                  } else {
                    validResponses.push(answer)
                  }
                }
              }
              if (endSurveyResponses.includes(message) || endResponses?.includes(message) || endResponses?.find(e => message.includes(e)) || endSurveyResponses?.find(e => message.includes(e))) {
                screenOut = true
              }

              // if (screenOut && answers.length > endSurveyResponses.length) {
              if (screenOut && validResponses.length > 0 && ((endResponses && endResponses?.length > 0) || endSurveyResponses.length > 0)) {
                // Cancel the screening if the user has selected at least one response that doesn't end the survey
                screenOut = false
              }

              if (screenOut) {
                setIndex(1000)
                screenOutUser()
                toggleInputDisabled(true)
              } else if (message.includes('invalidUrl')) {
                screenOutUser()
                setIndex(1000)
                toggleInputDisabled(true)
              } else if (surveyResponses.length > 0 && !surveyResponses.every(r => r === surveyResponses[0])) {
                screenOutUser()
                setIndex(1000)
              } else if (
                otherReponses.find(o => endSurveyResponses.map(e => e.trim() === o.trim())) && 
                !formIoData.data.components[index]?.data?.values.find(v => v?.value === message)
              ) {
                screenOutUser()
                setIndex(1000)
              } else if (path && resolvePaths && resolvePaths.length > 0) { //  End study if a specific path is required to continue
                if (
                  !resolvePaths.find(r => r.label.trim() === message.trim())?.value.includes(path) &&
                  pathChanged === false &&
                  newPathChange === false
                ) {
                  screenOutUser()
                  setIndex(1000)
                  toggleInputDisabled(true)
                  setResolvePaths([])
                } else {
                  setIndex(index => index + 1)
                }
              }
              else {
                // if (formIoData.data.components[index].disabled === true) {
                //   toggleInputDisabled(false)
                // }
                setIndex(index => index + 1)
                setOtherResponses([''])
                // setEndSurveyResponses(['']) // Clear out end responses in case questions have duplicate labels
              }

              setSubmit(false)
              // toggleInputDisabled(false);
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

  const askQuestion = async (message?: string, ) => {
    if (formIoData) {
      setOtherResponses([''])

      const formData = {...formIoData};
      
      const currentIndex = formData.data.components[index];


      // Logic for disabling the bot based on the disableBot property in the form question's custom properties
      // It can look for disableBot = true or check a condition from the form variables passed in through the JSON data
      if (currentIndex?.properties?.hasOwnProperty('disableBot')) {
        if (currentIndex?.properties?.disableBot === 'true') {
          console.log(`has disableBot`);
          return;
        } else if (currentIndex?.properties?.disableBot.includes('condition')) {
          const split1 = currentIndex?.properties?.disableBot.split('condition | ')[1];
          if (split1 && split1.length > 1) {
            const property = split1.split('=')[0];
            const value = split1.split('=')[1];
            if (formVariables.find(v => v.key === property && v.value === value)) {
              console.log(`has disableBot from condition`)
              return;
            }
          }
        }
      }
      
      toggleInputDisabled(false)
      // toggleForcedScreenRecorder(false)

      if (index >= formData?.data.components.length - 1) {
        toggleInputDisabled(true);
        if (index !== 1001) {
          setCookie(`SESSIONFORM${formName}`, 365, formName)
          // @ts-ignore
          window.gtag("event", `${formData.data.title} Form Completed`, {
            event_category: "Form",
            event_label: formData.data.title
          });
        }
      } else if (formData.data.components[index].label.includes('GetTimeZone')) {
        setSubmit(true)
        let timezone = newDate.slice(newDate.indexOf('('), newDate.lastIndexOf(')') + 1)
        await submitData(timezone.replace('(', '').replace(')', ''), index)
        return
      } else if (formData.data.components[index].label.includes('RejectionLink')) {
        setSubmit(true)
        let link = ""
        if (urlParams && Object.keys(JSON.parse(urlParams)).length > 2) {
          // For swagbucks code
          let keys = Object.keys(JSON.parse(urlParams ? urlParams : ''));
          if (formData.data.components[index].defaultValue) {
            let key = keys.indexOf('transaction_id')
            let value = Object.values(JSON.parse(urlParams ? urlParams : ''))[key] as string
            link = formData.data.components[index].defaultValue?.replace('id=1234', `id=${value}` )
          }
        } else {
          link = formData.data.components[index].defaultValue?.replace('id=1234', `id=${formSubmissionId}` )
        }
        const name = uidName ?? 'uid';
        if (uuid) {
          link = formData.data.components[index].defaultValue.replace(`${name}=1234`, `${name}=${uuid}`).replace('campaign=1234', `campaign=${formData.data.title}`).replace(/ /g,"-");
        }
        setRejectionLink(link)
        await submitData(formData.data.components[index].defaultValue, index)
        return
      } else if (formData.data.components[index].label.includes('GetLocation')) {
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
      
      } else if (formData.data.components[index].label.includes('StateProvince')){
        if (!location) {
          // let l = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a')
          const l = await axios.get(`https://ipinfo.io?token=36639d7493f191`)
          setLocation(l.data)
        }
        // if (!formIoData.data.components[index].data.values.map(v => v.label.toLowerCase()).includes(location?.state_prov.toLowerCase()) ) {
        if (!formData.data.components[index].data.values.map(v => v.label.toLowerCase()).includes(location?.region.toLowerCase()) ) {
          if (!isVpn) {
            setIndex(1000)
          }
          toggleInputDisabled(true)
          return
        } else {
          // await submitData(location?.state_prov, index)
          await submitData(location?.region, index)
          return
        }
      } else if (formData.data.components[index].label.includes('RedemptionFlow')) {
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
      } else if (formData.data.components[index].label.includes('Path')) {
        setSubmit(true)
        await submitData(" ", index)
        return
      } else if (formData.data.components[index].label.includes('MediaOrder')) {
        setSubmit(true)
        await submitData(" ", index)
        return
      } else if (formData.data.components[index].label.includes('RandomImagePerQuestion')) {
        setSubmit(true)
        await submitData(" ", index)
        return
      } else if (formData.data.components[index].label.includes('ScreenedOut')) {
        setSubmit(true)
        await submitData(" ", index)
        return
      } else if (urlParams && Object.keys(JSON.parse(urlParams)).length > 2){
        // Save url parameter values
        let keys = Object.keys(JSON.parse(urlParams ? urlParams : ''));
        if (keys.includes(formData.data.components[index].label)) {
          setSubmit(true)
          let key = keys.indexOf(formData.data.components[index].label)
          let value = Object.values(JSON.parse(urlParams ? urlParams : ''))[key] as string
          await submitData(value.slice(0, 10000), index)
          return
        } else if (formData.data.components[index].type === 'hidden') {
          setSubmit(true)
          await submitData(`Missing url parameter: ${formData.data.components[index].label}`, index)
          return
        }
      } else if (formData.data.components[index].type === 'hidden') {
        // Do not show hidden form fields - should only occur if a url parameter is missing fromt the url
        setSubmit(true)
        await submitData(`Missing url parameter: ${formData.data.components[index].label}`, index)
        return
      }
      if (message && submit === false) {
        await submitData(message, index)
        // toggleInputDisabled(false)
        if (formData.data.components[index].data && Object.keys(formData.data.components[index].data).length > 0) {
          toggleInputDisabled(true);
          setQuickButtons(formData.data.components[index].data.values ?? [])
        } else {
          setQuickButtons([])
        }
      } else if (index !== 1000) {
        let responseText = currentIndex?.label

        if (formData.data.components[index]?.properties?.requireScreenRecord === 'true') {
          toggleForcedScreenRecorder(true);
          responseText = formData.data.components[index].label.replaceAll('[SCREEN_RECORD]', '');
        }

        if (formData.data.components[index]?.tooltip !== "" && formData.data.components[index]?.tooltip !== undefined) {
          responseText = formData.data.components[index]?.tooltip
        }
        if (formData.data.components[index]?.label.match(/{{(.*?)}}/g)) {
          let matches = formData.data.components[index].label.match(/{{(.*?)}}/g);

          formVariables.map(v => {
            if (matches?.includes(`{{${v.key}}}`)) {
              responseText = formData.data.components[index].label.replaceAll(`{{${v.key}}}`, v.value)
            }
          })
        }
        if (formData.data.components[index]?.disabled === true) {
          toggleInputDisabled(true)
        }
        let typingTime = 1000 + responseText?.length;
        if (responseText?.length > 150) {
          typingTime = 1500 + responseText?.length;
        } else if (responseText?.length > 500) {
          typingTime = 3000 + responseText?.length;
        }
        
        if (formData.data.components[index]?.tags && formData.data.components[index]?.tags.length > 0 && formData.data.components[index]?.tags.includes('numeric') && !isNumeric) {
          setIsNumeric(true)
        } else {
          setIsNumeric(false)
        }

        toggleMsgLoader()
        setTimeout(() => {
          if (typeof responseText !== 'string') {
            console.warn('responseText is not a string:', responseText);
            Sentry.captureMessage(`Invalid responseText type: ${typeof responseText}, value: ${JSON.stringify(responseText)}`);
          }
          addResponseMessage(String(responseText || ""))
          if (index > 1) {
            playClick()
          }
          toggleMsgLoader()
        }, typingTime)
        if(formData.data.components[index]?.placeholder !== '' && formData.data.components[index]?.placeholder !== undefined && shouldSendRedemptionLink) {
          const name = uidName ?? 'uid';
          let redemptionLink: string | undefined;
          if (uuid) {
            redemptionLink = formData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${uuid}`).replace('campaign=1234', `campaign=${formData.data.title}`).replace(/ /g,"-");
          } else if (formData.data.components[index].placeholder.includes('transaction_id')) {
            //////////////// For swagbucks code
            if (urlParams && Object.keys(JSON.parse(urlParams)).length > 2) {
              let keys = Object.keys(JSON.parse(urlParams ? urlParams : ''));
              let key = keys.indexOf('transaction_id')
              let value = Object.values(JSON.parse(urlParams ? urlParams : ''))[key] as string
              redemptionLink = formData.data.components[index].placeholder.replace(`id=1234`, `id=${value}`);
            } else {
              redemptionLink = formData.data.components[index].placeholder.replace(`id=1234`, `id=${formSubmissionId}`);
            }
          } else {
            redemptionLink = formData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${formSubmissionId}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          }

          // if (uuid && shouldRedeem && shouldRedeem !== '2' && shouldRedeem !== '3' && shouldRedeem === '1'){
          //   redemptionLink = formIoData.data.components[index].placeholder.replace(`${name}=1234`, `${name}=${uuid}`).replace('campaign=1234', `campaign=${formIoData.data.title}`).replace(/ /g,"-");
          // }
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

        if (formData?.data?.components[index]?.tags && formData.data.components[index].tags.length > 0 && formData.data.components[index].tags.includes('images')) {
          let images = formData.data.components[index].properties.images.split(',')
          let shouldRandomize = currentIndex.properties.shouldRandomize?.toString() === '1'
          let selectRandom = currentIndex.properties.selectRandom?.toString() === '1'
          if (selectRandom) {
            let unusedImages = []
            for (let i=0;i<images.length;i++) {
              if (!usedRandomImages.includes(images[i])) {
                unusedImages.push(images[i])
              }
            }
            const randomImage = unusedImages[Math.floor(Math.random() * unusedImages.length)]
            images = [randomImage]
            setUsedRandomImages((previous) => [...previous, randomImage])
          }
          setTimeout(() => {
            renderCustomComponent(ImageRenderer, {images, shouldRandomize, updateImageOrder}, false)
          }, typingTime + 10)
        }

        if (formData?.data?.components[index]?.tags && formData.data.components[index].tags.length > 0 && formData.data.components[index].tags.includes('videos')) {
          let videos = formData.data.components[index].properties.videos.split(',')
          const videoShouldRandomize = formData.data.components[index].properties.shouldRandomize?.toString() === '1'
          setTimeout(() => {
            renderCustomComponent(VideoRenderer, {videos, videoShouldRandomize, updateImageOrder}, false)
          }, typingTime + 10)
        }

        if (formData?.data?.components[index]?.type === "selectboxes") {
          const originalObject = JSON.parse(JSON.stringify(formData)) as FormIoResponse
          const pResponses = originalObject?.data.components[index]?.values.filter(v => v.value.includes('[PATH_')).map(p => {
            return {value: p.value.trim(), label: p.label.trim()}
          })


          if (pResponses && pResponses.length > 0) {
            setPathResponses((previousResponses) => [...previousResponses, ...pResponses])
          }
          
          // const rPaths = originalObject?.data.components[index].data.values?.filter(v => v.value.includes('RESOLVE'))
          // setResolvePaths([...resolvePaths, ...rPaths])


          let labels = formData.data.components[index].values
          const endResponses = labels.filter(v => v.value.includes('END_SURVEY') ? v : null).map(v => v.label)
          // setEndSurveyResponses(labels.filter(v => v.value.includes('END_SURVEY') ? v : null).map(v => v.label))

          const selectBoxesResponse = async (value: string) => {
            addUserMessage(value)
            // toggleInputDisabled(false);
            await submitData(value, index, endResponses, pResponses)
          }
          toggleInputDisabled(true);
          setTimeout(() => {
            renderCustomComponent(SelectBoxes, {labels: labels, confirmValue: selectBoxesResponse}, false);
          }, typingTime + 10)
        }
        if (formData?.data?.components[index]?.type === 'dropdown') {
          let labels = formData.data.components[index].values

          const dropdownResponse = async (value: string) => {
            addUserMessage(value)
            // toggleInputDisabled(false);
            await submitData(value, index)
          }
            toggleInputDisabled(true);
          setTimeout(() => {
            renderCustomComponent(Dropdown, {labels: labels, confirmValue: dropdownResponse}, false);
          }, typingTime + 10)
        }
        if(formData?.data?.components[index]?.type === 'radio') {
          let labels = formData.data.components[index].values
          const sliderResponse = async (value: string) => {
            addUserMessage(value)
            // toggleInputDisabled(false);
            await submitData(value, index)
          }
          toggleInputDisabled(true);
          setTimeout(() => {
            renderCustomComponent(SliderInput, {min: 0, max: labels.length - 1, labels: labels, confirmValue: sliderResponse}, false);
          }, typingTime - 10)
        }
        if (formData?.data?.components[index]?.type === 'select') {
          toggleInputDisabled(true);
          const originalObject = JSON.parse(JSON.stringify(formData)) as FormIoResponse
          const pResponses = originalObject?.data.components[index].data.values.filter(v => v.value.includes('[PATH_')).map(p => {
            return {value: p.value.trim(), label: p.label.trim()}
          })
          setPathResponses((previousResponses) => [...previousResponses, ...pResponses])
          
          const rPaths = originalObject?.data.components[index].data.values?.filter(v => v.value.includes('RESOLVE'))
          setResolvePaths([...resolvePaths, ...rPaths])

          setEndSurveyResponses(originalObject.data.components[index].data.values?.filter(v => v.value.includes('END_SURVEY') ? v : null).map(v => v.label))
          setOtherResponses(originalObject.data.components[index].data.values?.filter(v => v.value.includes('OTHER') ? v : null).map(v => v.label))


          if (formData.data.components[index].data?.values?.filter(v => v.value.includes('SCREENER_BLOCK_START')).length > 0) {
            setSurveyBlock(true)
          } else if (formData.data.components[index].data?.values?.filter(v => v.value.includes('SCREENER_BLOCK_END')).length > 0) {
            setSurveyBlock(false)
            setScreenerBlockEnd(true)
          }
          formData.data.components[index].data.values?.map(v => v.value = v.label)
          setTimeout(() => {
            setQuickButtons(formData.data.components[index].data.values ?? [])
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
                toggleInputDisabled(true)
          } else {
            addLinkSnippet({
              title: END_SURVEY,
	            linkMask: "Click Here!",
              link: rejectionLink,
              target: '_blank'
            })
            toggleInputDisabled(true)
          }
        }, 1500)
        setQuickButtons([])
      }
     
    }
  }

  useEffect(() => {
    if (isInitialized())
    askQuestion()
  }, [index, formIoData, initialized])



  const hanleQuckButtonClick = (e: string) => {
    if (otherReponses.includes(e)) {
      toggleInputDisabled(false)
      setQuickButtons([])
    } else {
      // toggleInputDisabled(false)
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
        fullScreenMode={true}
        showCloseButton={false}
        isShowEmoji={true}
        emojis
        handleNewUserMessage={askQuestion}
        title="Messages"
        subtitle="Sympler"
        handleQuickButtonClicked={hanleQuckButtonClick}
        imagePreview={true}
        isNumeric={isNumeric}
      />
    </div>
  );
}

export default SymplerChat;
