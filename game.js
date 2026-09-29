const STORAGE_KEY = 'bitlife-save';

const game = {
    player: null,
    currentScreen: 'menu',
    gameOver: false,
};

const defaultState = {
    age: 18,
    name: 'Player',
    gender: 'male',
    country: 'USA',
    money: 50000,
    health: 100,
    happiness: 100,
    intelligence: 100,
    looks: 100,
    education: 'None',
    job: 'Unemployed',
    relationship: 'Single',
    city: 'Home',
    isAlive: true,
    hasCareer: false,
    hasPartner: false,
};

const screenMap = {
    menu: 'menu-screen',
    creation: 'creation-screen',
    game: 'game-screen',
    event: 'event-screen',
    credits: 'credits-screen',
};

function setScreen(name) {
    Object.entries(screenMap).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.toggle('active', key === name);
        }
    });
    game.currentScreen = name;
}

function getPlayer() {
    return game.player || { ...defaultState };
}

function setPlayer(data) {
    game.player = { ...defaultState, ...data };
    renderStats();
}

function updateStat(stat, value) {
    if (!game.player) return;
    const min = 0;
    const max = 100;
    game.player[stat] = Math.max(min, Math.min(max, value));
    renderStats();
}

function renderStats() {
    const p = getPlayer();
    if (!p) return;

    document.getElementById('current-age').textContent = p.age;
    document.getElementById('money-amount').textContent = p.money;

    document.getElementById('player-title').textContent = `${p.name} from ${p.country}`;

    setBar('health-bar', p.health, '#4CAF50');
    setBar('happiness-bar', p.happiness, '#FFD700');
    setBar('intelligence-bar', p.intelligence, '#2196F3');
    setBar('looks-bar', p.looks, '#E91E63');

    document.getElementById('health-text').textContent = `${p.health}/100`;
    document.getElementById('happiness-text').textContent = `${p.happiness}/100`;
    document.getElementById('intelligence-text').textContent = `${p.intelligence}/100`;
    document.getElementById('looks-text').textContent = `${p.looks}/100`;
}

function setBar(id, value, color) {
    const bar = document.getElementById(id);
    if (!bar) return;
    bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
    bar.style.backgroundColor = color;
}

function saveGame() {
    if (!game.player) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game.player));
    alert('Game saved successfully!');
}

function loadGame() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        alert('No saved game found. Start a new game!');
        return;
    }

    try {
        const data = JSON.parse(raw);
        setPlayer(data);
        setScreen('game');
    } catch (error) {
        alert('Save file is corrupted.');
    }
}

function startNewGame() {
    setScreen('creation');
}

function showCredits() {
    setScreen('credits');
}

function backToMenu() {
    setScreen('menu');
}

function createCharacter() {
    const name = document.getElementById('player-name').value.trim() || 'Alex';
    const gender = document.getElementById('player-gender').value;
    const country = document.getElementById('player-country').value;

    const player = {
        ...defaultState,
        name,
        gender,
        country,
        age: 18,
        money: 5000,
        health: 100,
        happiness: 80,
        intelligence: 75,
        looks: 80,
        job: 'Student',
        education: 'High School',
        relationship: 'Single',
    };

    setPlayer(player);
    setScreen('game');
}

function passYear() {
    if (!game.player) return;

    const p = getPlayer();
    p.age += 1;

    p.money += Math.max(0, Math.round(Math.random() * 2000 - 500));
    p.health = Math.max(20, p.health - Math.round(Math.random() * 8 + 2));
    p.happiness = Math.max(0, p.happiness - Math.round(Math.random() * 10 + 3));
    p.intelligence = Math.min(100, p.intelligence + Math.round(Math.random() * 6));

    if (p.age >= 80) {
        alert('Your life has been long and full. You have reached the end of your story.');
        setScreen('menu');
        return;
    }

    triggerRandomEvent();
    renderStats();
}

function studyAction() {
    const p = getPlayer();
    p.intelligence = Math.min(100, p.intelligence + 8);
    p.money = Math.max(0, p.money - 30);
    p.happiness = Math.min(100, p.happiness + 2);
    showAlert('You studied hard and gained intelligence.');
    renderStats();
}

function partyAction() {
    const p = getPlayer();
    p.happiness = Math.min(100, p.happiness + 12);
    p.health = Math.max(0, p.health - 8);
    p.money = Math.max(0, p.money - 80);
    showAlert('You had fun but spent money and lost some health.');
    renderStats();
}

function gambleAction() {
    const p = getPlayer();
    const roll = Math.random();
    if (roll > 0.5) {
        p.money += 200;
        showAlert('You won a gamble!');
    } else {
        p.money = Math.max(0, p.money - 200);
        p.happiness = Math.max(0, p.happiness - 10);
        showAlert('You lost money gambling.');
    }
    renderStats();
}

function investAction() {
    const p = getPlayer();
    const outcome = Math.random();
    if (outcome > 0.45) {
        p.money += 500;
        showAlert('Your investment paid off!');
    } else {
        p.money = Math.max(0, p.money - 300);
        showAlert('Your investment crashed.');
    }
    renderStats();
}

