import React from 'react';
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as MdIcons from "react-icons/md";

interface IconFinderProps {
  name: string;
}

export default function IconFinder({ name }: IconFinderProps) {
  // Fixed values for uniformity
  const size = 18;
  const color = 'currentColor';
  const className = 'icon-finder';

  // Combine all icon libraries
  const allIcons = {
    ...FaIcons,
    ...AiIcons,
    ...MdIcons,
  };

  // Get the icon component
  const IconComponent = allIcons[name as keyof typeof allIcons];

  // If icon not found, return a fallback
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in FaIcons, AiIcons, or MdIcons libraries`);
    return (
      <div 
        className={className}
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red',
          border: '1px solid red',
          borderRadius: '4px',
          fontSize: size * 0.6,
        }}
      >
        ?
      </div>
    );
  }

  return (
    <IconComponent 
      size={size} 
      color={color} 
      className={className}
    />
  );
}