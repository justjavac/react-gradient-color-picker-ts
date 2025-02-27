import React, { useState, useEffect } from 'react'
import { rgb2cmyk, cmykToRgb } from './converters'
import { formatInputValues } from './formatters'
import { usePicker } from './context'

var tc = require("tinycolor2");

const Inputs = () => {
  const [disable, setDisable] = useState('')
  const { handleChange, tinyColor, r, g, b, opacity, inputType } = usePicker()
  const hex = tinyColor.toHex();
  const [newHex, setNewHex] = useState(hex)

  useEffect(() => {
    if (disable !== 'hex') {
      setNewHex(hex)
    }
  }, [tinyColor, disable, hex])

  const handleHex = e => {
    let tinyHex = tc(e.target.value);
    setNewHex(e.target.value);
    if (tinyHex.isValid()) {
      let { r, g, b } =  tinyHex.toRgb()
      let newColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      handleChange(newColor);
    }
  }

  return(
    <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: 14}}>
      <div style={{width: 74}}>
        <input className='input-wrap' value={newHex} onChange={(e) => handleHex(e)} onFocus={() => setDisable('hex')} onBlur={() => setDisable('')}/>
        <div className='input-label'>HEX</div>
      </div>
      {inputType === 'hsl' && <HSLInputs />}
      {inputType === 'rgb' && <RGBInputs />}
      {inputType === 'hsv' && <HSVInputs />}
      {inputType === 'cmyk' && <CMKYInputs />}
      <Input value={opacity * 100} callback={(newVal) => handleChange(`rgba(${r}, ${g}, ${b}, ${newVal / 100})`)} label='A' />
    </div>
  )
}

export default Inputs;

const RGBInputs = () => {
  const { handleChange, r, g, b, opacity } = usePicker()

  const handleRgb = ({r,g,b}) => {
    handleChange(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  return(
    <>
      <Input value={r} callback={(newVal) => handleRgb({r: newVal, g: g, b: b})} label='R' max={255} />
      <Input value={g} callback={(newVal) => handleRgb({r: r, g: newVal, b: b})} label='G' max={255} />
      <Input value={b} callback={(newVal) => handleRgb({r: r, g: g, b: newVal})} label='B' max={255} />
    </>
  )
}

const HSLInputs = () => {
  const { handleChange, s, l, hue, opacity } = usePicker();

  const handleHsl = (value) => {
    let {r, g, b} = tc(value).toRgb();
    handleChange(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  return(
    <>
      <Input value={round(hue)} callback={(newVal) => handleHsl({h: newVal, s: s, l: l})} label='H' max={360} />
      <Input value={round(s * 100)} callback={(newVal) => handleHsl({h: hue, s: newVal, l: l})} label='S' />
      <Input value={round(l * 100)} callback={(newVal) => handleHsl({h: hue, s: s, l: newVal})} label='L' />
    </>
  )
}

const HSVInputs = () => {
  const { handleChange, hsvS, hsvV, hue, opacity } = usePicker();

  const handleHsv = (value) => {
    let {r, g, b} = tc(value).toRgb();
    handleChange(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  return(
    <>
      <Input value={round(hue)} callback={(newVal) => handleHsv({h: newVal, s: hsvS, v: hsvV})} label='H' max={360} />
      <Input value={round(hsvV * 100)} callback={(newVal) => handleHsv({h: hue, s: newVal, v: hsvV})} label='S' />
      <Input value={round(hsvV * 100)} callback={(newVal) => handleHsv({h: hue, s: hsvS, v: newVal})} label='V' />
    </>
  )
}

const CMKYInputs = () => {
  const { handleChange, r, g, b, opacity } = usePicker();
  const { c, m, k, y} = rgb2cmyk(r,g,b);

  const handleCmyk = (value) => {
    let { r, g, b } = cmykToRgb(value)
    handleChange(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  return(
    <>
      <Input value={round(c * 100)} callback={(newVal) => handleCmyk({c: newVal, m: m, y: y, k: k})} label='C' />
      <Input value={round(m * 100)} callback={(newVal) => handleCmyk({c: c, m: newVal, y: y, k: k})} label='M' />
      <Input value={round(y * 100)} callback={(newVal) => handleCmyk({c: c, m: m, y: newVal, k: k})} label='Y' />
      <Input value={round(k * 100)} callback={(newVal) => handleCmyk({c: c, m: m, y: y, k: newVal})} label='K' />
    </>
  )
}

const Input = ({ value, callback, max = 100, label }) => {
  const [temp, setTemp] = useState(value);
  const { inputType } = usePicker()

  useEffect(() => {
    setTemp(value)
  }, [value])

  const onChange = (e) => {
    const newVal = formatInputValues(parseFloat(e.target.value), 0, max)
    setTemp(newVal);
    callback(newVal);
  }

  return(
    <div style={{width: inputType === 'cmyk' ? 40 : 44}}>
      <input className='input-wrap' value={temp} onChange={(e) => onChange(e)} />
      <div className='input-label'>{label}</div>
    </div>
  )
}

const round = (val) => {
  return Math.round(val, 2)
}
