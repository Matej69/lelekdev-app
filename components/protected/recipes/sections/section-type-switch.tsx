import { ClipboardList, ClipboardType } from "lucide-react"
import { RecipeSectionType } from "./type"
import { useState } from "react"

interface SectionTypeSwitchProps {
  onChange: (value: RecipeSectionType) => void,
  defaultType: RecipeSectionType
}
export default function SectionTypeSwitch(p: SectionTypeSwitchProps) {
  const [selectedType, setSelectedType] = useState<RecipeSectionType>(p.defaultType)

  const onChange = () => {
    setSelectedType((prevType) => {
        const newType = prevType == 'TEXT' ? 'INGREDIENTS' : 'TEXT' 
        p.onChange(newType)
        return newType
    })
  }

  const getIconBackgroundColor = (type: RecipeSectionType) => selectedType == type ? 'white' : '#eee'
  const getIconColor = (type: RecipeSectionType) => selectedType == type ? 'black' : '#ccc'

  return(
    <div className="flex border border-gray-300 rounded cursor-pointer" onClick={onChange}>
        <div className="p-1" style={{ background: getIconBackgroundColor('TEXT') }}>
            <ClipboardType strokeWidth="2" color={getIconColor('TEXT')}/>
        </div>
        <div className="p-1" style={{ background: getIconBackgroundColor('INGREDIENTS') }}>
            <ClipboardList strokeWidth="2" color={getIconColor('INGREDIENTS')}/>
        </div>
   </div>

  ) 
}