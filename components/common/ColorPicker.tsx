type ColorPickerProps = {
    hexColors: string[],
    className: string,
    onColorSelect: (color: string) => void
}

export const ColorPicker = (p: ColorPickerProps) => {
    return(
        <div className="grid grid-cols-4 gap-1">
            { p.hexColors.map(col => { 
                return(
                    <div key={col} className="w-8 h-8 rounded-full" style={{ background: col }} onClick={() => p.onColorSelect(col)}></div>
                )
            })} 
        </div>
    )
}