import React, {useEffect, useState} from 'react';
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
        tableView: boolean,
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
  }
}

interface ChatProps {
  formName?: string,
  endpoint?: string
}



const SymplerChat: React.FC<ChatProps> = ({formName, endpoint}) => {
  const [formIoData, setFormIoData] = useState<FormIoResponse>()
  const [sessionStarted, setSessionStarted] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [index, setIndex] = useState(0)
  const [inputDisabled, setInputDisabled] = useState(false);

  const [formSubmissionId, setFormSubmissionId] = useState('')

  const newDate = new Date().toString();

  useEffect(() => {
    // {{projectUrl}}/form/{{formId}}
    axios.get(`https://${endpoint}.form.io/${formName}`).then(res => {
      setFormIoData(res)
    }).catch(error => {
      console.log('get error', error)
    })
  }, [])

  const submitData = async (message: string, index: number) => {
    if (formIoData) {
      if (formIoData.data._id && sessionStarted === false) {
        axios.get(`https://${endpoint}.form.io/${formName}/submission/${formIoData.data._id}`).then(res => {
        }).catch(async error => {
          const key = formIoData.data.components[index].key
          const obj: any = {};
          obj[key] = message          
          await axios.post(`https://${endpoint}.form.io/${formName}/submission`, {
            data: {
              ...obj
            }
          }).then(result => {
            console.log('post create submission result', result)
            setFormSubmissionId(result.data._id)
            setSessionStarted(true)
            setIndex(index + 1)
            setSubmit(false)
          }).catch(error => {
            console.log('error', error)
          })
        })
      } else if (formIoData.data._id && sessionStarted) {
        // Get the previous submissions
        axios.get(`https://${endpoint}.form.io/${formName}/submission/${formSubmissionId}`).then(async res => {
          console.log('get previous submission', res)
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
            console.log("base64response", base64Response)
            const blob = await base64Response.blob();
            console.log('base64 blob', blob)
            // const file = new File([blob],  `${formIoData.data.components[index].key}_fileUpload_${new Date().toISOString()}`)
            const file = blob.type === 'video/mp4' ? new File([blob],  `${formIoData.data.components[index].key}_fileUpload_${new Date().toISOString()}.mp4`, {type: 'video/mp4'}) : new File([blob],  `${formIoData.data.components[index].key}_fileUpload_${new Date().toISOString()}`)
            console.log('file blbo', file)
            var formData = new FormData();
            formData.append('file', file)
            toggleMsgLoader();
            await axios.post(`https://dash-api.sympler.co/api/v1/uploadimage`,
              formData,
            ).then(result => {
              console.log('sympler result', result)
              toggleMsgLoader();
              const imageMessage = result.data.file
              obj[key] = imageMessage
              axios.put(`https://${endpoint}.form.io/${formName}/submission/${formSubmissionId}`, {
                data: {
                  ...obj,
                  ...previousData
                }
              }).then(result => {
                console.log('result from put', result)
                setIndex(index + 1)
                setSubmit(false)
              }).catch(error => {
                console.log('error', error)
              })
            }).catch(error => {
              console.log('error sending the image to sympler', error)
            })
          } else {
            obj[key] = message
            console.log('obj on put', obj)
            console.log('obj previous', previousData)
            console.log('submission id', formIoData.data._id)
            axios.put(`https://${endpoint}.form.io/${formName}/submission/${formSubmissionId}`, {
              data: {
                ...obj,
                ...previousData
              }
            }).then(result => {
              console.log('result from put', result)
              setIndex(index + 1)
              setSubmit(false)
            }).catch(error => {
              console.log('error', error)
            })
          }
        }).catch(error => {
          console.log('couldnt get submission', error)
        })

      }
    }
  }

  const askQuestion = async (message?: string) => {
    if (formIoData) {
      if (index >= formIoData?.data.components.length - 1) {
        console.log('all questions have been answered')
        // @ts-ignore
        window.gtag("event", `${formIoData.data.title} Form Completed`, {
          event_category: "Form",
          event_label: formIoData.data.title
        });
      } else if (formIoData.data.components[index].label.includes('GetTimeZone')) {
        setSubmit(true)
        let timezone = newDate.slice(newDate.indexOf('('), newDate.lastIndexOf(')') + 1)
        await submitData(timezone.replace('(', '').replace(')', ''), index)
        return
      } else if (formIoData.data.components[index].label.includes('GetLocation')) {
        setSubmit(true)
        try {
          let location = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=902c52a386fb4db59dd7d4c98e2dba2a')
          if (location) {
            await submitData(location.data.country_name, index)
            return
          } else {
            await submitData('Error getting location information', index)
            return
          }
        } catch (error) {
          console.error('Error ', error)
          await submitData('Error getting location information', index)
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
          toggleInputDisabled();
          setInputDisabled(true)
          setQuickButtons(formIoData.data.components[index].data.values ?? [])
        } else {
          setQuickButtons([])
        }
      } else {
        console.log('index before it adds reponse', index)
        if (inputDisabled) {
          toggleInputDisabled()
          setInputDisabled(false)
        }
        addResponseMessage(formIoData.data.components[index].label)
        if(formIoData.data.components[index].placeholder !== '' && formIoData.data.components[index].placeholder !== undefined) {
          const redemptionLink = formIoData.data.components[index].placeholder.replace('uid=1234', `uid=${formIoData.data._id}`).replace('campaign=1234', `campaign=${endpoint}`)
          addLinkSnippet({
            title: '',
            link: redemptionLink,
            target: '_blank'
          })
        }
        if(formIoData.data.components[index].type === 'radio') {
          let labels = formIoData.data.components[index].values
          const sliderResponse = async (value: string) => {
            addUserMessage(value)
            await submitData(value, index)
          }
          toggleInputDisabled();
          setInputDisabled(true)
          renderCustomComponent(SliderInput, {min: 0, max: labels.length - 1, labels: labels, confirmValue: sliderResponse}, false);
        }
        if (formIoData.data.components[index].data) {
          toggleInputDisabled();
          setInputDisabled(true)
          setQuickButtons(formIoData.data.components[index].data.values ?? [])
        } else {
          setQuickButtons([])
        }
        if (message) {
          console.log('askquesion is being run not insided')
          console.log('new message', message)
          await submitData(message, index)
        }
      }
    }
  }

  useEffect(() => {
    askQuestion()
  }, [index, formIoData])

  // useEffect(() => {
  //   console.log('image being passed to', image)
  //   if (image.length >= 1) {
  //   }, [image])

  console.log('form', formIoData)

  const hanleQuckButtonClick = (e: string) => {
    addUserMessage(e);
    askQuestion(e);
  };

  useEffect(() => {
    toggleWidget();
  }, []);

  return (
    <div className="App">
      <Widget
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