/* ================================================
   PandaTravel AI — Application Logic
   ================================================ */

// ====== DOM References ======
const splash = document.getElementById('splash-screen');
const appWrapper = document.getElementById('app-wrapper');
const navMenu = document.getElementById('nav-menu');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const pageTitle = document.getElementById('page-title');

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const btnSend = document.getElementById('btn-send');
const btnVoice = document.getElementById('btn-voice');

const pandaBody = document.querySelector('.panda-body');
const pandaMouth = document.getElementById('panda-mouth');
const speechBubble = document.getElementById('speech-bubble');
const bubbleText = document.getElementById('bubble-text');
const statusLabel = document.getElementById('status-label');
const actionParticles = document.getElementById('action-particles');

const currentDestEl = document.getElementById('current-dest');

// Stats
const statTrips = document.getElementById('stat-trips');
const statBudget = document.getElementById('stat-budget');
const statBookings = document.getElementById('stat-bookings');

// Budget
const budgetAmount = document.getElementById('budget-amount');
const budgetRemaining = document.getElementById('budget-remaining');
const budgetBarFill = document.getElementById('budget-bar-fill');
const expenseListEl = document.getElementById('expense-list');

// Quick cards
const quickCards = document.querySelectorAll('.quick-card');

// ====== App State ======
const state = {
    destination: null,
    days: 0,
    budget: 0,
    spent: 0,
    expenses: [],
    bookings: [],
    itinerary: [],
};

// ====== Destination Data (Simulated) ======
const destinationData = {
    'tokyo': {
        name: 'Tokyo, Japan', emoji: '🗼',
        activities: [
            ['🛕', 'Visit Senso-ji Temple'],
            ['🍜', 'Ramen tasting in Shinjuku'],
            ['🎮', 'Explore Akihabara Electric Town'],
            ['🌸', 'Walk through Ueno Park'],
            ['🛍️', 'Shopping in Harajuku'],
            ['🏯', 'Day trip to Kamakura'],
            ['🍣', 'Sushi breakfast at Tsukiji Market'],
            ['🗻', 'View Mt. Fuji from Hakone'],
            ['🌃', 'Tokyo Skytree at sunset'],
            ['♨️', 'Traditional onsen experience'],
        ],
        flightCost: 680,
        hotelPerNight: 120,
    },
    'paris': {
        name: 'Paris, France', emoji: '🗼',
        activities: [
            ['🗼', 'Eiffel Tower sunrise visit'],
            ['🎨', 'Explore the Louvre Museum'],
            ['🥐', 'Croissant breakfast in Montmartre'],
            ['⛪', 'Notre-Dame Cathedral area'],
            ['🚢', 'Seine River evening cruise'],
            ['🏰', 'Day trip to Versailles Palace'],
            ['🍷', 'Wine tasting in Le Marais'],
            ['🎭', 'Moulin Rouge show'],
            ['📸', 'Champs-Élysées & Arc de Triomphe'],
            ['🌹', 'Luxembourg Gardens stroll'],
        ],
        flightCost: 520,
        hotelPerNight: 150,
    },
    'new york': {
        name: 'New York, USA', emoji: '🗽',
        activities: [
            ['🗽', 'Statue of Liberty ferry'],
            ['🌳', 'Morning jog in Central Park'],
            ['🎭', 'Broadway show night'],
            ['🏙️', 'Top of the Rock view'],
            ['🍕', 'Pizza tour in Brooklyn'],
            ['🎨', 'MET Museum exploration'],
            ['🌉', 'Brooklyn Bridge walk at sunset'],
            ['🛍️', 'Shopping on Fifth Avenue'],
            ['🍝', 'Little Italy food crawl'],
            ['🌃', 'Times Square nightlife'],
        ],
        flightCost: 380,
        hotelPerNight: 200,
    },
    'bali': {
        name: 'Bali, Indonesia', emoji: '🏝️',
        activities: [
            ['🌅', 'Sunrise at Mount Batur'],
            ['🛕', 'Visit Uluwatu Temple'],
            ['🌾', 'Tegallalang Rice Terraces walk'],
            ['🐒', 'Monkey Forest in Ubud'],
            ['🏄', 'Surfing lessons in Kuta'],
            ['💆', 'Traditional Balinese spa'],
            ['🤿', 'Snorkeling in Nusa Penida'],
            ['🌺', 'Tirta Empul water temple'],
            ['🍛', 'Balinese cooking class'],
            ['🌊', 'Tanah Lot sunset view'],
        ],
        flightCost: 450,
        hotelPerNight: 80,
    },
    'london': {
        name: 'London, UK', emoji: '🇬🇧',
        activities: [
            ['🏰', 'Tour the Tower of London'],
            ['🎡', 'London Eye ride'],
            ['👑', 'Buckingham Palace visit'],
            ['🎭', 'West End theatre show'],
            ['🍺', 'English pub experience'],
            ['📚', 'British Museum exploration'],
            ['🌉', 'Walk across Tower Bridge'],
            ['🛍️', 'Oxford Street shopping'],
            ['🧁', 'Afternoon tea at The Ritz'],
            ['🎸', 'Camden Market & live music'],
        ],
        flightCost: 490,
        hotelPerNight: 170,
    },
};

