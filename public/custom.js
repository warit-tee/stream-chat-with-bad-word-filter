// global vairables....
let client, channel, username, activeUser, badwords;

client = new StreamChat("t59sh7ygbtxb")

async function generateToken(username) {
    const { token } = (await axios.get(`/token?username=${username}`)).data
    return token
}

const user = document.getElementById("user-login-input")
user.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        checkAuthState()
    }
});
checkAuthState()

async function checkAuthState() {
    if (!user.value) {
        document.getElementById("login-block").style.display = "grid"
        document.getElementsByClassName("message-container")[0].style.display = "none";
        document.getElementsByClassName("users-container")[0].style.display = "none"
    } else {
        username = user.value

        await initializeClient()

        document.getElementsByClassName("message-container")[0].style.display = "none";
        document.getElementsByClassName("users-container")[0].style.display = "grid"
        document.getElementById("login-block").style.display = "none"
    }
}

async function initializeClient() {
    const token = await generateToken(username)

    await client.setUser({
        id: username,
        name: username, // Update this name dynamically
        image: "https://bit.ly/2u9Vc0r",
    }, token); // token generated from our Node server

    await updateUser(username)

    await listUsers()

    return client
}

function populateUsers(users) {
    // remove the current users from the list of users
    const otherUsers = users.filter(user => user.id !== username)

    const usersElement = document.getElementById("users")

    
    otherUsers.map(user => {
        const userElement = document.createElement("div")
        userElement.className = "user"
        userElement.id = user.id
        userElement.textContent = user.id

        const img = document.createElement('img'); 
        img.src = "pic.png";
        img.width = "40"
        userElement.appendChild(img); 
        
        userElement.onclick = () => selectUserHandler(user)

        usersElement.append(userElement)
    })
}

async function backToUser(){
    // remove the 'active' class from all users
    const allUsers = document.getElementsByClassName("user")
    Array.from(allUsers).forEach(user => {
        user.classList.remove('active')
    })
    document.getElementsByClassName("message-container")[0].style.display = "none";
    document.getElementsByClassName("users-container")[0].style.display = "grid";
}

async function selectUserHandler(userPayload) {
    
    activeUser = userPayload.id
    document.getElementsByClassName("message-container")[0].style.display = "grid";
    document.getElementsByClassName("users-container")[0].style.display = "none";

    const selectedUser = document.getElementById("active")
    selectedUser.textContent = activeUser

    // remove the 'active' class from all users
    const allUsers = document.getElementsByClassName("user")
    Array.from(allUsers).forEach(user => {
        user.classList.remove('active')
    })

    // add the 'active' class to the current selected user
    const userElement = document.getElementById(userPayload.id)
    userElement.classList.add('active')

    // remove all previous messages in the message container...
    const messageContainer = document.getElementById("messages")
    messageContainer.innerHTML = ''

    await initializeChannel([username, userPayload.id])

}

async function listUsers() {
    const filters = {}
    const response = await client.queryUsers(filters)

    populateUsers(response.users)
    return response
}

async function initializeChannel(members) {
    //members => array of users
    channel = client.channel('messaging', {
        members: members,
        session: 10 // custom field, you can add as many as you want
    });

    await channel.watch();

    channel.on("message.new", event => {
        appendMessage(event.message)
    });

    channel.state.messages.forEach(message => {
        appendMessage(message)
    })
}


