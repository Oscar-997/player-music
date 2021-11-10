const $ = document.querySelector.bind(document);

const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'USER'

const player = $('.player');
const playList = $('.playlist');
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const progressCurrent = $('.progress-bottom__current')
const progressDuration = $('.progress-bottom__duration')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: {},
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
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
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map(function(song, index) {
            return `<div class="song" data-index="${index}">
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
                    `;
        });
        playList.innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function() {

        const _this = this;
        const cdWidth = cd.offsetWidth;


        // Xử lý CD quay và dừng
        const cdThumbAnimate = cd.animate([
            { transform: 'rotate(360deg)' }
        ],
        {
            duration: 10000,
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        // xử lý kéo lên xuống playlist và phóng to / thu nhỏ CD

        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // xử lý khi click button play

        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // xử lý giao diện khi nhạc đang chạy

        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add("playing")
            cdThumbAnimate.play()
            _this.activeSong() // hiển thị bài hát được chọn với class active
            _this.scrollToActiveSong()
        }

        // xử lý giao diện khi nhạc bị tắt 

        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove("playing")
            cdThumbAnimate.pause()
            _this.activeSong() // hiển thị bài hát được chọn với class active
            _this.scrollToActiveSong()

        }

        // Xử lý cho thanh progress chạy cùng với thời lượng của bài hát

        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100); // audio.currentTime là thời gian hiện tại trả về của audio
                // audio.duration là tổng thời gian audio có 

                progress.value = progressPercent 
            };
        }

        // tua tùy thích trên thanh progress

        progress.oninput = function(e) {
            audio.pause();
            setTimeout(() =>{
                audio.play();
            },5)
            const seekTime = (audio.duration / 100) * e.target.value
            audio.currentTime = seekTime
        }

        // khi next bài hát 

        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }else {
                _this.nextSong(); // gọi hàm nextSong để logic trong hàm được hoạt động khi click vào button next
            }
            audio.play(); // bài hát sẽ auto chạy khi bấm nút next
            _this.render();// chạy lại từ đầu khi next hết playlist 
        }

        // khi prev bài hát 

        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
        }

        // xử lý khi bấm vào button random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // xử lý khi bấm vào button repeat 

        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // xử lý khi end bài hát
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else{
                nextBtn.click();
            }
        }

        // xử lý khi nhấn vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionNode = e.target.closest('.option');

            if(songNode || optionNode) {
                // khi xử lý click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index) // vị trí được chọn là vị trí index nằm trong data-index của playlist
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                if(optionNode) {

                }
            }
        }

    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path

    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    // hàm logic để next bài hát 

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    }, 

    // hàm logic để prev bài hát

    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    //logic khi bật tính năng random 

    playRandomSong: function() {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    // logic để cho bài hát đang hiển thị với class active 
    activeSong: function() {
        var loopSongs = $$('.song') // tạo 1 biến cho tất cả các class có song ở trong 
        for (song of loopSongs) {
            song.classList.remove('active') // tạo vòng lặp for of để lặp qua từng song trong biến  và remove cái class active nếu có
        }
        const activeSong = loopSongs[this.currentIndex] // tạo biến activeSong bằng giá trị là song được chọn trong loopSong 
        activeSong.classList.add('active') // thêm class active vào bài hát được chọn
    },

    scrollToActiveSong: function(){   
        if (this.currentIndex === 0) { // điều kiện if này dùng để fix lỗi khi bài hát trở lại lúc đầu thì thanh scroll sẽ như lúc đầu = 0
            document.documentElement.scrollTop = 0
        };
        setTimeout(() =>{ // sử dụng phương thức setTimeout để song active sẽ nhảy sau 1 khoảng thời gian nhất định
            $('.song.active').scrollIntoView({  // ta dùng scrollIntoView để tạo xử lý khi active song nhảy đi bài khác
                behavior: 'smooth', 
                block: 'nearest'
            },300)
        })
    },

    formatTime: function (sec_num) {
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - hours * 3600) / 60);
        let seconds = Math.floor(sec_num - hours * 3600 - minutes * 60);
    
        hours = hours < 10 ? (hours > 0 ? '0' + hours : 0) : hours;
    
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        if (seconds < 10) {
          seconds = '0' + seconds;
        }
        return (hours !== 0 ? hours + ':' : '') + minutes + ':' + seconds;
    },

    timeCurrent: function() {
        setInterval(() => {
            let cur = this.formatTime(audio.duration);
            progressCurrent.textContent = `${cur}`
        })
    },

    timeDuration: function() {
          setInterval(() => {
            if (audio.duration) {
                let dur = this.formatTime(audio.duration)
                progressDuration.textContent = `${dur}`;
              }
          })
    },

    // làm mọi thứ và nhét vào hàm start để ko bị rối code 
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // render playlist
        this.render();

        // lắng nghe sự kiện của trang web
        this.handleEvent();

        // định nghĩ các thuộc tính cho object
        this.defineProperties()

        // chạy bài hát hiện tại đang mở
        this.loadCurrentSong()

        // Hiển thị ra khi lưu lại 2 thẻ active này
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();