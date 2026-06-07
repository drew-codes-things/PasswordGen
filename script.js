const CHARS = {
    upper:   'ABCDEFGHJKLMNPQRSTUVWXYZ',
    lower:   'abcdefghjkmnpqrstuvwxyz',
    digits:  '23456789',
    special: '!@#$%^&*()_+[]{}|;:,.<>?'
};

const WORDS = ['able','acid','aged','also','area','army','away','baby','back','ball','band','bank','base','bath','bear','beat','been','beer','bell','belt','bird','blow','blue','boat','body','bone','book','boot','born','boss','both','bowl','bulk','burn','bush','busy','cake','call','calm','camp','card','care','case','cash','cell','chat','chip','city','clay','club','clue','coal','coat','code','cold','come','cook','cool','cope','copy','corn','cost','crew','crop','dark','data','date','dawn','days','deal','dean','dear','debt','deck','deep','deer','desk','dial','diet','dirt','dish','dock','does','done','door','dose','down','draw','drew','drop','drug','dual','duke','dust','duty','each','earn','ease','east','easy','edge','else','even','ever','exit','face','fact','fade','fail','fair','fall','farm','fast','fate','fear','feed','feel','feet','fell','file','fill','film','find','fine','fire','firm','fish','five','flag','flat','flee','flow','fold','folk','food','foot','ford','form','fort','four','free','frog','fuel','full','fund','gain','game','gate','gave','gear','gift','girl','give','glad','goal','goat','goes','gold','golf','gone','good','grab','gray','grew','grid','grip','grow','gulf','hair','half','hall','hand','hang','hard','harm','hate','have','hawk','head','heal','heap','hear','heat','held','hell','helm','help','herb','herd','hero','hide','high','hill','hint','hire','hold','hole','holy','home','hook','hope','horn','host','hour','huge','hung','hunt','hurt','idea','inch','iron','item','jade','jail','jazz','jean','join','joke','jump','jury','keen','keep','kept','kick','kind','king','kiss','kite','knee','knew','knot','know','lace','lack','lady','laid','lake','lamb','lamp','land','lane','last','late','lawn','lazy','lead','leaf','lean','leap','left','lend','lens','less','life','lift','like','limb','lime','line','link','lion','list','live','load','loan','lock','loft','long','look','loop','lord','lose','loss','lost','loud','love','luck','lump','lung','made','mail','main','make','male','mall','mark','mars','mask','mass','mast','mate','math','meal','mean','meat','meet','melt','menu','mere','mesh','mile','milk','mill','mind','mine','mint','miss','mist','moat','mode','mole','monk','mood','moon','more','moss','most','moth','move','much','must','myth','name','navy','near','neat','neck','need','nest','news','next','nice','nine','node','none','noon','norm','nose','note','noun','oak','oath','obey','oboe','odds','okay','once','only','onto','open','oral','oven','over','pace','pack','page','paid','pain','pair','pale','palm','park','part','pass','past','path','peak','pear','peer','pile','pine','pink','pipe','plan','play','plot','plug','plus','poem','poet','pole','poll','pond','pony','pool','poor','pope','pork','port','pose','post','pour','pray','prep','prey','prom','prop','pull','pump','pure','push','quit','quiz','race','rack','rage','rail','rain','rake','rank','rare','rate','read','real','reap','rear','reef','rely','rent','rest','rice','rich','ride','ring','riot','rise','risk','road','roar','robe','rock','role','roll','roof','room','root','rope','rose','rude','ruin','rule','rush','rust','sack','safe','sage','said','sail','sake','salt','same','sand','save','scan','seal','seam','seat','seed','seek','seem','seen','self','sell','semi','send','sent','ship','shoe','shop','shot','show','shut','sick','side','sigh','sign','silk','sing','sink','site','size','skin','skip','slab','slam','slip','slot','slow','snap','snow','soak','soap','soft','soil','sold','sole','some','song','soon','sort','soul','soup','sour','span','spin','spot','star','stay','stem','step','stir','stop','such','suit','sung','sure','surf','swam','swap','swim','tail','take','tale','talk','tall','tank','tape','task','team','tear','tell','tend','tent','term','test','text','than','that','thaw','them','then','they','thin','this','thus','tide','tidy','tied','tile','time','tiny','tips','toad','toll','tomb','tone','took','tool','torn','tour','town','trap','tray','tree','trim','trip','true','tube','tune','turn','twin','type','unit','upon','urge','used','user','vary','vast','veal','veil','vein','very','vibe','view','vine','visa','void','volt','vote','wade','wage','wait','wake','walk','wall','wand','want','ward','warm','warn','wash','wave','weak','wear','week','well','went','were','west','what','whom','wide','wife','wild','will','wind','wine','wing','wink','wipe','wire','wise','wish','wolf','wood','wool','word','wore','work','worn','wrap','yard','yarn','yeah','year','yoga','your','zero','zone','zoom'];
const SEPS = '-_.+=';

let currentPassword = '';

function getRandom(str) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return str[arr[0] % str.length];
}

function randomInt(n) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % n;
}

function getMode() {
    return document.querySelector('input[name="mode"]:checked')?.value || 'random';
}

