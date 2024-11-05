console.log("we are in js file");

let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // puts the songs in library
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li class="flex justify-between gap-2 border-2 border-white py-2 px-1 my-4 rounded-md cursor-pointer">
            <img class="invert w-9" src="/images/music-note-03-stroke-rounded.svg">
            <div class="info text-white w-44">
                <p>${song.replaceAll("%20", " ")}</p>
            </div>
            <div class="play flex w-32">
                <p class="w-24 flex justify-center items-center">play now</p>
                <img class="invert w-12 h-12" src="/images/play-circle-02-stroke-rounded.svg">
            </div>
        </li>`
    }
    
    // attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })

    return songs;
    
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) { 
        currentSong.play();
        play.src = "/images/pause2.svg";
    }

    document.querySelector(".songName").innerHTML = decodeURI(track)
}

async function displayAlbums() {
    let a = await fetch(`/music/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let CardContainer = document.querySelector(".CardContainer");
    let array =  Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

        if(e.href.includes("/music/") && !e.href.includes(".htaccess") ){
            let folder = e.href.split("/").slice(-1)[0];
            // to get the metadata of the folder
            let a = await fetch(`/music/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            CardContainer.innerHTML =   CardContainer.innerHTML + `<div data-folder="${folder}" class=" card group xl:w-56 hover:bg-[#303030fb] bg-[#30303041] p-3  rounded-xl relative">
                        <img class="rounded-md w-full" src="/music/${folder}/cover.jpeg" alt="">
                        <div
                            class="playButton bg-green-500 rounded-full w-10 h-10 flex justify-center items-center text-black absolute bottom-28 right-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <button><span><i class="fa-solid fa-play"></i></span></button>
                        </div>
                        <h2 class="text-xl pt-2">${response.title}</h2>
                        <p class="pt-2 text-sm">${response.descreption}</p>
                    </div>`
                    }
        }

        // load playlist whenever card is clicked

        Array.from(document.getElementsByClassName("card")).forEach(e =>{
            e.addEventListener("click", async item=>{
                console.log(item,item.currentTarget.dataset.folder);
                songs = await getSongs(`music/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
}

async function main() {
    // get the list of all songs
    await getSongs("music/Moody");
    playMusic(songs[0], true);

    //display all the albums on the page
    await  displayAlbums();

    // to pause/play the songs
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/images/pause2.svg"
        }
        else {
            currentSong.pause();
            play.src = "/images/play2.svg"
        }
    })

    //time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // To control seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const seekbarWidth = e.target.getBoundingClientRect().width;
        const offsetX = e.offsetX;
        const percent = (offsetX / seekbarWidth);

        // Update the circle position
        document.querySelector(".circle").style.left = percent * 100 + "%";

        // Update current time of the song
        currentSong.currentTime = (percent * currentSong.duration);
    });

    // hamburger 
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    // close button functioning
    document.querySelector(".closeIcon").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = " -100%";
    })

    // add event listner to previous
    previous.addEventListener("click", ()=>{
        console.log("previous printed");
        currentSong.pause();
        console.log(currentSong.src.split("/").slice(-1));

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if((index-1) > 0){
            playMusic(songs[index-1])
        }
    })

    // add event listner to next 
    next.addEventListener("click", ()=>{
        console.log("next printed");
        currentSong.pause();
        console.log(currentSong.src.split("/").slice(-1));

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    // add event listner for volume

        document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
            console.log(e.target.value);
            currentSong.volume = parseInt(e.target.value)/100
        })

    
}
main();