const titles = { home: 'Welcome Home', planner: 'Trip Planner', budget: 'Budget Manager', bookings: 'My Bookings' };

// ====== Splash Screen ======
setTimeout(() => {
    splash.classList.add('hidden');
    appWrapper.style.opacity = '1';
    
    setPandaState('waving');
    showBubble('Hiii~! I\'m Panda! 🐼💕');
    // Say hello with cute voice after voices load
    setTimeout(() => {
        speak('Hiii! I am your adorable Panda travel buddy! Tell me where you wanna go!');
    }, 800);
    setTimeout(() => setPandaState('idle'), 5000);
}, 2500);

// ====== Navigation ======
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const viewId = item.dataset.view;
        switchView(viewId);
    });
});

function switchView(viewId) {
    navItems.forEach(n => n.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    document.getElementById(`view-${viewId}`).classList.add('active');
    pageTitle.textContent = titles[viewId] || 'PandaTravel';
}

// Quick cards
quickCards.forEach(card => {
    card.addEventListener('click', () => {
        const action = card.dataset.action;
        if (action === 'plan-trip') {
            chatInput.value = 'Plan a trip to Tokyo';
            handleSend();
        } else if (action === 'set-budget') {
            chatInput.value = 'Set my budget to 3000 dollars';
            handleSend();
        } else if (action === 'book-ticket') {
            chatInput.value = 'Book a flight';
            handleSend();
        } else if (action === 'explore') {
            chatInput.value = 'Show me trending destinations';
            handleSend();
        }
    });
});

// ====== Panda Animation Controller ======
function setPandaState(st) {
    pandaBody.classList.remove('waving', 'working', 'celebrating');
    pandaMouth.classList.remove('talking', 'happy');
    
    switch(st) {
        case 'waving':
            pandaBody.classList.add('waving');
            statusLabel.textContent = '✨ Waving at you~!';
            break;
        case 'working':
            pandaBody.classList.add('working');
            statusLabel.textContent = '🔧 Working on it~...';
            break;
        case 'talking':
            pandaMouth.classList.add('talking');
            statusLabel.textContent = '🗣️ Speaking~...';
            break;
        case 'celebrating':
            pandaBody.classList.add('celebrating');
            pandaMouth.classList.add('happy');
            statusLabel.textContent = '🎉 Yaaay~!';
            spawnFloatingHearts();
            break;
        case 'listening':
            statusLabel.textContent = '🎤 Listening to you~...';
            break;
        default:
            statusLabel.textContent = '💚 Ready to help~!';
    }
}

function showBubble(text, duration = 3000) {
    bubbleText.textContent = text;
    speechBubble.classList.add('visible');
    setTimeout(() => speechBubble.classList.remove('visible'), duration);
}

function spawnParticles(emojis) {
    emojis.forEach((emoji, i) => {
        setTimeout(() => {
            const el = document.createElement('span');
            el.className = 'action-particle';
            el.textContent = emoji;
            el.style.left = `${40 + Math.random() * 50}px`;
            el.style.top = `${80 + Math.random() * 40}px`;
            el.style.setProperty('--tx', `${-40 + Math.random() * 80}px`);
            el.style.setProperty('--ty', `${-60 - Math.random() * 40}px`);
            actionParticles.appendChild(el);
            setTimeout(() => el.remove(), 1500);
        }, i * 200);
    });
}

// ====== Chat & AI Logic ======
function addMessage(sender, html) {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}-msg`;
    msg.innerHTML = `
        <div class="msg-avatar">${sender === 'panda' ? '🐼' : 'You'}</div>
        <div class="msg-content">${html}</div>
    `;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'msg panda-msg';
    el.id = 'typing-indicator';
    el.innerHTML = `
        <div class="msg-avatar">🐼</div>
        <div class="typing-dots"><span></span><span></span><span></span></div>
    `;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage('user', text);
    chatInput.value = '';
    
    // Panda starts working
    setPandaState('working');
    showBubble('Hmm~ let me think! 🤔💭');
    addTypingIndicator();
    
    // Simulate AI processing time
    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
        removeTypingIndicator();
        const response = processIntent(text);
        addMessage('panda', response.text);
        speak(response.text.replace(/<[^>]*>/g, '')); // strip HTML for TTS
        
        if (response.action) response.action();
        
        // End state
        setTimeout(() => setPandaState('idle'), 3000);
    }, delay);
}

function processIntent(input) {
    const lower = input.toLowerCase();
    
    // ---- GREETING ----
    if (/^(hi|hello|hey|howdy|sup)/.test(lower)) {
        setPandaState('waving');
        spawnParticles(['👋', '✨', '🐼', '💕']);
        return { text: "Hiii~! 👋💕 I'm your cute little Panda guide! Hehe~ You can tell me to <em>plan a trip</em>, <em>set a budget</em>, or <em>book tickets</em>! Where do you wanna go? I'm sooo excited~! ✨🐼" };
    }
    
    // ---- EXPLORE / TRENDING ----
    if (lower.includes('explore') || lower.includes('trending') || lower.includes('suggest') || lower.includes('recommend')) {
        spawnParticles(['🌍', '✈️', '🗺️', '🏝️', '🌟']);
        setPandaState('celebrating');
        const dests = Object.values(destinationData);
        const list = dests.map(d => `${d.emoji} <strong>${d.name}</strong> — Flights from $${d.flightCost}`).join('<br>');
        return { text: `Ooh ooh~! These are super popular right now! 🌎✨<br><br>${list}<br><br>Just tell me which one you like, like <em>"Plan a trip to Bali"</em>! I'll take care of everything~ 💕` };
    }
    
    // ---- PLAN TRIP ----
    if (lower.includes('plan') || lower.includes('trip to') || lower.includes('go to') || lower.includes('visit')) {
        let destKey = null;
        for (const key of Object.keys(destinationData)) {
            if (lower.includes(key)) { destKey = key; break; }
        }
        
        if (!destKey) {
            return { text: "Ooh a trip~! Yay yay! 🎉 Where are we going? I know about <em>Tokyo, Paris, New York, Bali,</em> and <em>London</em>! Just tell me the name and I'll start planning, hehe~ 🐼💕" };
        }
        
        const dest = destinationData[destKey];
        let days = 3;
        const dayMatch = lower.match(/(\d+)\s*(day|night)/);
        if (dayMatch) days = Math.min(parseInt(dayMatch[1]), 10);
        if (lower.includes('week')) days = 7;
        if (lower.includes('weekend')) days = 3;
        
        state.destination = dest.name;
        state.days = days;
        state.itinerary = [];
        
        for (let i = 0; i < days; i++) {
            const acts = [];
            const start = (i * 2) % dest.activities.length;
            acts.push(dest.activities[start % dest.activities.length]);
            acts.push(dest.activities[(start + 1) % dest.activities.length]);
            state.itinerary.push({ day: i + 1, activities: acts });
        }
        
        currentDestEl.textContent = dest.name;
        statTrips.textContent = '1';
        
        spawnParticles(['✈️', '🗺️', '🎒', '🌟', dest.emoji]);
        setPandaState('celebrating');
        showBubble(`${dest.name}! 🎉`, 4000);
        
        renderItinerary();
        
        return {
            text: `Tadaaa~! 🎉✨ I made you an amazing <strong>${days}-day trip to ${dest.name}</strong>! ${dest.emoji}<br><br>Go check the <em>Trip Plan</em> tab — I worked sooo hard on it, hehe! 🐼💪 Want me to <em>set a budget</em> or <em>book flights</em> too~?`,
            action: () => setTimeout(() => switchView('planner'), 1500),
        };
    }
    
    // ---- SET BUDGET ----
    if (lower.includes('budget') || lower.includes('dollar') || lower.includes('$') || lower.includes('money')) {
        const numMatch = lower.match(/(\d[\d,]*)/);
        if (numMatch) {
            const amount = parseInt(numMatch[1].replace(/,/g, ''));
            state.budget = amount;
            statBudget.textContent = `$${amount.toLocaleString()}`;
            
            spawnParticles(['💰', '💵', '🪙', '✨']);
            setPandaState('celebrating');
            showBubble(`$${amount.toLocaleString()} Budget! 💰`);
            
            renderBudget();
            
            return {
                text: `Okie dokie~! 💰✨ Your budget is <strong>$${amount.toLocaleString()}</strong>! I'll be a super careful little panda and watch every penny, I promise! 🐼💕 Check the <em>Budget</em> tab!`,
                action: () => setTimeout(() => switchView('budget'), 1500),
            };
        }
        return { text: "How much money do we have to play with~? 🤗 Just say a number, like <em>set budget to 2000 dollars</em>! I'll keep track of it all! 💰🐼" };
    }
    
    // ---- BOOK FLIGHT ----
    if (lower.includes('book') || lower.includes('flight') || lower.includes('ticket')) {
        if (!state.destination) {
            return { text: "Ooh I wanna book stuff too~! But first, tell me where we're going! 🐼 Say something like <em>plan a trip to Paris</em> and then I'll find the best deals, I promise! ✨" };
        }
        
        const destKey = Object.keys(destinationData).find(k => state.destination.toLowerCase().includes(k));
        const dest = destKey ? destinationData[destKey] : { flightCost: 500, hotelPerNight: 120 };
        
        spawnParticles(['🔍', '✈️', '🎫', '💺']);
        setPandaState('working');
        showBubble('Searching flights... ✈️', 4000);
        
        const booking = {
            type: 'flight',
            title: `Flight to ${state.destination}`,
            details: `Round-trip economy • ${state.days} days`,
            cost: dest.flightCost,
            icon: 'fa-solid fa-plane',
        };
        
        state.bookings.push(booking);
        addExpense('Flight', 'flight', dest.flightCost);
        statBookings.textContent = state.bookings.length;
        
        renderBookings();
        renderBudget();
        
        return {
            text: `Yaaay~! ✅ <strong>Flight booked!</strong> I did it, I did it! 🎉🐼<br>🛫 Round-trip to ${state.destination}<br>💳 Cost: <strong>$${dest.flightCost}</strong><br><br>I added it to your <em>Bookings</em>! Want me to <em>book a hotel</em> too~? I'll find a comfy one! 🏨💕`,
            action: () => {
                setTimeout(() => {
                    setPandaState('celebrating');
                    spawnParticles(['🎉', '✅', '🎊']);
                }, 500);
                setTimeout(() => switchView('bookings'), 2000);
            },
        };
    }
    
    // ---- BOOK HOTEL ----
    if (lower.includes('hotel') || lower.includes('stay') || lower.includes('accommodation')) {
        if (!state.destination) {
            return { text: "Ooh a cozy hotel~! 🏨 But where are we going first? Tell me the city and I'll find the comfiest place, hehe! 🐼💤" };
        }
        
        const destKey = Object.keys(destinationData).find(k => state.destination.toLowerCase().includes(k));
        const dest = destKey ? destinationData[destKey] : { hotelPerNight: 120 };
        const totalHotel = dest.hotelPerNight * state.days;
        
        spawnParticles(['🏨', '🛏️', '🔑', '⭐']);
        setPandaState('working');
        
        const booking = {
            type: 'hotel',
            title: `Hotel in ${state.destination}`,
            details: `${state.days} nights • $${dest.hotelPerNight}/night`,
            cost: totalHotel,
            icon: 'fa-solid fa-hotel',
        };
        
        state.bookings.push(booking);
        addExpense('Hotel', 'hotel', totalHotel);
        statBookings.textContent = state.bookings.length;
        
        renderBookings();
        renderBudget();
        
        return {
            text: `Yay yay~! ✅ <strong>Hotel booked!</strong> 🏨✨<br>🛏️ ${state.days} comfy nights in ${state.destination}<br>💳 Cost: <strong>$${totalHotel}</strong> ($${dest.hotelPerNight}/night)<br><br>We're all set! Check the <em>Bookings</em> tab! You're gonna have sooo much fun~! 🐼💕`,
            action: () => {
                setPandaState('celebrating');
                spawnParticles(['🎉', '✅']);
            },
        };
    }
    
    // ---- THANK YOU ----
    if (lower.includes('thank') || lower.includes('awesome') || lower.includes('great') || lower.includes('love')) {
        setPandaState('celebrating');
        spawnParticles(['❤️', '🐼', '✨', '😊', '💕', '🌟']);
        showBubble('Awww~! 🥰💕');
        return { text: "Awww~! You're making me blush! 🥰💕 I love helping you! I'm always here for you, okay~? Just call for Panda anytime! 🐼✨❤️" };
    }
    
    // ---- HELP ----
    if (lower.includes('help') || lower.includes('what can you')) {
        spawnParticles(['💡', '❓', '🐼']);
        return {
            text: `Ooh let me tell you what I can do~! 🐼💕<br><br>
            🗺️ <em>"Plan a trip to Paris"</em> — I'll make a super fun itinerary!<br>
            💰 <em>"Set budget to 2000"</em> — I'll watch your money carefully~<br>
            ✈️ <em>"Book a flight"</em> — Zoom zoom, I'll find flights!<br>
            🏨 <em>"Book a hotel"</em> — Comfy beds incoming~!<br>
            🌍 <em>"Show trending destinations"</em> — Ooh the best places!<br>
            <br>Just type or tap the 🎤 mic button and talk to me! I'm all ears~ hehe! 🐼✨`
        };
    }
    
    // ---- DEFAULT ----
    spawnParticles(['🤔', '❓']);
    return { text: "Hmm~ I don't quite understand that yet, sowwy! 🐼💦 I'm still a little panda learning new things! Try saying <em>\"Plan a trip to Bali\"</em> or <em>\"Set budget to 1500\"</em>! You can also say <em>\"Help\"</em> to see what I know~ 💕" };
}

