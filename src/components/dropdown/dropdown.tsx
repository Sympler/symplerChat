import React, { useState } from "react";
// import "./styles.css";

export interface Slider {
    min: number;
    max: number;
    labels: [{
        label: string;
        value: string;
    }]
    confirmValue: (value: string) => void;
}

const Dropdown = ({labels, confirmValue}: Slider) => {
    const [values, setValues] = useState<string[]>([]);
    const [value, setValue] = useState<string>('')
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
        confirmValue(value); 
    }

    return (
        <>
            {showContents && labels ? 
                <div style={{display: 'flex', flexDirection: 'column', marginLeft: 'auto', paddingRight: '15px' }}>
                    <select name="options" id="option-select" onChange={(e) => setValue(e.target.value)}>
                        <option value="">Please select an option</option>
                        {labels.map((l, key) => (
                            <option key={key} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                    <div style={{marginLeft: 'auto', marginTop: '10px'}}>
                        <button id="slider-button" disabled={value.length > 0 ? false : true} style={value.length > 0 ? undefined : {backgroundColor: "#f4f7f9", borderColor: '#f4f7f9 !important', cursor: 'not-allowed'}} onClick={() => confirm()}>OK</button>
                    </div>
                </div>
            : null}
        </>
    )
}

export default Dropdown;