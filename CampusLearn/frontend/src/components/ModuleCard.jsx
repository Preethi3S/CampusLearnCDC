import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import YouTube from 'react-youtube'; 

// --- THEME CONSTANTS (Consistent across components) ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981'; // Teal/Green for completion
const ACCENT_COLOR = '#4B6CB7';

// ---------------------------------------------------------------------
// 1. PLACEHOLDER COMPONENT: CodingLinks (For 'coding' module type)
// ---------------------------------------------------------------------
const CodingLinks = ({ content, completed, onComplete, locked }) => {
    // Assuming content is an array of links (strings)
    const links = Array.isArray(content) ? content : [];

    if (locked) {
        return (
            <div style={{ color: MUTE_GRAY, fontSize: '0.9em', opacity: 0.8 }}>
                <p>Coding assignment locked 🔒.</p>
            </div>
        );
    }
    
    return (
        <div>
            <p style={{ color: MUTE_GRAY, fontSize: '0.9em' }}>External Assignments:</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0' }}>
                {links.length > 0 ? (
                    links.map((link, index) => (
                        <li key={index} style={{ marginBottom: 5, borderLeft: `2px solid ${ACCENT_COLOR}`, paddingLeft: 8 }}>
                            <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT_COLOR, textDecoration: 'none' }}>
                                Assignment Link {index + 1}
                            </a>
                        </li>
                    ))
                ) : (
                    <li style={{ color: MUTE_GRAY }}>No links provided for this assignment.</li>
                )}
            </ul>
            
            {!completed && (
                <button 
                    onClick={onComplete} 
                    style={{ 
                        marginTop: 10, 
                        background: PRIMARY_COLOR, 
                        color: '#fff', 
                        padding: '8px 16px',
                        borderRadius: 4,
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Mark Coding Task as Completed
                </button>
            )}
            {completed && <p style={{ color: SUCCESS_COLOR, fontWeight: 'bold', marginTop: 10 }}>Completed ✅</p>}
        </div>
    );
};