// ====== Rendering ======
function renderItinerary() {
    const container = document.getElementById('itinerary-container');
    if (state.itinerary.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-map"></i><p>No itinerary yet.</p></div>';
        return;
    }
    
    container.innerHTML = state.itinerary.map((day, i) => `
        <div class="itin-day" style="animation-delay: ${i * 0.1}s">
            <div class="itin-day-header">
                <div class="day-number">${day.day}</div>
                <div class="day-title">Day ${day.day} — ${state.destination}</div>
            </div>
            <div class="itin-activities">
                ${day.activities.map(a => `
                    <div class="activity-item">
                        <span>${a[0]}</span>
                        <span>${a[1]}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function addExpense(name, type, amount) {
    state.expenses.push({ name, type, amount });
    state.spent += amount;
}

function renderBudget() {
    budgetAmount.textContent = `$${state.budget.toLocaleString()}`;
    const remaining = state.budget - state.spent;
    budgetRemaining.textContent = `$${Math.max(0, remaining).toLocaleString()}`;
    
    const pct = state.budget > 0 ? Math.min((state.spent / state.budget) * 100, 100) : 0;
    budgetBarFill.style.width = `${pct}%`;
    
    if (state.expenses.length === 0) {
        expenseListEl.innerHTML = '<div class="empty-state"><i class="fa-regular fa-credit-card"></i><p>No expenses yet.</p></div>';
        return;
    }
    
    expenseListEl.innerHTML = state.expenses.map(exp => `
        <div class="expense-item">
            <div class="exp-left">
                <div class="expense-icon ${exp.type}"><i class="fa-solid fa-${exp.type === 'flight' ? 'plane' : exp.type === 'hotel' ? 'hotel' : 'utensils'}"></i></div>
                <span class="exp-name">${exp.name}</span>
            </div>
            <span class="exp-amount">-$${exp.amount.toLocaleString()}</span>
        </div>
    `).join('');
}

function renderBookings() {
    const el = document.getElementById('bookings-list');
    if (state.bookings.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fa-regular fa-calendar-check"></i><p>No bookings yet.</p></div>';
        return;
    }
    
    el.innerHTML = state.bookings.map(b => `
        <div class="booking-card">
            <div class="booking-icon"><i class="${b.icon}"></i></div>
            <div class="booking-info">
                <h4>${b.title}</h4>
                <p>${b.details} • $${b.cost}</p>
            </div>
            <span class="booking-status confirmed">✓ Confirmed</span>
        </div>
    `).join('');
}

// ====== Speech APIs ======
// Text-to-Speech — Cute Voice Engine
const synth = window.speechSynthesis;
let cuteVoice = null;

// Find the cutest voice available
function loadCuteVoice() {
    const voices = synth.getVoices();
    // Priority: look for female/child voices
    const preferredNames = ['samantha', 'victoria', 'karen', 'tessa', 'zira', 'hazel', 'susan', 'fiona', 'moira', 'google uk english female', 'google us english'];
    for (const pref of preferredNames) {
        const found = voices.find(v => v.name.toLowerCase().includes(pref));
        if (found) { cuteVoice = found; break; }
    }
    // Fallback: any female-sounding or English voice
    if (!cuteVoice) {
        cuteVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
            || voices.find(v => v.lang.startsWith('en'))
            || voices[0];
    }
}

// Voices load async in some browsers
if (synth) {
    synth.onvoiceschanged = loadCuteVoice;
    loadCuteVoice();
}

function speak(text) {
    if (!synth) return;
    synth.cancel();
    
    // Clean text for speech (remove emojis and HTML-like stuff)
    const cleanText = text
        .replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{FE00}-\u{FEFF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '')
        .replace(/~!/g, '!')
        .replace(/~\?/g, '?')
        .replace(/~/g, '')
        .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Very cute voice settings
    utterance.pitch = 1.6;       // High pitch = cute!
    utterance.rate = 0.95;       // Slightly slower for clarity
    utterance.volume = 1.0;
    
    if (cuteVoice) utterance.voice = cuteVoice;
    
    setPandaState('talking');
    showBubble('Speaking~ 🗣️💕', 5000);
    
    utterance.onend = () => {
        setPandaState('idle');
        showBubble('Done talking~ 🐼', 2000);
    };
    
    synth.speak(utterance);
}

// Floating hearts effect for celebrating
function spawnFloatingHearts() {
    const hearts = ['💕', '💖', '💗', '💝', '✨'];
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const el = document.createElement('span');
            el.className = 'action-particle';
            el.textContent = hearts[i % hearts.length];
            el.style.left = `${20 + Math.random() * 90}px`;
            el.style.top = `${60 + Math.random() * 60}px`;
            el.style.setProperty('--tx', `${-30 + Math.random() * 60}px`);
            el.style.setProperty('--ty', `${-80 - Math.random() * 40}px`);
            actionParticles.appendChild(el);
            setTimeout(() => el.remove(), 1800);
        }, i * 250);
    }
}

