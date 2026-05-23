document.addEventListener("DOMContentLoaded", () => {
    // 1. VIP CHECK: Kya player pehle se login hai?
    const savedPlayer = localStorage.getItem("activePlayer");

    if (savedPlayer) {
        // AGAR LOGIN HAI: Sab kuch chupao aur seedha Dashboard kholo
        document.getElementById("intro-screen").style.display = "none";
        document.getElementById("bg-video").style.display = "none";
        document.getElementById("loader-wrapper").style.display = "none";
        document.getElementById("start-btn").style.display = "none";
        
        // Dashboard dikhao aur naam set karo
        document.getElementById("dash-player-name").innerText = savedPlayer.toUpperCase();
        document.getElementById("dashboard-screen").style.display = "flex";
        console.log("Welcome back! Skipped to Dashboard.");

    } else {
        // AGAR LOGIN NAHI HAI: Normal Intro Animation chalao (Aapka purana logic)
        const introScreen = document.getElementById("intro-screen");
        const video = document.getElementById("bg-video");
        const loaderWrapper = document.getElementById("loader-wrapper");
        const loadingText = document.getElementById("loading-text");
        const loadingFill = document.getElementById("loading-fill");
        const startBtn = document.getElementById("start-btn");

        setTimeout(() => {
            introScreen.style.opacity = "0";
            setTimeout(() => {
                introScreen.style.display = "none";
                video.playbackRate = 0.4; 
                video.style.opacity = "1";
                video.play();
                loaderWrapper.style.display = "flex";
                loaderWrapper.style.animation = "fadeIn 1s ease-in-out forwards";

                let percent = 0;
                const interval = setInterval(() => {
                    percent++;
                    loadingText.innerText = "LOADING SYSTEM... " + percent + "%";
                    loadingFill.style.width = percent + "%";
                    if (percent >= 100) {
                        clearInterval(interval);
                        loadingText.innerText = "AWAITING ENTRY...";
                        setTimeout(() => {
                            loaderWrapper.style.display = "none";
                            startBtn.style.display = "block";
                        }, 1500); 
                    }
                }, 80); 
            }, 1000); 
        }, 6500); 
    }
});

// Jab 'UNLOCK THE GATES' button par click hoga
function showLogin() {
    const startBtn = document.getElementById("start-btn");
    const loginModal = document.getElementById("login-modal");

    startBtn.style.display = "none";
    loginModal.style.display = "flex";
}

// Function to switch between Login and Register tabs
function switchTab(tab) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formTitle = document.getElementById("form-title");

    if (tab === 'login') {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        formTitle.innerText = "IDENTIFY YOURSELF";
    } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        formTitle.innerText = "AWAKEN NEW SEEKER";
    }
}

// Function to handle Submit for both Login and Register
async function submitAuth(type) {
    let user = "", pass = "";

    if (type === 'login') {
        user = document.getElementById("login-user").value;
        pass = document.getElementById("login-pass").value;
    } else {
        user = document.getElementById("reg-user").value;
        pass = document.getElementById("reg-pass").value;
        const confirmPass = document.getElementById("reg-pass-confirm").value;

        if (pass !== confirmPass) {
            showCinematicToast("PASSCODES DO NOT MATCH");
            return;
        }
    }

    if (user === "" || pass === "") {
        showCinematicToast("ALL FIELDS REQUIRED");
        return;
    }

    const targetUrl = type === 'login' ? "http://localhost:8080/login" : "http://localhost:8080/register";

    try {
        let response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass)
        });

        let result = await response.text();

        // SUCCESS
        if (result.includes("Successful")) {
            showCinematicToast(result, "success");

            // 2. SAVE VIP TICKET: Login successful hone par browser ki memory mein naam save karo
            localStorage.setItem("activePlayer", user);

            setTimeout(() => {
                document.getElementById("login-modal").style.display = "none";
                startDungeonTransition(user);
            }, 1200);

        } else {
            // ERROR
            showCinematicToast(result);
        }
    } catch (error) {
        showCinematicToast("C++ SERVER OFFLINE");
        console.log(error);
    }
}

