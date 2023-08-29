import React, { useState } from "react";
import "./styles.css";

export interface Slider {
    min: number;
    max: number;
    labels: [{
        label: string;
        value: string;
    }]
    confirmValue: (value: string) => void;
}

const SelectBoxes = ({labels, confirmValue}: Slider) => {
    const [values, setValues] = useState<string[]>([]);
    const [showContents, setShowContents] = useState(true);
    const isMobile = window.innerWidth <= 720;

    const updateValue = (value: string) => {
        if (values.includes(value)) {
            setValues([...values.filter(v => v !== value)])
        } else {
            setValues([...values, value])
        }
    }

    const confirm = () => {
        setShowContents(false);
        confirmValue(values.toString().replace('[', '').replace(']', '').replaceAll(',', ', ')); 
    }

    return (
        <>
            {showContents ? 
                <div style={{display: 'flex', flexDirection: 'column', marginLeft: 'auto', paddingRight: '15px' }}>
                    {labels.map((l, key) => (
                        <div key={key} style={isMobile ? {marginBottom: '20px'} : {marginBottom: '10px'}}>
                            <input 
                                id={l.value} 
                                type={'checkbox'}
                                style={{
                                    cursor: 'pointer'
                                }}
                                onClick={() => updateValue(l.label)}
                                value={l.label}
                                name={l.label}
                            />
                            <label htmlFor={l.label}>{l.label}</label>
                        </div>
                    ))}
                     <div style={{marginLeft: 'auto'}}>
                        <button id="slider-button" disabled={values.length > 0 ? false : true} style={values.length > 0 ? undefined : {backgroundColor: "#f4f7f9", borderColor: '#f4f7f9 !important', cursor: 'not-allowed'}} onClick={() => confirm()}>OK</button>
                    </div>
                </div>
            : null}
        </>
    )
}

export default SelectBoxes;