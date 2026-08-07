import React, { useState } from 'react';
import fallbackLogo from '../../assets/images/logo.png';

export const AppImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  src,
  alt,
  className,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <img
      src={showFallback ? fallbackLogo : src}
      alt={alt}
      className={`${showFallback ? 'grayscale' : ''} ${className || ''}`}
      onError={() => !failed && setFailed(true)}
      {...rest}
    />
  );
};