// Password Show/Hide Toggle Logic
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";     
        icon.innerText = "🔓";  
    } else {
        input.type = "password"; 
        icon.innerText = "👁️";  
    }
}

// ==========================================
// EPIC VIDEO TRANSITION & WELCOME LOGIC
// ==========================================
function startDungeonTransition(playerName) {
    const video = document.getElementById("bg-video");
    video.style.opacity = "0"; 

    setTimeout(() => {
        video.src = "video2.mp4"; 
        video.loop = false; 
        video.playbackRate = 1.0; 
        
        video.play().then(() => {
            video.style.opacity = "1";
            
            let durationInMs = video.duration * 1000;
            if (!durationInMs || isNaN(durationInMs)) {
                durationInMs = 6000; 
            }

            setTimeout(() => {
                video.pause(); 
                showWelcomeSequence(playerName); 
            }, durationInMs - 5);

        }).catch(err => {
            console.log("Video Play Error:", err);
            showCinematicToast("VIDEO PLAYBACK FAILED");
        });
    }, 1000); 
}

function showWelcomeSequence(playerName){
    const entryScreen = document.getElementById("dungeon-entry");
    const dynamicName = document.getElementById("dynamic-name");
    
    // Nayi Line: HUD mein naam update karo
    const hudName = document.getElementById("hud-player-name");
    if (hudName) {
        hudName.innerText = playerName.toUpperCase(); 
    }

    dynamicName.innerText = playerName.toUpperCase();
    entryScreen.style.display = "flex";

    setTimeout(() => {
        console.log("AAA INTRO COMPLETE - STARTING STORY");
        playStoryVideo();
    }, 1500);
}

// ==========================================
// STORY VIDEO & DASHBOARD LOGIC
// ==========================================
function playStoryVideo() {
    document.getElementById("dungeon-entry").style.display = "none";
    document.getElementById("bg-video").style.display = "none"; 

    const storyScreen = document.getElementById("story-screen");
    const storyVideo = document.getElementById("story-video");

    storyScreen.style.display = "block";
    storyVideo.play();

    storyVideo.onended = () => {
        goToDashboard();
    };
}

function skipStory() {
    const storyVideo = document.getElementById("story-video");
    storyVideo.pause(); 
    goToDashboard();
}

// DASHBOARD STATE SCREEN OPEN
function goToDashboard() {
    document.getElementById("story-screen").style.display = "none";
    document.getElementById("dashboard-screen").style.display = "flex";
    
    // --- NAYA LOGIC: Memory se naam uthao aur Dashboard par lagao ---
    const savedPlayer = localStorage.getItem("activePlayer");
    if (savedPlayer) {
        document.getElementById("dash-player-name").innerText = savedPlayer.toUpperCase();
    }
    
    console.log("Story Finished/Skipped. Welcome to the Dashboard!");
}

function showCinematicToast(message, type = "error") {
    const oldToast = document.querySelector(".cinematic-toast");
    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "cinematic-toast";

    let borderColor = "#ff5722";
    let glowColor = "#ff9800";

    if (type === "success") {
        borderColor = "#00ff99";
        glowColor = "#00ffcc";
    }

    toast.style.cssText = `
        position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.92); color: #fff; padding: 18px 35px;
        border-radius: 12px; border: 2px solid ${borderColor};
        font-family: 'Cinzel', serif; font-size: 1.1rem; letter-spacing: 2px;
        z-index: 9999; box-shadow: 0 0 25px ${glowColor}; backdrop-filter: blur(8px);
        animation: toastIn 0.5s ease forwards; text-align: center; min-width: 300px;
    `;

    toast.innerHTML = `
        <div style="font-size:1.2rem; margin-bottom:6px; color:${borderColor}; text-shadow:0 0 10px ${glowColor};">
            ${type === "success" ? "ACCESS GRANTED" : "ACCESS DENIED"}
        </div>
        <div>${message}</div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.5s ease forwards";
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 2500);
}

// ==========================================
// LOGOUT LOGIC
// ==========================================
function logoutUser() {
    // Memory se naam delete karo
    localStorage.removeItem("activePlayer");
    // Page refresh karo (ab memory khali hai toh intro se shuru hoga)
    location.reload(); 
}