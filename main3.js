const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)


const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('.progress')
const nextBtn = $('.btn-next')
const prevSong = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRamdon: false,
    isRepeat: false,
    songs: [
        {
            name: 'Nghe như tình yêu',
            singer: 'HIEUTHUHAI',
            path: './assets/music/song1.mp3',
            image: './assets/img/img1.jpeg'
        },
        {
            name: 'Lối nhỏ',
            singer: 'ĐEN VÂU',
            path: './assets/music/song2.mp3',
            image: './assets/img/img2.jpeg'
        },
        {
            name: 'Trốn tìm',
            singer: 'ĐEN VÂU',
            path: './assets/music/song3.mp3',
            image: './assets/img/img3.jpeg'
        },
        {
            name: 'GENE',
            singer: 'BINZ',
            path: './assets/music/song4.mp3',
            image: './assets/img/img4.jpeg'
        },
        {
            name: 'Không phải tại nó',
            singer: 'MAI NGÔ',
            path: './assets/music/song5.mp3',
            image: './assets/img/img5.jpeg'
        },
        {
            name: 'Va vào gia điệu này',
            singer: 'MCK',
            path: './assets/music/song6.mp3',
            image: './assets/img/img6.jpeg'
        },
        {
            name: 'ICE COOL',
            singer: 'SOL7 & MCK',
            path: './assets/music/song7.mp3',
            image: './assets/img/img7.jpeg'
        },
    ],
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    render: function () {
        const htmls = this.songs.map(function (song, index) {
            return `
            <div class="song" data-index="${index}">
                  <div class="thumb"
                      style="background-image: url('${song.image}')">
                  </div>
                  <div class="body">
                      <h3 class="title">${song.name}</h3>
                      <p class="author">${song.singer}</p>
                  </div>
                  <div class="option">
                      <i class="fas fa-ellipsis-h"></i>
                  </div>
              </div>
            `
        })
        playlist.innerHTML = htmls.join("")
    },

    handleEvent : function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop 
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth +'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }

        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            _this.activeSong()
            _this.scrollToActiveSong()
        }

        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
            _this.activeSong()
            _this.scrollToActiveSong()
        }

        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
                progress.value = progressPercent
            }
        }

        progress.oninput = function (e) {
            audio.pause()
            setTimeout(() => {
                audio.play()
            })
            const seekTime = (audio.duration / 100) * e.target.value
            audio.currentTime = seekTime
        }

        nextBtn.onclick = function () {
            if(_this.isRamdon) {
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            _this.render()
            audio.play()
        }

        prevSong.onclick = function () {
            if(_this.isRamdon) {
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            _this.render()
            audio.play()
        }

        randomBtn.onclick = function () {
            _this.isRamdon = !_this.isRamdon
            randomBtn.classList.toggle('active', _this.isRamdon)
        }

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        audio.onended = function () {
            if(_this.isRepeat) {
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')

            if(songNode || optionNode) {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },

    loadCurrentSong : function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },

    nextSong : function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    activeSong: function () {
        var loopSongs = $$('.song')
        for (song of loopSongs) {
            song.classList.remove('active')
        }

        const activeSong = loopSongs[this.currentIndex]
        activeSong.classList.add('active')
    },

    scrollToActiveSong: function () {
        if(this.currentIndex === 0) {
            document.documentElement.scrollTop = 0
        }
        setTimeout(function () {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        })
    },

    start: function() {
        this.defineProperties()
        
        this.handleEvent()
        
        this.loadCurrentSong()
        
        this.render()
    }
}

app.start()