function getActivePool() {
    const useUpper   = document.getElementById('use-upper').checked;
    const useLower   = document.getElementById('use-lower').checked;
    const useDigits  = document.getElementById('use-digits').checked;
    const useSpecial = document.getElementById('use-special').checked;

    let pool = '';
    if (useUpper)   pool += CHARS.upper;
    if (useLower)   pool += CHARS.lower;
    if (useDigits)  pool += CHARS.digits;
    if (useSpecial) pool += CHARS.special;

    const guaranteed = [];
    if (useUpper)   guaranteed.push(getRandom(CHARS.upper));
    if (useLower)   guaranteed.push(getRandom(CHARS.lower));
    if (useDigits)  guaranteed.push(getRandom(CHARS.digits));
    if (useSpecial) guaranteed.push(getRandom(CHARS.special));

    return { pool, guaranteed };
}

function classPoolSize(pw) {
    let pool = 0;
    if (/[a-z]/.test(pw))         pool += 23;
    if (/[A-Z]/.test(pw))         pool += 24;
    if (/[0-9]/.test(pw))         pool += 8;
    if (/[^a-zA-Z0-9]/.test(pw))  pool += 23;
    return pool;
}

function bitsToMeta(bits) {
    let level;
    if (bits < 28)      level = 1;
    else if (bits < 40) level = 2;
    else if (bits < 60) level = 3;
    else if (bits < 80) level = 4;
    else                level = 5;
    const meta = {
        1: { label: 'Weak',        color: '#ff4444' },
        2: { label: 'Fair',        color: '#ffaa00' },
        3: { label: 'Good',        color: '#eab308' },
        4: { label: 'Strong',      color: '#50fa7b' },
        5: { label: 'Very Strong', color: '#50fa7b' },
    };
    return { level, ...meta[level] };
}

function updateStrengthMeter(pw, bits) {
    if (!pw) return;
    if (bits == null) bits = pw.length * Math.log2(classPoolSize(pw) || 1);
    const s = bitsToMeta(bits);
    const bar = document.getElementById('strength-bar');
    const lbl = document.getElementById('strength-label');
    bar.style.width = Math.min(100, (s.level / 5) * 100) + '%';
    bar.style.background = s.color;
    lbl.textContent = `${s.label} · ${Math.round(bits)} bits`;
    lbl.style.color = s.color;
}

function showResult(pw, bits) {
    currentPassword = pw;
    const el = document.getElementById('password-output');
    el.classList.remove('flash');
    void el.offsetWidth;
    el.textContent = currentPassword;
    el.classList.add('flash');
    updateStrengthMeter(currentPassword, bits);
}

function generateRandom() {
    const { pool, guaranteed } = getActivePool();
    if (!pool) {
        showToast('Enable at least one character type!');
        return;
    }

    const length = parseInt(document.getElementById('length-slider').value, 10);
    const pw = [...guaranteed];
    while (pw.length < length) pw.push(getRandom(pool));

    for (let i = pw.length - 1; i > 0; i--) {
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        const j = arr[0] % (i + 1);
        [pw[i], pw[j]] = [pw[j], pw[i]];
    }

    showResult(pw.join(''));
}

function generatePassphrase() {
    const count = parseInt(document.getElementById('length-slider').value, 10);
    const sep = getRandom(SEPS);
    const words = [];
    for (let i = 0; i < count; i++) {
        const w = WORDS[randomInt(WORDS.length)];
        words.push(w.charAt(0).toUpperCase() + w.slice(1));
    }
    const num = 10 + randomInt(90);
    const pw = words.join(sep) + sep + num;
    const bits = count * Math.log2(WORDS.length) + Math.log2(SEPS.length) + Math.log2(90);
    showResult(pw, bits);
}

function generatePassword() {
    if (getMode() === 'passphrase') generatePassphrase();
    else generateRandom();
}

function copyPassword() {
    if (!currentPassword) { showToast('Generate a password first!'); return; }
    navigator.clipboard.writeText(currentPassword).then(() => {
        const btn = document.getElementById('btn-copy');
        btn.classList.add('copied');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        }, 2000);
        showToast('Copied to clipboard!', true);
    }).catch(() => showToast('Clipboard unavailable, copy manually.'));
}

function showToast(msg, success = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (success ? ' success' : '');
    void t.offsetWidth;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
}

document.addEventListener('DOMContentLoaded', () => {
    const slider  = document.getElementById('length-slider');
    const display = document.getElementById('length-display');

    const lengthName = document.getElementById('length-name');
    const charsetRow = document.getElementById('charset-row');

    function applyMode() {
        const passphrase = getMode() === 'passphrase';
        lengthName.textContent = passphrase ? 'Words' : 'Length';
        charsetRow.style.display = passphrase ? 'none' : '';
        slider.min = passphrase ? 3 : 8;
        slider.max = passphrase ? 10 : 32;
        if (passphrase && slider.value > 10) slider.value = 6;
        if (passphrase && slider.value < 3) slider.value = 6;
        if (!passphrase && slider.value < 8) slider.value = 16;
        display.textContent = slider.value;
        generatePassword();
    }

    slider.addEventListener('input', () => {
        display.textContent = slider.value;
        if (currentPassword) generatePassword();
    });

    document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener('change', applyMode));

    ['use-upper','use-lower','use-digits','use-special'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if (currentPassword) generatePassword();
        });
    });

    document.getElementById('btn-generate').addEventListener('click', generatePassword);
    document.getElementById('btn-copy').addEventListener('click', copyPassword);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'c' || e.key === 'C') copyPassword();
        if (e.key === 'g' || e.key === 'G') generatePassword();
    });

    generatePassword();
});