// ---------------------------------------------------------------------
// 2. MAIN COMPONENT: ModuleCard
// ---------------------------------------------------------------------
export default function ModuleCard({ module, completed, locked, onComplete, courseId, levelId, isRestrictedVideo }) {
    
    // --- STATE/REFS FOR VIDEO ENFORCEMENT ---
    const playerRef = useRef(null); 
    const lastValidTime = useRef(0); 
    const intervalChecker = useRef(null);
    const videoDuration = useRef(0);
    const [videoCompleted, setVideoCompleted] = useState(completed); 
    
    useEffect(() => {
        setVideoCompleted(completed);
    }, [completed]);

    // --- UTILITY: Extract YouTube ID & Fallback URL ---
    let youtubeId = null;
    let fallbackUrl = '';
    if (module.type === 'resource' && module.content && module.content.url) {
        fallbackUrl = module.content.url;
        try {
            const url = new URL(module.content.url);
            const vId = url.searchParams.get('v');
            if (vId) {
                youtubeId = vId;
            }
        } catch (e) {
            // Ignore parsing error for non-youtube URLs
        }
    }
    
    // --- CORE LOGIC: FAST-FORWARD BLOCKER (STRICT RESET) ---
    const startFFBlocker = (player) => {
        if (intervalChecker.current) clearInterval(intervalChecker.current);
        
        intervalChecker.current = setInterval(() => {
            const currentTime = player.getCurrentTime();
            
            // CHECK 1: Fast-Forward Detection
            if (currentTime > lastValidTime.current + 1.5) { 
                
                // 🛑 IMMEDIATE RESET: Jump video to 0:00
                player.seekTo(0, true); 
                player.pauseVideo();
                
                lastValidTime.current = 0; 
                
                console.log("Fast-forwarding detected. Video reset to 0:00.");

            } else {
                // Update the checkpoint only if playback is progressing normally.
                lastValidTime.current = currentTime; 
            }
        }, 500); // Check every 500ms
    };

    const stopFFBlocker = () => {
        if (intervalChecker.current) {
            clearInterval(intervalChecker.current);
            intervalChecker.current = null;
        }
    };
    
    const onPlayerReady = (event) => {
        playerRef.current = event.target;
        
        videoDuration.current = event.target.getDuration();
        lastValidTime.current = event.target.getCurrentTime(); 
    };

    const onPlayerStateChange = (event) => {
        // State 1: Playing
        if (event.data === 1 && isRestrictedVideo && !videoCompleted) {
            startFFBlocker(event.target);
        } 
        // State 2: Paused, State 0: Ended
        else if (event.data === 2 || event.data === 0) {
            stopFFBlocker();
        }
    };
    
    // --- CORE LOGIC: AUTO-COMPLETION (COMPLETION GATE) ---
    const handleVideoEnd = () => {
        stopFFBlocker();
        
        // CRITICAL CHECK: Completion Gate (watched up to the final 5 seconds)
        const completionGate = videoDuration.current - 5; 
        
        if (lastValidTime.current < completionGate) {
            
            // Cheating detected: user jumped near the end 
            if (playerRef.current) {
                playerRef.current.seekTo(0, true);
                playerRef.current.pauseVideo();
                lastValidTime.current = 0;
            }
            console.log("Completion attempt failed. Insufficient continuous watch time. Video reset.");
            
            return; // EXIT: Do NOT mark as complete.
        }

        // If the gate is passed, mark as complete
        if (!videoCompleted) {
            setVideoCompleted(true); 
            // Call onComplete to update parent state/API
            onComplete(); 
            console.log("Module completed automatically.");
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return stopFFBlocker; 
    }, []);

    // --- RENDER LOGIC ---
    if (locked) {
        return (
            <div style={{ padding: 15, border: `1px solid ${SOFT_BORDER_COLOR}`, borderRadius: 8, background: '#F0F0F0' }}>
                <strong style={{ color: MUTE_GRAY }}>{module.title}</strong> ({module.type}) - Locked 🔒
                <p style={{ color: MUTE_GRAY, fontSize: '0.9em' }}>Complete the previous module to unlock this one.</p>
            </div>
        );
    }
        
    const commonCardStyle = {
        padding: 15, 
        border: `1px solid ${SOFT_BORDER_COLOR}`, 
        borderRadius: 8, 
        marginBottom: 12,
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderLeft: videoCompleted ? `4px solid ${SUCCESS_COLOR}` : `4px solid ${PRIMARY_COLOR}20` 
    };

    switch (module.type) {
        case 'resource': 
            return (
                <div style={commonCardStyle}>
                    <strong style={{ color: PRIMARY_COLOR }}>{module.title}</strong> ({module.type})
                    <div style={{ marginTop: 12, marginBottom: 8, overflow: 'hidden' }}>
                        
                        {/* --- RESTRICTED YOUTUBE PLAYER --- */}
                        {isRestrictedVideo && youtubeId ? (
                            <YouTube
                                videoId={youtubeId}
                                opts={{
                                    height: '315',
                                    width: '100%',
                                    playerVars: {
                                        modestbranding: 1,
                                        rel: 0,
                                        showinfo: 0,
                                    },
                                }}
                                onReady={onPlayerReady}
                                onStateChange={onPlayerStateChange}
                                onEnd={handleVideoEnd} // Auto-completion trigger
                            />
                        ) : (
                            /* --- FALLBACK/NON-RESTRICTED RESOURCE --- */
                            <div>
                                <iframe
                                    src={fallbackUrl}
                                    title={module.title}
                                    width="100%" 
                                    height="315"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ maxWidth: '100%' }}
                                ></iframe>
                                {!youtubeId && fallbackUrl && (
                                    <p style={{marginTop: 10}}>View resource: <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" style={{ color: PRIMARY_COLOR }}>Link</a></p>
                                )}
                                {!fallbackUrl && <p style={{ color: 'red' }}>Resource URL not found or invalid.</p>}
                            </div>
                        )}
                    </div>
                    
                    {/* The Mark as Completed button is ONLY shown for non-restricted resources */}
                    {!videoCompleted && !isRestrictedVideo && (
                        <button 
                            onClick={onComplete} // Manual completion trigger
                            style={{ 
                                marginTop: 8, 
                                background: PRIMARY_COLOR, 
                                color: '#fff', 
                                padding: '8px 16px',
                                borderRadius: 4,
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Mark as Completed (Manual)
                        </button>
                    )}
                        
                    {/* Completion status display */}
                    {videoCompleted && <p style={{ color: SUCCESS_COLOR, fontWeight: 'bold' }}>Completed ✅</p>}

                </div>
            );

        case 'quiz': 
            return (
                <div style={commonCardStyle}>
                    <strong style={{ color: PRIMARY_COLOR }}>{module.title}</strong> ({module.type})
                    <p style={{ color: MUTE_GRAY, fontSize: '0.9em' }}>{module.content.length || 0} Questions</p>
                    {!videoCompleted && !locked ? (
                        <Link
                            to={`/student/course/${courseId}/level/${levelId}/module/${module._id}/quiz`}
                            style={{ 
                                display: 'inline-block', 
                                marginTop: 10, 
                                background: PRIMARY_COLOR, 
                                color: '#fff', 
                                padding: '8px 16px', 
                                textDecoration: 'none',
                                borderRadius: 4,
                                border: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Start Quiz
                        </Link>
                    ) : null}
                    {videoCompleted && <p style={{ color: SUCCESS_COLOR, fontWeight: 'bold' }}>Completed ✅</p>}
                    {locked && <p style={{ color: MUTE_GRAY }}>This module is locked until previous module is completed.</p>}
                </div>
            );

        case 'coding': 
            return (
                <div style={commonCardStyle}>
                    <strong style={{ color: PRIMARY_COLOR }}>{module.title}</strong> ({module.type})
                    <hr style={{ margin: '8px 0', borderTop: `1px solid ${SOFT_BORDER_COLOR}` }}/>
                    <CodingLinks 
                        content={module.content}
                        completed={videoCompleted} 
                        onComplete={onComplete} // Manual completion trigger for coding module
                        locked={locked}
                    />
                </div>
            );

        default:
            return null;
    }
}
