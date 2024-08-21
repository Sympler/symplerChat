import React, { useState } from "react";
import "./styles.css";

export interface Slider {
    min: number;
    max: number;
    labels: [{
        label: string;
        value: string;
        exclusive?: string;
    }]
    confirmValue: (value: string) => void;
}

const SelectBoxes = ({labels, confirmValue}: Slider) => {
    const [values, setValues] = useState<string[]>([]);
    const [showContents, setShowContents] = useState(true);
    const [otherValue, setOtherValue] = useState("")
    const isMobile = window.innerWidth <= 720;
    const exclusiveBoxes = labels.filter(l => l.exclusive === 'Z')

    const updateValue = (value: string, exclusive: string | undefined) => {
        if (exclusive && exclusive === 'Z') {
            if (values.includes(value)) {
                setValues([])
                return
            } else {
                setValues([value])
                return
            }
        }
        if (values.includes(value)) {
            setValues([...values.filter(v => v !== value)])
        } else {
            const valueCheck = values.find(v => exclusiveBoxes.map(e => e.label).includes(v))
            if (valueCheck && valueCheck?.length > 0) {
                setValues([value])
            } else {
                setValues([...values, value])
            }
        }
    }

    const confirm = () => {
        setShowContents(false);
        confirmValue(values.toString().replace('[', '').replace(']', '').replaceAll(',', ', ') + (values.length > 0 ? ', ' : '') + otherValue); 
    }

    return (
        <>
            {showContents ? 
                <div style={{display: 'flex', flexDirection: 'column', marginLeft: 'auto', paddingRight: '15px' }}>
                    {labels.map((l, key) => (
                        <div key={key} style={isMobile ? {marginBottom: '20px'} : {marginBottom: '10px'}}>
                            {l.value === "OTHER" ?
                                <input 
                                    checked={values.includes(l.label)}
                                    id={l.value} 
                                    type={'text'}
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                    onChange={(e) => setOtherValue(e.target.value)}
                                    placeholder={l.label}
                                    name={l.label}
                                />
                            : <>
                                <input 
                                    checked={values.includes(l.label)}
                                    id={l.value} 
                                    type={'checkbox'}
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                    onChange={() => updateValue(l.label, l.exclusive)}
                                    value={l.label}
                                    name={l.label}
                                />
                                <label htmlFor={l.label}>{l.label}</label>
                            </>
                            }
                        </div>
                    ))}
                     <div style={{marginLeft: 'auto'}}>
                        <button id="slider-button" disabled={(values.length > 0 || otherValue !== "") ? false : true} style={(values.length > 0 || otherValue !== "") ? undefined : {backgroundColor: "#f4f7f9", borderColor: '#f4f7f9 !important', cursor: 'not-allowed'}} onClick={() => confirm()}>OK</button>
                    </div>
                </div>
            : null}
        </>
    )
}

export default SelectBoxes;