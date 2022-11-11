import React, {useEffect, useState} from 'react';
import {Widget, addResponseMessage, setQuickButtons, addUserMessage, toggleWidget} from 'react-chat-widget-custom';
import 'react-chat-widget-custom/lib/styles.css';
import axios from 'axios';

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



const SymplerChat: React.FC<ChatProps> = ({formName, endpoint}) => {
  const [formIoData, setFormIoData] = useState<FormIoResponse>()
  const [sessionStarted, setSessionStarted] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [index, setIndex] = useState(0)

  const [formSubmissionId, setFormSubmissionId] = useState('')

  const newDate = new Date().toString();

  useEffect(() => {
    // {{projectUrl}}/form/{{formId}}
    axios.get(`https://${endpoint}.form.io/${formName}`).then(res => {
      console.log('get results from formIo', res)
      setFormIoData(res)
    }).catch(error => {
      console.log('get error', error)
    })
  }, [])

  console.log('submtting?', submit)
  console.log('index', index)

  const submitData = async (message: string, index: number) => {
    if (formIoData) {
      if (formIoData.data._id && sessionStarted === false) {
        axios.get(`https://${endpoint}.form.io/${formName}/submission/${formIoData.data._id}`).then(res => {
          console.log('the res from formIo submission', res)
        }).catch(async error => {
          console.log('get submission error error', error)
          const key = formIoData.data.components[index].key
          const obj: any = {};
          obj[key] = message
          console.log('first obj', obj)
          await axios.post(`https://${endpoint}.form.io/${formName}/submission`, {
            data: {
              ...obj
            }
          }).then(result => {
            console.log('post create submission result', result)
            setFormSubmissionId(result.data._id)
            setSessionStarted(true)
            setIndex(index + 1)
            console.log('this is running lmao')
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
            if (message !== ('Yes')) {
              console.log('end it here')
              return
            }
          }
          if (message.includes('data:')) {
            const base64Source = message.slice(message.indexOf('(') + 1, message.lastIndexOf(')'))
            const base64Response = await fetch(base64Source)
            const blob = await base64Response.blob();
            const file = new File([blob], `${formIoData.data.components[index].key}_fileUpload`)
            var formData = new FormData();
            formData.append('file', file)
            axios.post(`https://dash-api.sympler.co/api/v1/uploadimage`,
              formData,
            ).then(result => {
              console.log('sympler result', result)
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
      } else if (formIoData.data.components[index].label.includes('GetTimeZone')) {
        setSubmit(true)
        await submitData(newDate.slice(newDate.indexOf('('), newDate.lastIndexOf(')') + 1), index)
        return
      }
      if (message && submit === false) {
        await submitData(message, index)
        // addResponseMessage(formIoData.data.components[index].label)
        if (formIoData.data.components[index].data) {
          setQuickButtons(formIoData.data.components[index].data.values ?? [])
        } else {
          setQuickButtons([])
        }
      } else {
        console.log('index before it adds reponse', index)
        addResponseMessage(formIoData.data.components[index].label)
        if (formIoData.data.components[index].data) {
          console.log('hello why is this not working')
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