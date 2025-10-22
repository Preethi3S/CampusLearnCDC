import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import YouTube from 'react-youtube'; 
// import CodingLinks from '../components/CodingLinks'; 

// --- THEME CONSTANTS (Consistent across components) ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple (Dark color)
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const MUTE_GRAY = '#6B7280'; // Dark gray (used for contrast background)
const SUCCESS_COLOR = '#10B981'; // Teal/Green for completion
const TEXT_ON_LIGHT_BACKGROUND = '#333333'; // Explicit dark text color for high contrast

export default function ModuleCard({ module, completed, locked, onComplete, courseId, levelId, onVideoEnd, isRestrictedVideo }) {
  
    // --- STATE/REFS FOR VIDEO ENFORCEMENT ---
    const playerRef = useRef(null); 
    const lastValidTime = useRef(0); 
    const intervalChecker = useRef(null);
    const videoDuration = useRef(0); // Store total video duration
    const [videoCompleted, setVideoCompleted] = useState(completed); 
    
    // --- NEW STATE FOR RESUME FUNCTIONALITY ---
    // Stores the latest progress time saved in storage for this module
    const [resumeTime, setResumeTime] = useState(0); 
    
    // Key used to store/retrieve progress in localStorage
    const STORAGE_KEY = `module_progress_${module._id}`;

    // Sync local state when external 'completed' prop changes 
    useEffect(() => {
        setVideoCompleted(completed);
    }, [completed]);

    // --- NEW: Load saved progress from localStorage on component mount ---
    useEffect(() => {
        if (isRestrictedVideo) {
            const savedTime = localStorage.getItem(STORAGE_KEY);
            if (savedTime && !completed) {
                // Only set resume time if the video is not yet completed
                setResumeTime(parseFloat(savedTime));
            }
        }
    }, [module._id, isRestrictedVideo, completed, STORAGE_KEY]);


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
            
            // NEW: Save progress every 5 seconds while playing (more efficient than every check)
            if (Math.floor(currentTime) % 5 === 0 && currentTime > 0) {
                 localStorage.setItem(STORAGE_KEY, currentTime.toFixed(0));
            }
            
            // CHECK 1: Fast-Forward Detection (1.5s is buffer against stutter)
            if (currentTime > lastValidTime.current + 1.5) { 
                
                // 🛑 IMMEDIATE RESET: Jump video to 0:00
                player.seekTo(0, true); 
                player.pauseVideo();
                
                // Reset the valid time checkpoint
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
        // FINAL SAVE on pause/stop (if not completed)
        if (playerRef.current && !videoCompleted) {
            const finalTime = playerRef.current.getCurrentTime();
            localStorage.setItem(STORAGE_KEY, finalTime.toFixed(0));
            console.log("Progress saved at:", finalTime.toFixed(0), "seconds.");
        }
    };
    
    const onPlayerReady = (event) => {
        playerRef.current = event.target;
        
        // Get and store the video duration
        videoDuration.current = event.target.getDuration();
        
        // --- RESUME LOGIC ---
        // If there's saved time, seek to it, but only if the video isn't completed
        if (resumeTime > 0 && !videoCompleted) {
            event.target.seekTo(resumeTime, true);
            lastValidTime.current = resumeTime; // Set checkpoint to resume time
            console.log(`Resuming video from saved time: ${resumeTime} seconds.`);
        } else {
            // Set the initial checkpoint to 0 if starting fresh
            lastValidTime.current = event.target.getCurrentTime();
        }
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
        
        // CRITICAL CHECK: Completion Gate
        // User must have watched up to the final 5 seconds (configurable buffer)
        const completionGate = videoDuration.current - 5; 
        
        if (lastValidTime.current < completionGate) {
            
            // Cheating detected: user jumped near the end to trigger onEnd without continuous watch time.
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
            onVideoEnd(); 
            
            // --- Remove progress on successful completion ---
            localStorage.removeItem(STORAGE_KEY);
            
            console.log("Module completed automatically.");
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        // Stop checker and save final progress when component is unmounted (e.g., navigating away)
        return () => {
             stopFFBlocker();
             // The final save logic is now inside stopFFBlocker, which runs on cleanup
        }; 
    }, [videoCompleted, STORAGE_KEY]);


    // --- 1. LOCKED MODULE (No Change) ---
    if (locked) {
      return (
        <div style={{ /* ... styles ... */ }}>
        <strong>{module.title}</strong> ({module.type}) - Locked 🔒
      </div>
    );
  }
    
    // --- 2. RESUME PLAYBACK BUTTON (NEW UI) ---
    const handleStartFromScratch = () => {
        localStorage.removeItem(STORAGE_KEY);
        setResumeTime(0); // Clear local state, component will re-render or video will reload from 0
        
        if (playerRef.current) {
            playerRef.current.seekTo(0, true);
            playerRef.current.playVideo();
        }
        console.log("User chose to start from scratch.");
    };

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
                <>
                    {/* NEW: Display Resume/Start Over options */}
                    {resumeTime > 0 && !videoCompleted && (
                         <div style={{ 
                                padding: '10px 15px', 
                                border: `1px dashed ${PRIMARY_COLOR}`,
                                backgroundColor: '#F0F0F0', /* Light background for the banner */
                                marginBottom: 15 
                            }}>
                            <p style={{ 
                                margin: 0, 
                                fontWeight: 'bold',
                                color: TEXT_ON_LIGHT_BACKGROUND /* Ensure high contrast text */
                            }}>
                                Resume from {Math.floor(resumeTime / 60)}m {Math.floor(resumeTime % 60)}s?
                            </p>
                            <button 
                                onClick={handleStartFromScratch}
                                style={{
                                    marginTop: 10,
                                    padding: '6px 12px',
                                    border: 'none',
                                    background: MUTE_GRAY,
                                    color: '#fff', /* White text on dark gray MUTE_GRAY for high contrast */
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Start from Scratch
                            </button>
                        </div>
                    )}
                    
                    <YouTube
                        videoId={youtubeId}
                        opts={{
                            height: '315',
                            width: '100%',
                            playerVars: {
                                // controls: videoCompleted ? 1 : 0, // Optionally hide controls if not completed
                                start: resumeTime > 0 && !videoCompleted ? resumeTime : 0 // Set start time if resumeTime is available
                            },
                        }}
                        onReady={onPlayerReady}
                        onStateChange={onPlayerStateChange}
                        onEnd={handleVideoEnd} // 👈 Auto-completion trigger
                    />
                </>
            ) : (
                /* --- FALLBACK/NON-RESTRICTED RESOURCE --- */
                <div>
                    <iframe
                        src={fallbackUrl}
                        width="100%" 
                        height="315"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ maxWidth: 560 }}
                    ></iframe>
                    {!youtubeId && fallbackUrl && (
                        <p style={{marginTop: 10}}>View resource: <a href={fallbackUrl} target="_blank" rel="noopener noreferrer">Link</a></p>
                    )}
                    {!fallbackUrl && <p style={{ color: 'red' }}>Resource URL not found or invalid.</p>}
                </div>
            )}
          </div>
          
            {/* The Mark as Completed button is ONLY shown for non-restricted resources */}
          {!videoCompleted && !isRestrictedVideo ? (
            <button 
                onClick={onComplete} 
                style={{ 
                    marginTop: 8, 
                    background: PRIMARY_COLOR, 
                    color: '#fff', 
                    padding: '8px 16px',
                    borderRadius: 4,
                    border: 'none',
                    fontWeight: 'bold'
                }}
            >
              Mark as Completed (Manual)
            </button>
          ) : null}
            
            {/* Completion status display */}
            {videoCompleted && <p style={{ color: SUCCESS_COLOR, fontWeight: 'bold' }}>Completed ✅</p>}

        </div>
      );

    case 'quiz': 
      return (
        <div style={commonCardStyle}>
          <strong style={{ color: PRIMARY_COLOR }}>{module.title}</strong> ({module.type})
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
                courseId={courseId}
                levelId={levelId}
                moduleId={module._id}
                content={module.content}
                completed={videoCompleted} 
                onComplete={onComplete} 
            />
        </div>
      );

    default:
      return null;
  }
}