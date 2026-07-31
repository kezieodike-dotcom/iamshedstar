/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Headless audio engine. The on-page player "console" bar has been removed by
 * request — this component renders nothing visible. It keeps a JS Audio object
 * in a ref and drives play / pause / track-change / play-count purely from
 * props, so tapping a song's play button still plays audio (no visible bar).
 */

import React, { useEffect, useRef } from 'react';
import { Song } from '../types';

interface AudioPlayerProps {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onSelectSong: (song: Song) => void;
}

export default function AudioPlayer({
  currentSong,
  isPlaying,
  onNextSong,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set up the audio element and advance to the next track when one ends.
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const handleEnded = () => onNextSong();
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNextSong]);

  // Swap the source when the selected track changes.
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  // Reflect play / pause state and count a play on the backend.
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
        fetch(`/api/songs/${currentSong.id}/play`, { method: 'POST' }).catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // No visible player UI.
  return null;
}