function showSchoolMenu() {
    const choices = [
        { label: 'Attend School', effect: () => { const p = getPlayer(); p.intelligence += 10; p.happiness -= 2; p.money -= 60; showAlert('You attended school and learned something useful.'); renderStats(); } },
        { label: 'Apply to University', effect: () => { const p = getPlayer(); p.education = 'University'; p.intelligence += 15; p.money -= 500; showAlert('You applied to university and improved your future.'); renderStats(); } },
        { label: 'Drop Out', effect: () => { const p = getPlayer(); p.education = 'Dropped Out'; showAlert('You chose to leave school early.'); renderStats(); } }
    ];
    openChoiceWindow('Education', 'Choose how to handle your education.', choices);
}

function showWorkMenu() {
    const choices = [
        { label: 'Take a Part-Time Job', effect: () => { const p = getPlayer(); p.job = 'Retail Worker'; p.money += 300; p.happiness -= 5; showAlert('You got a part-time job and earned some cash.'); renderStats(); } },
        { label: 'Find a Career', effect: () => { const p = getPlayer(); p.job = 'Office Worker'; p.money += 800; p.hasCareer = true; showAlert('You landed a stable career job.'); renderStats(); } },
        { label: 'Start Business', effect: () => { const p = getPlayer(); p.job = 'Entrepreneur'; p.money += 1200; p.happiness += 5; showAlert('You started your own business and grew your network.'); renderStats(); } }
    ];
    openChoiceWindow('Career', 'Choose your next move in life.', choices);
}

function showRelationshipMenu() {
    const choices = [
        { label: 'Go on a Date', effect: () => { const p = getPlayer(); p.relationship = 'Dating'; p.happiness += 10; p.looks += 2; showAlert('You went on a date and met someone new.'); renderStats(); } },
        { label: 'Find a Partner', effect: () => { const p = getPlayer(); p.relationship = 'In Relationship'; p.hasPartner = true; p.happiness += 15; showAlert('You found a meaningful relationship.'); renderStats(); } },
        { label: 'Focus on Yourself', effect: () => { const p = getPlayer(); p.relationship = 'Single'; showAlert('You chose to focus on your personal goals.'); renderStats(); } }
    ];
    openChoiceWindow('Relationships', 'Choose how to approach love and companionship.', choices);
}

function showHealthMenu() {
    const choices = [
        { label: 'Go to Gym', effect: () => { const p = getPlayer(); p.health += 15; p.happiness += 5; showAlert('You worked out and feel healthier.'); renderStats(); } },
        { label: 'See a Doctor', effect: () => { const p = getPlayer(); p.health += 10; p.money -= 120; showAlert('Your health is improved through a checkup.'); renderStats(); } },
        { label: 'Take a Break', effect: () => { const p = getPlayer(); p.health += 5; p.happiness += 8; showAlert('A rest gave you time to recover and recharge.'); renderStats(); } }
    ];
    openChoiceWindow('Health', 'Keep yourself in good shape or take time to recover.', choices);
}

function openChoiceWindow(title, description, choices) {
    setScreen('event');
    document.getElementById('event-title').textContent = title;
    document.getElementById('event-description').textContent = description;

    const container = document.getElementById('event-choices');
    container.innerHTML = '';

    choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'btn choice-btn';
        btn.textContent = choice.label;
        btn.addEventListener('click', () => {
            choice.effect();
            setScreen('game');
        });
        container.appendChild(btn);
    });
}

function triggerRandomEvent() {
    const randomEvents = [
        {
            title: 'Unexpected Gift',
            description: 'A relative gives you some money for your birthday.',
            effect: () => {
                const p = getPlayer();
                p.money += 350;
                p.happiness += 5;
            }
        },
        {
            title: 'Health Issue',
            description: 'You felt sick and had to take some time off.',
            effect: () => {
                const p = getPlayer();
                p.health -= 10;
                p.happiness -= 5;
            }
        },
        {
            title: 'Opportunity',
            description: 'A friend invited you to join a workshop that could improve your skills.',
            effect: () => {
                const p = getPlayer();
                p.intelligence += 7;
                p.happiness += 4;
            }
        },
        {
            title: 'Bad Luck',
            description: 'You had a car repair bill and lost money unexpectedly.',
            effect: () => {
                const p = getPlayer();
                p.money -= 400;
                p.happiness -= 4;
            }
        }
    ];

    const chosen = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    showEvent(chosen.title, chosen.description, chosen.effect);
}

function showEvent(title, description, effect) {
    setScreen('event');
    document.getElementById('event-title').textContent = title;
    document.getElementById('event-description').textContent = description;

    const container = document.getElementById('event-choices');
    container.innerHTML = '';

    const btn = document.createElement('button');
    btn.className = 'btn choice-btn';
    btn.textContent = 'Continue';
    btn.addEventListener('click', () => {
        effect();
        setScreen('game');
        renderStats();
    });

    container.appendChild(btn);
}

function showAlert(message) {
    alert(message);
}

window.onload = function () {
    setScreen('menu');
    renderStats();
};
