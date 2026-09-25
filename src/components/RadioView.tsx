import React from 'react';
import { Play, Radio, Volume2, Mic, Calendar, Activity } from 'lucide-react';
import { Song, RadioStation } from '../types/music';

interface RadioViewProps {
  onPlaySong: (song: Song) => void;
  songs: Song[];
  isPlaying: boolean;
  spectrum: number[];
}

const stations: RadioStation[] = [
  {
    id: 'station-1',
    name: 'Apple Music 1',
    tagline: 'The new music that matters. Broadcasting live from LA, New York, and London.',
    currentShow: 'The Zane Lowe Show: World Firsts',
    host: 'Zane Lowe',
    accent: '#fa2d48',
    gradient: ['#fa2d48', '#ff7a00'],
    frequency: '98.5 MHz Worldwide',
  },
  {
    id: 'station-2',
    name: 'Apple Music Hits',
    tagline: 'Songs everyone knows and loves from the 80s, 90s, and 2000s.',
    currentShow: 'Afternoon Jams with Estelle',
    host: 'Estelle',
    accent: '#8b5cf6',
    gradient: ['#8b5cf6', '#ec4899'],
    frequency: '101.1 MHz Stream',
  },
  {
    id: 'station-3',
    name: 'Apple Music Country',
    tagline: 'The roots and modern storytellers of Nashville and beyond.',
    currentShow: 'Today’s Country with Kelleigh Bannen',
    host: 'Kelleigh Bannen',
    accent: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
    frequency: '104.7 MHz Live',
  },
];

export const RadioView: React.FC<RadioViewProps> = ({
  onPlaySong,
  songs,
  isPlaying,
  spectrum,
}) => {
  return (
    <div className="space-y-10 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Radio</h1>
        <p className="text-sm text-[#86868b] mt-1">
          Live global broadcasts, iconic host sessions, and non-stop artist curation.
        </p>
      </div>

      {/* Live On-Air Stations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stations.map((st) => (
          <div
            key={st.id}
            className="group relative overflow-hidden rounded-3xl p-6 bg-[#1a1a1d] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between h-80 shadow-xl"
            style={{
              background: `linear-gradient(160deg, ${st.gradient[0]}25 0%, #151518 80%)`,
            }}
          >
            {/* Live Pill badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[11px] font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                <span>Live On Air</span>
              </div>
              <span className="text-[11px] font-mono text-[#86868b]">{st.frequency}</span>
            </div>

            {/* Station details */}
            <div className="space-y-2 my-auto">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {st.name}
              </h3>
              <p className="text-sm font-semibold text-white/90">
                {st.currentShow}
              </p>
              <p className="text-xs text-[#86868b] line-clamp-2">
                {st.tagline}
              </p>
            </div>

            {/* Spectrum visualizer + Tune in */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div className="flex items-end gap-1 h-6">
                {(spectrum.length > 0 ? spectrum.slice(0, 8) : [0.3, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.2]).map((val, idx) => (
                  <span
                    key={idx}
                    className="w-1 rounded-full bg-[#fa2d48] transition-all duration-75"
                    style={{ height: `${Math.max(15, (isPlaying ? val : 0.2) * 100)}%` }}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  const targetSong = songs[Math.floor(Math.random() * songs.length)];
                  if (targetSong) onPlaySong(targetSong);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Tune In</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Live Shows */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight mb-4">Upcoming Schedule</h2>
        <div className="space-y-2">
          {[
            { time: '11:00 AM', station: 'Apple Music 1', title: 'New Music Daily Radio', host: 'Ebro Darden' },
            { time: '02:00 PM', station: 'Apple Music 1', title: 'Rocket Hour', host: 'Elton John' },
            { time: '05:00 PM', station: 'Apple Music Hits', title: 'Club Life Radio', host: 'Tiësto' },
            { time: '08:00 PM', station: 'Apple Music 1', title: 'OVO Sound Radio', host: 'Oliver El-Khatib' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-[#fa2d48] font-bold w-16">{item.time}</span>
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                  <p className="text-[11px] text-[#86868b]">{item.host} · {item.station}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (songs[0]) onPlaySong(songs[0]);
                }}
                className="text-xs font-medium text-[#86868b] hover:text-white flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Set Alert</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
