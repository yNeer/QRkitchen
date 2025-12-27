import type { Icon } from 'lucide-react';

// Type for the QR code styling library instance
export type QRCodeStylingInstance = {
  update: (options: Partial<QRCodeStylingOptions>) => void;
  append: (container?: HTMLElement) => void;
  download: (options?: { name?: string; extension?: 'png' | 'jpeg' | 'webp' | 'svg' }) => Promise<void>;
};

// Augment the Window interface to include the QR code styling library
declare global {
  interface Window {
    QRCodeStyling: {
      new (options: QRCodeStylingOptions): QRCodeStylingInstance;
    };
  }
}

// Interfaces for QR code data types
export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  org: string;
  title: string;
}

export interface EmailData {
  address: string;
  subject: string;
  body: string;
}

export interface SMSData {
  phone: string;
  message: string;
}

export interface WhatsAppData {
  phone: string;
  message: string;
}

export interface LocationData {
  lat: string;
  long: string;
}

export interface DataValues {
  url: string;
  text: string;
  wifi: WifiData;
  vcard: VCardData;
  email: EmailData;
  sms: SMSData;
  whatsapp: WhatsAppData;
  phone: string;
  location: LocationData;
}

export type QrType = keyof DataValues;

export interface QRTypeInfo {
  id: string;
  label: string;
  icon: Icon;
}

// Interfaces for QR code design
export interface DotsOptions {
  type: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
  color: string;
}

export interface BackgroundOptions {
  color: string;
}

export interface CornersSquareOptions {
  type: 'square' | 'dot' | 'extra-rounded';
  color: string;
}

export interface CornersDotOptions {
  type: 'square' | 'dot';
  color: string;
}

export interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface DesignState {
  width: number;
  height: number;
  margin: number;
  image: string | null;
  dotsOptions: DotsOptions;
  backgroundOptions: BackgroundOptions;
  cornersSquareOptions: CornersSquareOptions;
  cornersDotOptions: CornersDotOptions;
  qrOptions: QROptions;
}

export interface GradientState {
  enabled: boolean;
  type: 'linear' | 'radial';
  c1: string;
  c2: string;
}

// Interface for history items
export interface HistoryItem {
  id: number;
  timestamp: string;
  activeType: string;
  dataValues: DataValues;
  design: DesignState;
  gradient: { enabled: boolean; type: string; c1: string; c2: string; };
  customEyeColor: boolean;
  summary: string;
}

// Interface for templates
export interface TemplateConfig {
  gradientEnabled: boolean;
  dotsColor?: string;
  bg: string;
  shape: DotsOptions['type'];
  eyeFrame: CornersSquareOptions['type'];
  eyeDot: CornersDotOptions['type'];
  customEye: boolean;
  gType?: 'linear' | 'radial';
  g1?: string;
  g2?: string;
  frameColor?: string;
  dotColor?: string;
}

export interface Template {
  name: string;
  config: TemplateConfig;
}

// QRCodeStyling library options
export interface QRCodeStylingOptions {
  width: number;
  height: number;
  type: 'canvas' | 'svg';
  data: string;
  image?: string;
  margin: number;
  qrOptions: QROptions;
  imageOptions?: {
    crossOrigin?: string;
    margin?: number;
    imageSize?: number;
  };
  dotsOptions: {
    type: DotsOptions['type'];
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: { offset: number; color: string }[];
    };
  };
  backgroundOptions: BackgroundOptions;
  cornersSquareOptions: {
    type: CornersSquareOptions['type'];
    color: string;
  };
  cornersDotOptions: {
    type: CornersDotOptions['type'];
    color: string;
  };
}