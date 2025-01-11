window.addEventListener('load', function() {
    const audio = document.getElementById('backgroundAudio');
    audio.play().catch(function(error) {
        console.log("Audio autoplay failed:", error);
    });
}); 