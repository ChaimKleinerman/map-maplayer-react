import { MutableRefObject } from "react"

interface Props{
    popupRef:MutableRefObject<HTMLDivElement | null>
}
export default function Popup(props:Props) {
    
   const {popupRef} = props

  return (
    <div ref={popupRef}></div>
  )
}
