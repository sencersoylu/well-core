import Svg, { Circle, Path, Rect, type SvgProps } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
} & Omit<SvgProps, "width" | "height">;

const STROKE: Pick<SvgProps, "fill" | "strokeLinecap" | "strokeLinejoin"> = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const w = 1.5; // stroke width

function S({ size = 22, color = "currentColor", children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={w} {...STROKE} {...rest}>
      {children}
    </Svg>
  );
}

export const IconHome = (p: IconProps) => <S {...p}><Path d="M3 11.5 12 4l9 7.5"/><Path d="M5 10v9.5h14V10"/></S>;
export const IconJournal = (p: IconProps) => <S {...p}><Path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4z"/><Path d="M6 4v16"/><Path d="M10 9h6M10 13h4"/></S>;
export const IconPlus = (p: IconProps) => <S {...p}><Path d="M12 5v14M5 12h14"/></S>;
export const IconChart = (p: IconProps) => <S {...p}><Path d="M4 19V5"/><Path d="M9 19v-8"/><Path d="M14 19v-5"/><Path d="M19 19V9"/></S>;
export const IconUser = (p: IconProps) => <S {...p}><Circle cx="12" cy="8" r="3.5"/><Path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></S>;

export const IconPlay = ({ size = 18, color = "currentColor", ...r }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...r}><Path d="M7 5v14l12-7z" fill={color} /></Svg>
);
export const IconPause = ({ size = 18, color = "currentColor", ...r }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...r}><Rect x="6" y="5" width="4" height="14" rx="1" fill={color}/><Rect x="14" y="5" width="4" height="14" rx="1" fill={color}/></Svg>
);

export const IconArrowRight = (p: IconProps) => <S {...p}><Path d="M5 12h14M13 6l6 6-6 6"/></S>;
export const IconClose = (p: IconProps) => <S {...p}><Path d="M6 6l12 12M18 6 6 18"/></S>;
export const IconCheck = (p: IconProps) => <S {...p}><Path d="M5 12.5 10 17 19 7"/></S>;
export const IconBell = (p: IconProps) => <S {...p}><Path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z"/><Path d="M10 20a2 2 0 0 0 4 0"/></S>;
export const IconEar = (p: IconProps) => <S {...p}><Path d="M8 18c-2 0-3-2-3-4 0-1.5.5-3 .5-5C5.5 5 8.5 3 12 3s6 2 6 6c0 2-1 3-2.5 4S13 14.5 13 16s-1 3-3 3"/></S>;
export const IconSparkle = (p: IconProps) => <S {...p}><Path d="M12 4v6m0 4v6m-8-8h6m4 0h6"/></S>;
