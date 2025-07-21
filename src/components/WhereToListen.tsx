export function WhereToListen() {
  return (
    <div className="flex gap-4 justify-evenly items-center bg-black " style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)' }}>
      <img 
        src="/src/assets/listen-on-apple.png" 
        alt="Listen on Apple Podcasts" 
        style={{ 
          height: 'clamp(30px, 8vw, 50px)', 
          maxWidth: 'clamp(180px, 50vw, 300px)', 
          width: 'auto' 
        }}
      />
      <img 
        src="/src/assets/listen-on-spotify.png" 
        alt="Listen on Spotify" 
        style={{ 
          height: 'clamp(36px, 10vw, 60px)', 
          maxWidth: 'clamp(180px, 50vw, 300px)', 
          width: 'auto' 
        }}
      />
      <img 
        src="/src/assets/listen-on-soundcloud.png" 
        alt="Listen on SoundCloud" 
        style={{ 
          height: 'clamp(36px, 10vw, 60px)', 
          maxWidth: 'clamp(180px, 50vw, 300px)', 
          width: 'auto' 
        }}
      />
    </div>
  )
}