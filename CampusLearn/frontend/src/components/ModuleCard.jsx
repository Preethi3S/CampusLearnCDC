import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CodingLinks from '../components/CodingLinks'; 

// --- THEME CONSTANTS (Consistent across components) ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#28a745'; // Teal/Green for completion

export default function ModuleCard({ module, completed, locked, onComplete, courseId, levelId }) {
  
  // --- 1. LOCKED MODULE (Unified Look) ---
  if (locked) {
    return (
      <div style={{ 
            padding: 18, 
            border: `1px solid ${SOFT_BORDER_COLOR}`, 
            borderRadius: 8, 
            background: '#F5F5F5', // Lightest gray background
            color: MUTE_GRAY, 
            marginBottom: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
        <strong>{module.title}</strong> ({module.type}) - Locked 🔒
      </div>
    );
  }

  let youtubeEmbedUrl = '';
  // ... YouTube URL parsing logic remains the same ...
  if (module.type === 'resource' && module.content && module.content.url) {
    try {
      const url = new URL(module.content.url);
      const videoId = url.searchParams.get('v');
      if (videoId) {
          youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else {
          youtubeEmbedUrl = module.content.url; 
      }
    } catch (e) {
      youtubeEmbedUrl = module.content.url; 
    }
  }

    const commonCardStyle = {
        padding: 18,
        border: `1px solid ${SOFT_BORDER_COLOR}`,
        borderRadius: 10,
        marginBottom: 14,
        background: 'white',
        boxShadow: '0 6px 18px rgba(16,24,40,0.04)',
        borderLeft: completed ? `6px solid ${SUCCESS_COLOR}` : `6px solid ${PRIMARY_COLOR}20`, // stronger left accent
        display: 'flex',
        flexDirection: 'column',
    };

          switch (module.type) {
        case 'resource': {
            // If we have a YouTube video id, embed using the IFrame API so we can listen for ended events
            // otherwise fall back to a simple iframe
            const videoIdMatch = youtubeEmbedUrl && youtubeEmbedUrl.match(/embed\/([a-zA-Z0-9_-]{6,})/);
            const youtubeId = videoIdMatch ? videoIdMatch[1] : null;

            // refs/state for player
            const playerRef = useRef(null);
            const playerInstanceRef = useRef(null);
            const [playerReady, setPlayerReady] = useState(false);
            const playStartedAtRef = useRef(null);

            useEffect(() => {
                let mounted = true;

                // helper to load YT API once
                const ensureYT = () => {
                    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
                    return new Promise((resolve) => {
                        const existing = document.getElementById('youtube-iframe-api');
                        if (!existing) {
                            const tag = document.createElement('script');
                            tag.src = 'https://www.youtube.com/iframe_api';
                            tag.id = 'youtube-iframe-api';
                            document.body.appendChild(tag);
                        }
                        const prev = window.onYouTubeIframeAPIReady;
                        window.onYouTubeIframeAPIReady = function () {
                            if (prev) prev();
                            resolve(window.YT);
                        };
                    });
                };

                const setupPlayer = async () => {
                    if (!youtubeId || !playerRef.current) return;
                    const YT = await ensureYT();

                    if (!mounted) return;

                    playerInstanceRef.current = new YT.Player(playerRef.current, {
                        videoId: youtubeId,
                        playerVars: { origin: window.location.origin, rel: 0 },
                        events: {
                            onReady: () => {
                                if (!mounted) return;
                                setPlayerReady(true);
                            },
                            onStateChange: (e) => {
                                // PLAYING = 1, PAUSED = 2, ENDED = 0
                                const state = e.data;
                                                if (state === 1) {
                                                    // started playing
                                                    if (!playStartedAtRef.current) playStartedAtRef.current = Date.now();
                                                }
                                                if (state === 0) {
                                                    // ended
                                                    const startedAt = playStartedAtRef.current || 0;
                                                    const playedMs = Date.now() - startedAt;
                                                    // require at least 4 seconds of play to avoid immediate seek-to-end cheats
                                                    if (playedMs >= 4000) {
                                                        try {
                                                            // call onComplete with minimal evidence (playedSeconds and a single range)
                                                            if (onComplete) onComplete({ playedRanges: [{ start: 0, end: Math.round(playedMs / 1000) }], duration: null, playedSeconds: Math.round(playedMs / 1000) });
                                                        } catch (err) {
                                                            console.error('onComplete error', err);
                                                        }
                                                    }
                                                }
                            }
                        }
                    });
                };

                setupPlayer();

                return () => {
                    mounted = false;
                    if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
                        try { playerInstanceRef.current.destroy(); } catch (e) { /* ignore */ }
                    }
                };
            }, [youtubeId]);

                        return (
                            <div style={commonCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY_COLOR }}>{module.title}</div>
                                        <div style={{ color: MUTE_GRAY, fontSize: 13, marginTop: 6 }}>{module.type.toUpperCase()}</div>
                                    </div>
                                </div>

                                                    <div style={{ marginTop: 12 }}>
                                    {youtubeId ? (
                                        <div style={{ width: '100%', maxWidth: 720, margin: '0 auto' }}>
                                            {/* responsive 16:9 container */}
                                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8 }}>
                                                <div id={`yt-player-${module._id}`} ref={playerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <small style={{ color: MUTE_GRAY }}>Video will auto-complete when finished playing.</small>
                                            </div>
                                        </div>
                                    ) : youtubeEmbedUrl ? (
                                        <div style={{ width: '100%', maxWidth: 720, margin: '0 auto' }}>
                                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8 }}>
                                                <iframe
                                                    src={youtubeEmbedUrl}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title={module.title}
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'red' }}>Resource URL not found or invalid.</p>
                                    )}
                                </div>

                                                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    {!completed ? (
                                        <button
                                            onClick={onComplete}
                                            style={{
                                                background: PRIMARY_COLOR,
                                                color: '#fff',
                                                padding: '10px 18px',
                                                borderRadius: 8,
                                                border: 'none',
                                                fontWeight: '700',
                                                boxShadow: '0 6px 12px rgba(71,62,122,0.12)'
                                            }}
                                        >
                                            Mark as Completed
                                        </button>
                                    ) : (
                                        <div style={{ color: SUCCESS_COLOR, fontWeight: 700 }}>Completed ✅</div>
                                    )}
                                </div>
                            </div>
                        );
        }

        case 'quiz':
            return (
                <div style={commonCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY_COLOR }}>{module.title}</div>
                            <div style={{ color: MUTE_GRAY, marginTop: 6 }}>{module.type.toUpperCase()}</div>
                        </div>
                        <div>
                            {completed && <div style={{ color: SUCCESS_COLOR, fontWeight: 700 }}>Completed ✅</div>}
                        </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        {!completed && !locked ? (
                            <Link
                                to={`/student/course/${courseId}/level/${levelId}/module/${module._id}/quiz`}
                                style={{
                                    display: 'inline-block',
                                    background: PRIMARY_COLOR,
                                    color: '#fff',
                                    padding: '10px 16px',
                                    textDecoration: 'none',
                                    borderRadius: 8,
                                    fontWeight: 700
                                }}
                            >
                                Start Quiz
                            </Link>
                        ) : null}

                        {locked && <div style={{ color: MUTE_GRAY, marginTop: 8 }}>This module is locked until previous module is completed.</div>}
                    </div>
                </div>
            );

    case 'coding': 
      // FIX: Since this card is only rendered if it's NOT locked, 
      // we remove the lock check and rely on the parent (CourseView.js) to filter.
      // If the parent calls this for an unlocked coding module, we pass the rendering to CodingLinks.
      
      // If you are rendering the *locked* coding module here (as per your original code),
      // we must rely on the 'locked' prop and render the content only if unlocked.
      
      // If this block is executed, it means the parent component (CourseView) 
      // determined it should be UNLOCKED, so we delegate to CodingLinks.
      
      // Note: If the parent sends 'locked: true', the function returns the locked div at the top.
            return (
                <div style={commonCardStyle}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY_COLOR }}>{module.title}</div>
                    <div style={{ color: MUTE_GRAY, marginTop: 6 }}>{module.type.toUpperCase()}</div>
                    <hr style={{ margin: '12px 0', borderTop: `1px solid ${SOFT_BORDER_COLOR}` }} />
                    <CodingLinks
                        courseId={courseId}
                        levelId={levelId}
                        moduleId={module._id}
                        content={module.content}
                        completed={completed}
                        onComplete={onComplete}
                    />
                </div>
            );

    default:
      return null;
  }
}