import { CircleCheck, Copy, CopyPlus, EditIcon, LucideProps, Paintbrush, PencilRuler, SaveIcon, Trash2 } from "lucide-react";

const iconNameComponentMap = {
    duplicate: Copy,
    delete: Trash2,
    edit: EditIcon,
    linkEdit: PencilRuler,
    save: SaveIcon,
    add: CopyPlus,
    'color-picker': Paintbrush,
    checkmark: CircleCheck
} satisfies Record<string, React.FC<React.SVGProps<SVGSVGElement>>>;
export type IconName = keyof typeof iconNameComponentMap

export type IconButtonProps = {
    icon: IconName;
    onClick?: () => void;
    style?: React.CSSProperties;
    iconProps?: LucideProps;
    iconStyle?: React.CSSProperties;
    iconClassName?: string;
}

export const IconButton = ({ icon, iconProps, onClick, style, iconStyle, iconClassName }: IconButtonProps) => {
    const Icon = iconNameComponentMap[icon];
    return (
        <button onClick={onClick} className="cursor-pointer" style={style}>
            <Icon {...iconProps} style={iconStyle} className={iconClassName} />
        </button>
    );
}