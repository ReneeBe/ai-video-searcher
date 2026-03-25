import { forwardRef } from 'react';

interface Props {
  src: string;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, Props>(({ src }, ref) => {
  return (
    <div className="rounded-xl overflow-hidden bg-black border border-zinc-800">
      <video
        ref={ref}
        src={src}
        controls
        className="w-full max-h-72 object-contain"
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
