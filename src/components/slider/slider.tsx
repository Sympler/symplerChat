import React, { useEffect, useState } from "react";
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

const SliderInput = ({min, max, labels, confirmValue}: Slider) => {
    const [value, setValue] = useState<number>(0);
    const [selectedLabel, setSelectedlabel] = useState('');
    const [showContents, setShowContents] = useState(true);

    useEffect(() => {
        if (!labels) {
            return
        }
        setSelectedlabel(labels[0].label)
    }, [labels])

    const updateValue = (value: number) => {
        let label = labels[value]
        setSelectedlabel(label.label)
        setValue(value)
    }

    const labelPosition = (index: number) => {
        switch(index){
            case 0:
                return 'left';
            case labels.length - 1:
                return 'right';
            default:
                return 'center';
        }
    }

    const confirm = () => {
        setShowContents(false);
        confirmValue(selectedLabel); 
    }

    return (
        <>
            {showContents ? 
                <div style={{display: 'flex', flexDirection: 'column', marginLeft: 'auto', width: labels.length * 10 + '%', maxWidth: '100%'}}>
                    <input 
                        type={'range'}
                        min={min}
                        max={max}
                        onChange={(e) => updateValue(+e.target.value)}
                        style={{}}
                        value={value}
                    />
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        {labels.map((l, key) => (
                            <div
                                style={{
                                    width: (100 / labels.length) * 10 + '%', 
                                    textAlign: labelPosition(key),
                                    textDecoration: l.label === selectedLabel ? 'underline' : '',
                                    fontWeight: l.label === selectedLabel ? 'bold' : '',
                                    cursor: 'pointer'
                                }}
                                onClick={() => updateValue(key)}
                            >
                                <p>{l.label}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{width: '20%', marginLeft: 'auto', textAlign: 'right'}}>
                        <button id="slider-button" onClick={() => confirm()}>OK</button>
                    </div>
                </div>
            : null}
        </>
    )
}

export default SliderInput;