// Speech-to-Text — Enhanced Voice Commanding
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

if (window.SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.interimResults = true;  // Show words as they come!
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isListening = true;
        btnVoice.classList.add('listening');
        setPandaState('listening');
        showBubble('Go ahead~ I\'m listening! 🎤💕', 10000);
        spawnParticles(['🎤', '✨', '👂']);
    };
    
    recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        chatInput.value = transcript;
        
        // Only send when result is final
        if (e.results[e.results.length - 1].isFinal) {
            handleSend();
        }
    };
    
    recognition.onend = () => {
        isListening = false;
        btnVoice.classList.remove('listening');
        statusLabel.textContent = '💚 Ready to help~!';
    };
    
    recognition.onerror = (event) => {
        btnVoice.classList.remove('listening');
        isListening = false;
        if (event.error === 'no-speech') {
            statusLabel.textContent = '😅 I didn\'t hear anything~ Try again!';
            showBubble('I couldn\'t hear you~ Try again! 🐼', 3000);
        } else {
            statusLabel.textContent = '😢 Mic error~ Please type instead!';
            addMessage('panda', 'Oh no~ my ears aren\'t working! 😢 Could you type your request instead? I\'m sowwy! 🐼💕');
        }
    };
}

// ====== Event Listeners ======
btnSend.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

btnVoice.addEventListener('click', () => {
    if (!recognition) {
        addMessage('panda', 'Sorry, your browser doesn\'t support voice recognition. Please type your request instead!');
        return;
    }
    if (isListening) { recognition.stop(); }
    else { recognition.start(); }
});

// ====== Ambient Particles Background ======
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.3 + 0.1,
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
})();

// ====== Mobile menu toggle ======
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
if (menuToggle) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}