function appendMessage(message) {
    const messageContainer = document.getElementById("messages")

    // Create and append the message div
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${message.user.id === username ? 'message-right' : 'message-left'}`

    // Create the username div
    const usernameDiv = document.createElement("div")
    usernameDiv.className = "message-username"
    usernameDiv.textContent = `${message.user.id}:`
    // Append the username div to the MessageDiv
    messageDiv.append(usernameDiv)

    // Create the main message text div
    const messageTextDiv = document.createElement("div")
    messageTextDiv.textContent = message.text;
    // Append the text div to the MessageDiv
    messageDiv.append(messageTextDiv)

    // Then append the messageDiv to the "messages" div
    messageContainer.appendChild(messageDiv)
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

const inputElement = document.getElementById("message-input");
inputElement.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        sendMessage(inputElement.value)
        inputElement.value = ""
    }
});

async function sendMessage(message) {
    message = message.split(" ");
    for (var i = 0; i < message.length; i += 1) {
        if (badwords.includes(message[i].toLowerCase(), 0)) {
            message[i] = "****"
        }
    }
    message = message.join(" ")
    return await channel.sendMessage({
        text: message,
    });
}

async function updateUser(user) {
    const response = await axios.post("/updateUser", { userID: user })
    return response
}

badwords = ["ahole", "anus", "ash0le", "ash0les", "asholes", "ass", "Ass Monkey", "Assface", "assh0le", "assh0lez", "asshole", "assholes", "assholz", "asswipe", "azzhole", "bassterds",
    "bastard", "bastards", "bastardz", "basterds", "basterdz", "Biatch", "bitch", "bitches", "Blow Job", "boffing", "butthole", "buttwipe", "c0ck", "c0cks", "c0k",
    "Carpet Muncher", "cawk", "cawks", "Clit", "cnts", "cntz", "cock", "cockhead", "cock-head", "cocks", "CockSucker", "cock-sucker", "crap", "cum", "cunt","cunts", "cuntz",
    "dick", "dild0", "dild0s", "dildo", "dildos", "dilld0", "dilld0s", "dominatricks", "dominatrics", "dominatrix", "dyke", "enema", "f u c k", "f u c k e r", "fag", "fag1t", "faget", "fagg1t", "faggit",
    "faggot", "fagg0t", "fagit", "fags","fagz", "faig", "faigs", "fart", "flipping the bird", "fuck", "fucker", "fuckin", "fucking", "fucks", "Fudge Packer","fuk",
    "Fukah", "Fuken", "fuker", "Fukin", "Fukk", "Fukkah", "Fukken", "Fukker", "Fukkin", "g00k", "God-damned", "h00r", "h0ar","h0re","hells","hoar","hoor","hoore","jackoff",
    "jap","japs","jerk-off","jisim","jiss","jizm","jizz","knob","knobs","knobz","kunt","kunts","kuntz","Lezzian","Lipshits","Lipshitz","masochist","masokist","massterbait",
    "masstrbait","masstrbate","masterbaiter","masterbate","masterbates","Motha Fucker","Motha Fuker","Motha Fukkah","Motha Fukker","Mother Fucker","Mother Fukah","Mother Fuker","Mother Fukkah",
    "Mother Fukker","mother-fucker","Mutha Fucker","Mutha Fukah","Mutha Fuker","Mutha Fukkah","Mutha Fukker","n1gr","nastt","nigger;","nigur;","niiger;","niigr;","orafis",
    "orgasim;","orgasm","orgasum","oriface","orifice", "orifiss","packi","packie","packy","paki","pakie","paky","pecker","peeenus","peeenusss","peenus","peinus","pen1s", "penas",
    "penis","penis-breath","penus","penuus","Phuc","Phuck","Phuk","Phuker","Phukker","polac","polack","polak","Poonani","pr1c","pr1ck","pr1k","pusse","pussee","pussy",
    "puuke","puuker", "qweir","recktum","rectum","retard","sadist","scank","schlong","screwing","semen","sex","sexy","Sh!t","sh1t","sh1ter","sh1ts","sh1tter","sh1tz",
    "shit","shits","shitter","Shitty","Shity","shitz","Shyt","Shyte","Shytty","Shyty","skanck", "skank", "skankee","skankey","skanks","Skanky","slag","slut","sluts",
    "Slutty","slutz","son-of-a-bitch", "tit", "turd","va1jina","vag1na", "vagiina","vagina","vaj1na","vajina", "vullva","vulva","w0p","wh00r","wh0re","whore","xrated",
    "xxx","b!+ch","bitch","blowjob","clit","arschloch","fuck","shit","ass","asshole","b!tch","b17ch","b1tch","bastard","bi+ch","boiolas","buceta","c0ck","cawk","chink",
    "cipa","clits","cock","cum","cunt","dildo","dirsa","ejakulate","fatass","fcuk","fuk","fux0r","hoer","hore","jism","kawk","l3itch","l3i+ch","masturbate","masterbat*","masterbat3",
    "motherfucker","s.o.b.","mofo","nazi","nigga","nigger","nutsack","phuck","pimpis","pusse","pussy","scrotum","sh!t","shemale","shi+","sh!+","slut","smut","teets",
    "tits","boobs","b00bs","teez","testical","testicle","titt","w00se","jackoff","wank","whoar","whore","*damn","*dyke","*fuck*","*shit*","@$$","amcik","andskota","arse*",
    "assrammer","ayir","bi7ch","bitch*","bollock*","breasts","butt-pirate","cabron","cazzo","chraa","chuj","Cock*","cunt*","d4mn","daygo","dego","dick*","dike*","dupa",
    "dziwka","ejackulate","Ekrem*","Ekto","enculer","faen","fag*","fanculo","fanny","feces","feg","Felcher","ficken","fitt*","Flikker","foreskin","Fotze","Fu(*","fuk*",
    "futkretzn","gook","guiena","h0r","h4x0r","hell","helvete","hoer*","honkey","Huevon","hui","injun","jizz","kanker*","kike","klootzak","kraut","knulle","kuk","kuksuger",
    "Kurac","kurwa","kusi*","kyrpa*","lesbo","mamhoon","masturbat*","merd*","mibun","monkleigh","mouliewop","muie","mulkku","muschi","nazis","nepesaurio","nigger*","orospu",
    "paska*","perse","picka","pierdol*","pillu*","pimmel","piss*","pizda","poontsee","poop","porn","p0rn","pr0n","preteen","pula","pule","puta","puto","qahbeh","queef*",
    "rautenberg","schaffer","scheiss*","schlampe","schmuck","screw","sh!t*","sharmuta","sharmute","shipal","shiz","skribz","skurwysyn","sphencter","spic","spierdalaj","splooge",
    "suka","b00b*","testicle*","titt*","twat","vittu","wank*","wetback*","wichser","wop*","yed","zabourah"]