import React from 'react';
import { 
  Link, Type as TextIcon, Wifi, Contact, MessageSquare, Mail, MapPin, 
  Phone, MessageCircle 
} from 'lucide-react';
import type { QRTypeInfo, Template } from './types';

export const TEMPLATES: Record<string, Template[]> = {
  "Pro": [
    { name: "Classic Black", config: { gradientEnabled: false, dotsColor: "#000000", bg: "#ffffff", shape: "square", eyeFrame: "square", eyeDot: "square", customEye: false } },
    { name: "Corporate Blue", config: { gradientEnabled: false, dotsColor: "#1e40af", bg: "#eff6ff", shape: "square", eyeFrame: "square", eyeDot: "square", customEye: false } },
    // FIX: "rounded" is not a valid type for eyeFrame or eyeDot. Changed to "extra-rounded" and "dot" respectively to match the rounded theme.
    { name: "Forest Green", config: { gradientEnabled: false, dotsColor: "#166534", bg: "#f0fdf4", shape: "rounded", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    // FIX: "rounded" is not a valid type for eyeFrame or eyeDot. Changed to "extra-rounded" and "dot" respectively to match the rounded theme.
    { name: "Crimson Red", config: { gradientEnabled: false, dotsColor: "#991b1b", bg: "#fef2f2", shape: "rounded", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    { name: "Slate Grey", config: { gradientEnabled: false, dotsColor: "#334155", bg: "#f8fafc", shape: "dots", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    { name: "Minimalist", config: { gradientEnabled: false, dotsColor: "#18181b", bg: "#ffffff", shape: "classy", eyeFrame: "square", eyeDot: "square", customEye: false } },
  ],
  "Ultra Pro": [
    { name: "Ocean Gradient", config: { gradientEnabled: true, gType: "linear", g1: "#06b6d4", g2: "#3b82f6", bg: "#ffffff", shape: "square", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    // FIX: "rounded" is not a valid type for eyeFrame or eyeDot. Changed to "extra-rounded" and "dot" respectively to match the rounded theme.
    { name: "Sunset Vibes", config: { gradientEnabled: true, gType: "linear", g1: "#f59e0b", g2: "#ef4444", bg: "#ffffff", shape: "rounded", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    { name: "Berry Fusion", config: { gradientEnabled: true, gType: "linear", g1: "#ec4899", g2: "#8b5cf6", bg: "#ffffff", shape: "dots", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    // FIX: "rounded" is not a valid type for eyeFrame or eyeDot. Changed to "extra-rounded" and "dot" respectively to match the rounded theme.
    { name: "Lime Twist", config: { gradientEnabled: true, gType: "linear", g1: "#84cc16", g2: "#10b981", bg: "#ffffff", shape: "classy", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    { name: "Deep Space", config: { gradientEnabled: true, gType: "radial", g1: "#312e81", g2: "#1e1b4b", bg: "#ffffff", shape: "square", eyeFrame: "square", eyeDot: "square", customEye: false } },
    { name: "Royal Gold", config: { gradientEnabled: true, gType: "linear", g1: "#ca8a04", g2: "#854d0e", bg: "#fffbeb", shape: "classy-rounded", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
  ],
  "Ultra Pro Max": [
    { name: "Neon Cyber", config: { gradientEnabled: true, gType: "linear", g1: "#00ffcc", g2: "#d600ff", bg: "#111827", shape: "dots", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    // FIX: "rounded" is not a valid type for eyeFrame or eyeDot. Changed to "extra-rounded" and "dot" respectively to match the rounded theme.
    { name: "Dark Emerald", config: { gradientEnabled: true, gType: "linear", g1: "#34d399", g2: "#059669", bg: "#0f172a", shape: "classy", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    { name: "Cotton Candy", config: { gradientEnabled: true, gType: "linear", g1: "#f472b6", g2: "#60a5fa", bg: "#ffffff", shape: "extra-rounded", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    // FIX: "classy" is not a valid type for eyeFrame. Changed to "extra-rounded" to match the classy-rounded shape.
    { name: "Midnight Oil", config: { gradientEnabled: true, gType: "radial", g1: "#6366f1", g2: "#4338ca", bg: "#1e1b4b", shape: "classy-rounded", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    { name: "Cherry Blossom", config: { gradientEnabled: true, gType: "linear", g1: "#fda4af", g2: "#fb7185", bg: "#fff1f2", shape: "dots", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: false } },
    { name: "Electric Violet", config: { gradientEnabled: true, gType: "linear", g1: "#8b5cf6", g2: "#6d28d9", bg: "#f3f4f6", shape: "classy", eyeFrame: "square", eyeDot: "square", customEye: false } },
  ],
  "Ultra Pro Max Extreme": [
    { name: "Golden Eye", config: { gradientEnabled: false, dotsColor: "#000000", bg: "#ffffff", shape: "dots", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: true, frameColor: "#ca8a04", dotColor: "#000000" } },
    { name: "Viper Strike", config: { gradientEnabled: true, gType: "linear", g1: "#10b981", g2: "#059669", bg: "#000000", shape: "classy", eyeFrame: "square", eyeDot: "square", customEye: true, frameColor: "#ef4444", dotColor: "#ef4444" } },
    { name: "Bumblebee", config: { gradientEnabled: false, dotsColor: "#1f2937", bg: "#fbbf24", shape: "square", eyeFrame: "square", eyeDot: "square", customEye: true, frameColor: "#1f2937", dotColor: "#ffffff" } },
    { name: "Arctic Frost", config: { gradientEnabled: true, gType: "linear", g1: "#bae6fd", g2: "#38bdf8", bg: "#0c4a6e", shape: "dots", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: true, frameColor: "#ffffff", dotColor: "#38bdf8" } },
    { name: "Love Potion", config: { gradientEnabled: true, gType: "radial", g1: "#e11d48", g2: "#9f1239", bg: "#ffe4e6", shape: "extra-rounded", eyeFrame: "extra-rounded", eyeDot: "dot", customEye: true, frameColor: "#000000", dotColor: "#e11d48" } },
    { name: "Matrix Glitch", config: { gradientEnabled: false, dotsColor: "#22c55e", bg: "#000000", shape: "square", eyeFrame: "square", eyeDot: "square", customEye: true, frameColor: "#22c55e", dotColor: "#ffffff" } },
  ]
};

export const QR_TYPES: QRTypeInfo[] = [
  { id: 'url', label: 'URL', icon: Link },
  { id: 'text', label: 'Text', icon: TextIcon },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'phone', label: 'Call', icon: Phone },
  { id: 'vcard', label: 'vCard', icon: Contact },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'location', label: 'Location', icon: MapPin },
];

export const DOT_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rnd' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rnd' },
];

export const CORNER_SQUARE_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Extra Rnd' },
];

export const CORNER_DOT_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

export const ERROR_LEVELS = [
  { value: 'L', label: 'Low (7%)' },
  { value: 'M', label: 'Medium (15%)' },
  { value: 'Q', label: 'High (25%)' },
  { value: 'H', label: 'Highest (30%)' },
];