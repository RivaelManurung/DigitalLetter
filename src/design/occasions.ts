import type { SectionType } from './blocks';
import type { SectionStyle } from './types';

/**
 * Occasion = susunan section awal untuk satu jenis acara, plus preset desain
 * yang cocok. Ini murni DATA: menambah occasion tidak menyentuh kode mana pun,
 * cukup menambah entri di sini.
 *
 * Yang dipilih user di dialog "Surat baru" menentukan section apa saja yang
 * dibuat — sisanya tetap bisa ditambah/dihapus manual di tab Konten.
 */

export type OccasionBlueprint = {
  label: string;
  /** satu kalimat di bawah nama, menjelaskan isinya */
  note: string;
  /** id preset dari design/presets */
  preset: string;
  /** urutan section yang dibuat untuk surat baru */
  sections: SectionType[];
  /** naskah awal yang menimpa starter block (per field); sisanya tetap bawaan */
  content?: Partial<Record<SectionType, Record<string, unknown>>>;
  /** tampilan awal per section, mis. foto latar hero */
  style?: Partial<Record<SectionType, SectionStyle>>;
};

export const OCCASIONS = {
  love: {
    label: 'Surat Cinta',
    note: 'Surat romantis dengan alasan, taman bunga, dan galeri foto.',
    preset: 'dark-romantic',
    sections: ['intro', 'hero', 'letter', 'reasons', 'garden', 'gallery', 'finale'],
  },

  wedding: {
    label: 'Undangan Pernikahan',
    note: 'Mempelai, akad & resepsi, hitung mundur, rundown, amplop digital, dan RSVP.',
    preset: 'golden-hour',
    sections: [
      'intro',
      'hero',
      'quote',
      'couple',
      'event',
      'countdown',
      'itinerary',
      'story',
      'gallery',
      'gift',
      'rsvp',
      'finale',
    ],
  },

  confess: {
    label: 'Pernyataan Cinta',
    note: 'Pengakuan perasaan, alasan suka, kenangan, dan pertanyaan ya/tidak.',
    preset: 'midnight-ink',
    sections: ['intro', 'hero', 'letter', 'reasons', 'memories', 'question', 'finale'],
  },

  valentine: {
    label: 'Hari Valentine',
    note: 'Kartu valentine dengan hati yang melayang, alasan cinta, kutipan, taman bunga, dan galeri.',
    preset: 'valentine-sweetheart',
    style: {
      hero: { bgImage: '/image/valentine/hero.webp', bgOverlay: 0.25 },
      reasons: { bgImage: '/image/valentine/reasons.webp', bgOverlay: 0.45 },
    },
    sections: ['intro', 'hero', 'letter', 'reasons', 'quote', 'gallery', 'garden', 'finale'],
    content: {
      intro: { hint: 'ketuk untuk membuka kartumu', label: '14 Februari' },
      hero: {
        eyebrow: 'selamat hari valentine',
        titleTop: 'Satu Hari untuk Cinta,',
        titleBottom: 'Setiap Hari untukmu',
        subtitle: 'Orang bilang hari ini untuk merayakan cinta. Aku cuma ingin memakai hari ini untuk bilang hal yang setiap hari kurasakan, tapi jarang kuucapkan.',
      },
      letter: {
        label: 'kartu kecil untukmu',
        title: 'Aku tidak pandai merangkai kata, jadi kutulis saja yang sebenarnya.',
        body: 'Cokelat akan habis dalam seminggu dan bunga akan layu dalam beberapa hari. Karena itu aku ingin memberimu sesuatu yang bisa kamu buka lagi kapan pun kamu mau: kata-kata ini.\n\nAku bersyukur atas hal-hal kecil tentangmu. Cara kamu mengirim pesan "sudah sampai?" setiap aku pulang. Cara kamu menyisakan potongan terakhir untukku walau kamu juga mau. Cara kamu mendengarkan ceritaku yang itu-itu saja seolah baru pertama kali.\n\nKamu membuat hari biasa terasa seperti hari yang layak dirayakan. Jadi, kalau hari ini adalah hari kasih sayang, biar aku jujur: setiap hari bersamamu sudah terasa seperti Valentine.',
        signature: '— Dengan seluruh hatiku',
      },
      reasons: {
        eyebrow: 'mengapa kamu',
        title: 'Hal-Hal Kecil yang Membuatku Jatuh Cinta',
        items: [
          { icon: 'heart', title: 'Pesan selamat pagimu', body: 'Kamu bukan orang pagi, tapi kamu selalu menyempatkan mengirim pesan pertama di hariku.' },
          { icon: 'sparkle', title: 'Matamu saat tertawa', body: 'Matamu ikut menyipit setiap kamu tertawa. Aku sering diam-diam membuat lelucon hanya untuk melihatnya.' },
          { icon: 'rose', title: 'Caramu menenangkan', body: 'Saat aku panik, kamu tidak menyuruhku tenang. Kamu menggenggam tanganku sampai aku tenang sendiri.' },
          { icon: 'star', title: 'Mimpi-mimpimu', body: 'Kamu bercerita tentang rencanamu dengan mata berbinar, dan aku ingin ada di setiap rencana itu.' },
        ],
      },
      quote: {
        text: 'Aku tidak mencintaimu karena kamu sempurna. Aku mencintaimu karena bersamamu, aku tidak perlu berpura-pura sempurna.',
        source: 'Untukmu, di hari kasih sayang',
        translation: '',
      },
      gallery: { eyebrow: 'kita dalam bingkai', title: 'Potret Kecil Kebahagiaan Kita' },
      garden: {
        eyebrow: 'buket yang tidak akan layu',
        title: 'Bunga-Bunga untukmu',
        note: 'sentuh tiap bunga untuk membaca pesannya',
      },
      finale: {
        eyebrow: 'happy valentine',
        title: 'Jadi Valentine-ku, Hari Ini dan Seterusnya?',
        body: 'Tidak perlu makan malam mewah atau hadiah yang besar. Cukup kamu, aku, dan janji untuk terus memilih satu sama lain, bahkan di hari-hari yang tidak ada di kalender.',
        signature: 'Milikmu 💗',
      },
    },
  },

  birthday: {
    label: 'Ulang Tahun',
    note: 'Balon pesta, kotak musik Happy Birthday, daftar harapan, kenangan setahun, dan galeri.',
    preset: 'birthday-party',
    style: {
      hero: { bgImage: '/image/birthday/hero.webp', bgOverlay: 0.3 },
      wish: { bgImage: '/image/birthday/wish.webp', bgOverlay: 0.5 },
      finale: { bgImage: '/image/birthday/finale.webp', bgOverlay: 0.3 },
    },
    sections: ['intro', 'hero', 'wish', 'memories', 'gallery', 'countdown', 'finale'],
    content: {
      intro: { hint: 'ketuk untuk membuka kadomu', label: 'selamat ulang tahun' },
      hero: {
        eyebrow: 'hari ini harimu',
        titleTop: 'Selamat Ulang Tahun,',
        titleBottom: 'Orang Favoritku',
        subtitle: 'Hari ini balonnya untukmu, lagunya untukmu, dan semua doa baik yang bisa kupikirkan juga untukmu. Tiup lilinnya pelan-pelan, ya.',
      },
      wish: {
        eyebrow: 'tiup lilinnya',
        bigText: '🎂',
        title: 'Doa-Doa Kecil di Atas Kue',
        body: 'Bertambah umur bukan cuma soal angka di atas kue. Ia tanda kamu sudah melewati satu tahun lagi, dengan segala lelah dan senangnya, dan masih berdiri di sini. Itu layak dirayakan.',
        itemsTitle: 'Semoga di umurmu yang baru',
        items: [
          { text: 'Kamu lebih sering tertawa daripada khawatir.' },
          { text: 'Mimpi yang selama ini kamu tunda akhirnya mulai jalan.' },
          { text: 'Tubuhmu sehat dan hatimu tenang.' },
          { text: 'Kamu dikelilingi orang yang tahu betapa berharganya kamu.' },
          { text: 'Ada lebih banyak kue, tentu saja.' },
        ],
        signature: '— Dari yang selalu mendoakanmu',
      },
      memories: {
        eyebrow: 'setahun ke belakang',
        title: 'Hal-Hal yang Kuingat dari Tahun Ini',
        items: [
          { title: 'Hari kamu berani mencoba', date: '', body: 'Kamu gugup setengah mati, tapi tetap melakukannya. Aku bangga sekali waktu itu, dan sampai sekarang masih.', photoId: '' },
          { title: 'Jalan-jalan dadakan kita', date: '', body: 'Tanpa rencana, tanpa tujuan jelas, dan malah jadi salah satu hari terbaik tahun ini.', photoId: '' },
          { title: 'Tawa yang tidak berhenti', date: '', body: 'Aku sudah lupa apa yang lucu. Yang kuingat, kita tertawa sampai menangis dan orang-orang menoleh.', photoId: '' },
        ],
      },
      gallery: { eyebrow: 'arsip kebahagiaan', title: 'Wajah-Wajah Bahagiamu' },
      countdown: {
        eyebrow: 'sampai jumpa tahun depan',
        title: 'Menuju Ulang Tahunmu Berikutnya',
        passedLabel: 'Hari ini harinya! Selamat ulang tahun! 🎉',
      },
      finale: {
        eyebrow: 'happy birthday',
        title: 'Terima Kasih Sudah Lahir ke Dunia',
        body: 'Dunia sedikit lebih hangat sejak ada kamu, dan hidupku jauh lebih seru sejak kenal kamu. Selamat bertambah umur. Semoga tahun ini memperlakukanmu sebaik kamu memperlakukan orang-orang di sekitarmu.',
        signature: 'Peluk jauh 🎈',
      },
    },
  },

  christmas: {
    label: 'Natal',
    note: 'Dibuka dengan chat tengah malam, lalu tumpukan kado yang dibuka satu per satu, surat, dan hitung mundur.',
    preset: 'christmas-eve',
    sections: ['intro', 'hero', 'chat', 'unwrap', 'letter', 'reasons', 'countdown', 'gallery', 'finale'],
    content: {
      hero: {
        eyebrow: "selamat natal",
        titleTop: "Natal Ini,",
        titleBottom: "Kamu Kadonya",
        subtitle: "Di antara lampu yang berkedip dan lagu yang diputar berulang-ulang, aku menulis ini untuk satu orang yang membuat tahun ini terasa seperti pulang."
      },
      chat: {
        eyebrow: "24 desember, 23.58",
        messages: [
          {
            from: "aku",
            text: "Kamu udah tidur?"
          },
          {
            from: "kamu",
            text: "Belum. Lagi bungkus kado, selotipnya nempel di mana-mana 😩"
          },
          {
            from: "aku",
            text: "Hahaha pantes. Dua menit lagi jam dua belas."
          },
          {
            from: "aku",
            text: "Aku sengaja nunggu dari tadi, biar jadi yang pertama."
          },
          {
            from: "kamu",
            text: "Yang pertama apa?"
          },
          {
            from: "aku",
            text: "Yang pertama bilang selamat Natal ke kamu tahun ini. Semoga tahun-tahun berikutnya juga."
          },
          {
            from: "kamu",
            text: "Ih… 🥹"
          },
          {
            from: "aku",
            text: "Scroll ke bawah ya. Aku siapin sesuatu buat kamu 🎁"
          }
        ]
      },
      unwrap: {
        eyebrow: "di bawah pohon",
        title: "Tiga Kado Kecil untukmu",
        doneNote: "Tiga kado sudah terbuka. Yang keempat tidak bisa dibungkus: aku, yang bersyukur setiap hari karena kamu ada.",
        items: [
          {
            tag: "Buka dulu",
            title: "Kupon Peluk Tanpa Batas",
            body: "Berlaku kapan saja: saat kamu capek pulang kerja, saat kamu kesal tanpa alasan, atau saat kamu cuma butuh diam berdua. Tidak perlu alasan untuk menukarnya.",
            photoId: ""
          },
          {
            tag: "Yang ini",
            title: "Satu Malam Keliling Lampu Kota",
            body: "Kita jalan pelan-pelan menyusuri lampu Natal, beli cokelat panas di pinggir jalan, lalu pulang dengan tangan yang saling menghangatkan. Kamu yang pilih rutenya.",
            photoId: ""
          },
          {
            tag: "Terakhir",
            title: "Sebuah Janji",
            body: "Natal tahun depan, dan tahun-tahun sesudahnya, aku ingin tetap jadi orang yang duduk di sebelahmu saat lampu pohon dinyalakan.",
            photoId: ""
          }
        ]
      },
      letter: {
        label: "surat natal",
        title: "Tahun ini, rumah terasa paling hangat karena ada kamu.",
        body: "Aku ingat Desember tahun lalu, waktu semuanya terasa terburu-buru dan aku lupa caranya menikmati hal kecil. Lalu kamu datang dengan kebiasaan-kebiasaanmu: menyalakan lampu kecil di pojok kamar, menyanyikan lagu Natal dengan nada yang tidak pernah pas, dan memaksaku berhenti sebentar untuk minum cokelat panas yang selalu kebanyakan gula.\n\nHal-hal itu terlihat sederhana, tapi pelan-pelan mengajariku bahwa bahagia bukan sesuatu yang harus dikejar. Ia ada di meja makan yang ramai, di pesan singkat \"sudah sampai rumah?\", dan di caramu tetap sabar waktu aku sedang sulit dihadapi.\n\nNatal ini aku tidak punya kado yang cukup besar untuk membalas semua itu. Yang bisa kuberikan hanya ini: perhatian yang tidak setengah-setengah, telinga yang selalu mau mendengar, dan doa yang selalu menyebut namamu.\n\nSelamat Natal, sayang. Semoga damai yang kita rayakan malam ini tinggal lebih lama dari lampu-lampunya.",
        signature: "— Dengan seluruh hatiku"
      },
      reasons: {
        eyebrow: "yang kusyukuri",
        title: "Hal-Hal Kecil yang Membuat Tahun Ini Berarti",
        items: [
          {
            icon: "star",
            title: "Caramu mendengarkan",
            body: "Kamu tidak pernah buru-buru memberi nasihat. Kamu mendengarkan sampai ceritaku selesai, dan entah kenapa itu saja sudah cukup menyembuhkan."
          },
          {
            icon: "heart",
            title: "Pesan \"sudah makan?\"",
            body: "Pertanyaan kecil yang kamu kirim setiap hari, bahkan di hari tersibukmu. Itu caramu bilang aku penting, tanpa perlu kata-kata besar."
          },
          {
            icon: "sparkle",
            title: "Tawamu yang lepas",
            body: "Kamu tertawa tanpa menahan diri, dan setiap kali itu terjadi, aku merasa dunia sedang baik-baik saja."
          },
          {
            icon: "leaf",
            title: "Kesabaranmu",
            body: "Kamu tetap tinggal di hari-hari ketika aku sendiri sulit menyukai diriku. Aku tidak akan pernah lupa itu."
          }
        ]
      },
      countdown: {
        eyebrow: "sebentar lagi",
        title: "Menuju Malam Natal",
        targetAt: "2026-12-24T18:00",
        passedLabel: "Selamat Natal. Terima kasih sudah jadi bagian terbaik tahun ini. 🎄"
      },
      gallery: {
        eyebrow: "tahun yang kita lewati",
        title: "Potret yang Ingin Kusimpan Selamanya"
      },
      memories: {
        eyebrow: "tahun yang indah",
        title: "Kenangan Tahun Ini"
      },
      finale: {
        eyebrow: "selamat natal",
        title: "Merry Christmas, Sayang",
        body: "Lampu-lampu ini akan dimatikan, pohonnya akan dibongkar, dan Desember akan berganti. Tapi rasa syukurku karena kamu ada tidak ikut disimpan di dalam kardus. Ia tetap menyala setiap hari, sampai Natal berikutnya, dan Natal-Natal sesudahnya.",
        signature: "Dengan cinta, dari aku"
      }
    },
  },

  'christmas-couple': {
    label: 'Natal untuk Pasangan',
    note: 'Untuk pasangan: gosok jendela berembun untuk melihat fotomu, surat, kenangan, dan pertanyaan manis di akhir.',
    preset: 'winter-frost',
    style: { hero: { bgImage: '/image/berdua-hero.webp', bgOverlay: 0.6 } },
    sections: ['intro', 'hero', 'scratch', 'letter', 'memories', 'quote', 'question', 'finale'],
    content: {
      hero: {
        eyebrow: "natal berdua",
        titleTop: "Dinginnya Salju,",
        titleBottom: "Hangatnya Kamu",
        subtitle: "Di luar, kota sedang membeku. Di sini, aku menulis surat ini dengan tangan yang masih hangat karena baru saja menggenggammu."
      },
      scratch: {
        eyebrow: "ada sesuatu di balik kaca",
        title: "Hapus Embunnya Pelan-Pelan",
        message: "Aku di sini, di balik jendela yang berembun, menunggu Natal bersamamu. Seperti tahun lalu, dan seperti yang kuharap terjadi lagi tahun depan."
      },
      letter: {
        label: "untuk kekasihku",
        title: "Di luar dingin, tapi di dekatmu aku selalu merasa pulang.",
        body: "Aku tidak butuh pohon yang paling tinggi atau kado yang paling mahal. Yang kuinginkan Natal ini sederhana sekali: duduk di sebelahmu dengan satu selimut untuk berdua, mendengarkan lagu Natal yang sama diputar ulang, dan melihat salju turun sementara kamu menyandarkan kepala di bahuku.\n\nKamu mungkin tidak sadar, tapi kamu punya cara membuat hal biasa terasa istimewa. Teh yang terlalu manis jadi enak karena kamu yang membuat. Jalan kaki di udara dingin jadi menyenangkan karena kamu menggenggam tanganku lalu memasukkannya ke saku jaketmu.\n\nTahun ini tidak selalu mudah untuk kita. Ada hari kita salah paham, ada minggu kita sama-sama lelah. Tapi setiap kali, kita memilih untuk kembali duduk dan bicara. Bagiku, itu kado paling berharga yang pernah kuterima.\n\nTerima kasih sudah memilihku, di musim ini dan semoga di semua musim yang akan datang.",
        signature: "— Milikmu, selalu"
      },
      memories: {
        eyebrow: "yang tak terlupakan",
        title: "Momen-Momen Kecil Kita",
        items: [
          {
            title: "Pertama kali kamu tertawa karena aku",
            date: "",
            body: "Leluconku sebenarnya tidak lucu. Tapi kamu tertawa sampai menutup muka, dan sejak hari itu aku diam-diam ingin membuatmu tertawa seumur hidup.",
            photoId: ""
          },
          {
            title: "Hujan di halte itu",
            date: "",
            body: "Kita terjebak hujan tanpa payung dan menunggu hampir satu jam. Aku tidak ingat obrolannya, tapi aku ingat aku berharap hujannya tidak cepat reda.",
            photoId: ""
          },
          {
            title: "Natal pertama kita",
            date: "",
            body: "Kadomu terbungkus berantakan dan kartunya ditulis terburu-buru. Sampai sekarang kartu itu masih kusimpan di laci, di bawah barang-barang yang paling kujaga.",
            photoId: ""
          }
        ]
      },
      quote: {
        text: "Aku tidak tahu akan seperti apa tahun depan. Tapi kalau boleh memilih, aku ingin melewati setiap Desember dengan menggenggam tanganmu.",
        source: "Janjiku untukmu",
        translation: ""
      },
      question: {
        eyebrow: "satu pertanyaan kecil",
        title: "Maukah kamu merayakan Natal berikutnya bersamaku?",
        body: "Dan yang sesudahnya. Dan yang sesudahnya lagi. Sampai kita lupa sudah berapa kali menghias pohon bersama.",
        yesLabel: "Mau, dong!",
        yesResponse: "Sudah kucatat di kalender, dengan tinta yang tidak bisa dihapus. Terima kasih sudah bilang iya. 🎄💛"
      },
      finale: {
        eyebrow: "selamat natal",
        title: "Terima Kasih Sudah Jadi Kadoku",
        body: "Salju akan mencair dan lampu-lampu akan dipadamkan. Tapi aku ingin kamu tahu: perasaanku padamu bukan perayaan musiman. Ia ada di hari Senin yang membosankan, di bulan-bulan yang sibuk, dan di semua hari biasa yang kita jalani berdua.",
        signature: "Dari yang selalu mencintaimu"
      }
    },
  },

  anniversary: {
    label: 'Hari Jadi',
    note: 'Perjalanan berdua dengan langit berbintang, cerita, kenangan, dan surat penutup.',
    preset: 'starlit-couple',
    sections: ['intro', 'hero', 'story', 'memories', 'letter', 'garden', 'gallery', 'finale'],
    content: {
      hero: {
        eyebrow: "hari jadi kita",
        titleTop: "Bersamamu,",
        titleBottom: "Setiap Hari Istimewa",
        subtitle: "Satu tahun lagi kita lewati berdua. Di bawah langit yang sama, aku masih memilihmu, dengan alasan yang setiap hari bertambah."
      },
      story: {
        eyebrow: "perjalanan kita",
        title: "Dari Awal Sampai Hari Ini",
        items: [
          {
            date: "Awal",
            title: "Pertemuan yang tidak direncanakan",
            body: "Kita bertemu di hari yang biasa saja. Tidak ada tanda-tanda bahwa orang di depanku akan jadi nama yang paling sering kusebut dalam doa.",
            photoId: ""
          },
          {
            date: "Beberapa bulan kemudian",
            title: "Pesan yang tidak pernah berhenti",
            body: "Obrolan singkat berubah jadi telepon sampai larut. Kita membicarakan semuanya, dari hal-hal konyol sampai ketakutan yang belum pernah kuceritakan ke siapa pun.",
            photoId: ""
          },
          {
            date: "Hari ini",
            title: "Masih kamu",
            body: "Kita sudah melihat versi terbaik dan terburuk satu sama lain. Dan setelah semua itu, aku masih ingin pulang ke kamu.",
            photoId: ""
          }
        ]
      },
      memories: {
        eyebrow: "terekam di ingatan",
        title: "Yang Selalu Kuingat",
        items: [
          {
            title: "Perjalanan tanpa rencana",
            date: "",
            body: "Kita salah ambil jalan, kehabisan sinyal, lalu makan di warung pinggir jalan. Hari itu jadi salah satu hari paling bahagia yang pernah kupunya.",
            photoId: ""
          },
          {
            title: "Malam kita menghitung bintang",
            date: "",
            body: "Kamu menunjuk bintang paling terang dan bilang itu milik kita. Aku tidak pernah bilang, tapi sejak malam itu aku selalu mencarinya setiap kali melihat langit.",
            photoId: ""
          }
        ]
      },
      letter: {
        label: "di hari kita",
        title: "Terima kasih sudah bertahan, dan memilihku lagi setiap hari.",
        body: "Kalau aku melihat ke belakang, perjalanan kita tidak selalu mulus. Ada hari-hari ketika kita sama-sama keras kepala, ada malam ketika kita tidur dengan perasaan yang belum selesai. Tapi kita selalu kembali, duduk berdua, dan mencoba mengerti satu sama lain lagi.\n\nAku belajar banyak darimu. Tentang sabar yang tidak berisik, tentang meminta maaf tanpa gengsi, tentang mencintai seseorang lengkap dengan bagian-bagian dirinya yang belum selesai. Kamu membuatku jadi versi diriku yang lebih baik, tanpa pernah memaksaku berubah.\n\nHari ini aku tidak ingin merayakan berapa lama kita sudah bersama. Aku ingin merayakan kenyataan bahwa setelah semua yang terjadi, kita masih saling memilih.\n\nSelamat hari jadi, sayang. Ayo terus tumbuh berdua, pelan-pelan, sampai kita tua dan masih saling mengirim pesan \"sudah makan belum?\".",
        signature: "— Kekasihmu, hari ini dan seterusnya"
      },
      garden: {
        eyebrow: "seikat untukmu",
        title: "Satu Bunga untuk Tiap Hal yang Kusyukuri",
        note: "sentuh tiap bunga untuk membaca maknanya",
        flowers: [
          {
            flower: "rose",
            name: "Mawar",
            meaning: "Cinta yang tetap merah setelah sekian lama"
          },
          {
            flower: "sakura",
            name: "Sakura",
            meaning: "Hari pertama kita bertemu"
          },
          {
            flower: "sunflower",
            name: "Bunga Matahari",
            meaning: "Kamu yang selalu menghadap ke arahku"
          },
          {
            flower: "tulip",
            name: "Tulip",
            meaning: "Bahagia sederhana di hari-hari biasa"
          },
          {
            flower: "lotus",
            name: "Teratai",
            meaning: "Kita yang tetap tumbuh di masa sulit"
          }
        ]
      },
      gallery: {
        eyebrow: "kita, dalam gambar",
        title: "Potongan Waktu yang Kita Punya"
      },
      finale: {
        eyebrow: "selamanya, ya?",
        title: "Aku Pilih Kamu, Lagi dan Lagi",
        body: "Di bawah langit yang sama tempat kita dulu menghitung bintang, aku ingin berjanji satu hal: apa pun yang datang tahun depan, aku akan tetap di sini. Menggenggam tanganmu, mendengarkan ceritamu, dan merayakan setiap hari biasa bersamamu.",
        signature: "Selamat hari jadi"
      }
    },
  },

  'dinner-date': {
    label: 'Undangan Makan Malam',
    note: 'Ajakan makan malam berdua: surat, alasan, hitung mundur ke malamnya, dan pertanyaan "mau?" di akhir.',
    preset: 'rose-gold-couple',
    sections: ['intro', 'hero', 'letter', 'reasons', 'countdown', 'question', 'finale'],
    content: {
      hero: {
        eyebrow: "satu malam untuk kita",
        titleTop: "Lilin Sudah Menyala,",
        titleBottom: "Tinggal Kamu",
        subtitle: "Mawar sudah di meja dan kursi di depanku sengaja kubiarkan kosong. Hanya ada satu orang yang kuharap duduk di sana."
      },
      letter: {
        label: "undangan kecil",
        title: "Aku ingin satu malam yang pelan, hanya untuk kita berdua.",
        body: "Belakangan ini kita sama-sama sibuk. Kita bertemu, tapi sering sambil memikirkan pekerjaan besok. Kita mengobrol, tapi sering terpotong notifikasi. Aku rindu kita yang dulu bisa duduk berjam-jam tanpa melihat jam.\n\nJadi aku menyiapkan satu malam. Tempatnya tenang, lampunya temaram, dan menunya kupilih dari hal-hal yang pernah kamu bilang ingin coba. Tidak ada agenda apa pun selain menikmati waktu bersamamu.\n\nKamu tidak perlu membawa apa-apa. Datang saja dengan senyummu yang biasa, ceritamu tentang minggu ini, dan tawamu yang selalu membuat suasana jadi hangat.",
        signature: "— Yang menunggumu di meja"
      },
      reasons: {
        eyebrow: "kenapa malam ini",
        title: "Alasan Aku Mengajakmu",
        items: [
          {
            icon: "heart",
            title: "Aku rindu ngobrol lama",
            body: "Bukan sekadar bertukar kabar, tapi bicara sampai lupa waktu, seperti di awal-awal kita dulu."
          },
          {
            icon: "sparkle",
            title: "Kamu pantas dirayakan",
            body: "Minggu-minggu ini kamu bekerja keras dan jarang mengeluh. Malam ini giliranmu untuk dimanja."
          },
          {
            icon: "star",
            title: "Terima kasih yang tertunda",
            body: "Untuk semua hal kecil yang kamu lakukan tanpa diminta, dan yang sering terlewat tanpa kusadari."
          },
          {
            icon: "leaf",
            title: "Karena kita butuh jeda",
            body: "Hubungan bukan hanya dijalani, tapi juga dirawat. Satu malam berdua adalah caraku merawat kita."
          }
        ]
      },
      countdown: {
        eyebrow: "catat tanggalnya",
        title: "Menuju Malam Kita",
        targetAt: "2026-11-14T19:00",
        passedLabel: "Malamnya sudah tiba. Lilin sudah menyala, dan aku menunggumu. 🕯️"
      },
      question: {
        eyebrow: "jadi, bagaimana?",
        title: "Mau makan malam bersamaku?",
        body: "Sabtu, jam tujuh malam. Aku yang menjemputmu, dan aku janji kali ini tidak telat.",
        yesLabel: "Mau!",
        noLabel: "Nanti dulu",
        noBehavior: "dodge",
        yesResponse: "Terima kasih sudah bilang iya. Pakai baju yang paling membuatmu nyaman, ya. Sisanya serahkan padaku. 🌹"
      },
      finale: {
        eyebrow: "sampai jumpa",
        title: "Kursi di Depanku Selalu Milikmu",
        body: "Malam ini, dan malam-malam berikutnya. Di restoran yang tenang atau di warung tenda pinggir jalan, yang membuatnya istimewa bukan tempatnya, tapi kamu yang duduk di seberang meja.",
        signature: "Dengan cinta, dari aku"
      }
    },
  },

  'new-year': {
    "label": "Tahun Baru",
    "note": "Kembang api, hitung mundur ke tengah malam, rekap setahun, dan doa untuk tahun yang baru.",
    "preset": "new-year-midnight",
    "sections": [
      "intro",
      "hero",
      "countdown",
      "reasons",
      "wish",
      "letter",
      "gallery",
      "finale"
    ],
    "content": {
      "intro": {
        "hint": "ketuk untuk menyalakan kembang api",
        "label": "2027"
      },
      "hero": {
        "eyebrow": "selamat tahun baru",
        "titleTop": "Selamat Tinggal 2026,",
        "titleBottom": "Halo Lembar Baru",
        "subtitle": "Sebelum jam berdentang dua belas kali, aku ingin berhenti sebentar dan berterima kasih untuk satu tahun yang kita lewati bersama: yang berat, yang lucu, dan yang diam-diam mengubah kita."
      },
      "countdown": {
        "eyebrow": "detik-detik terakhir",
        "title": "Menuju Tengah Malam",
        "targetAt": "2027-01-01T00:00",
        "passedLabel": "Selamat Tahun Baru 2027! Semoga tahun ini lebih ramah padamu. 🎆"
      },
      "reasons": {
        "eyebrow": "rekap 2026",
        "title": "Hal-Hal yang Membuat 2026 Layak Dikenang",
        "items": [
          {
            "icon": "star",
            "title": "Kita bertahan",
            "body": "Ada bulan-bulan yang terasa seperti mendaki tanpa puncak. Tapi kita masih di sini, sedikit lebih kuat daripada Januari lalu."
          },
          {
            "icon": "heart",
            "title": "Orang-orang yang tinggal",
            "body": "Tahun ini mengajariku siapa yang benar-benar ada saat keadaan tidak mudah. Kamu salah satunya, dan aku tidak akan lupa."
          },
          {
            "icon": "sparkle",
            "title": "Tawa yang tidak direncanakan",
            "body": "Obrolan tengah malam, lelucon yang cuma kita yang paham, dan tertawa sampai perut sakit di hari yang seharusnya buruk."
          },
          {
            "icon": "leaf",
            "title": "Hal kecil yang tumbuh",
            "body": "Kebiasaan baru, keberanian kecil, dan kesabaran yang ternyata bisa dilatih. Pelan, tapi nyata."
          }
        ]
      },
      "wish": {
        "eyebrow": "untuk tahun yang baru",
        "bigText": "2027",
        "title": "Doaku untukmu",
        "body": "Aku tidak mendoakan tahun yang sempurna, karena tahun seperti itu tidak ada. Aku mendoakan tahun yang cukup: cukup sehat, cukup tenang, dan cukup banyak alasan untuk tersenyum.",
        "itemsTitle": "Semoga tahun ini kamu",
        "items": [
          {
            "text": "Tidur lebih nyenyak dan khawatir lebih sedikit."
          },
          {
            "text": "Berani memulai hal yang selama ini hanya kamu simpan di catatan."
          },
          {
            "text": "Dikelilingi orang-orang yang membuatmu merasa cukup apa adanya."
          },
          {
            "text": "Menemukan lagi hal-hal yang dulu membuatmu bersemangat."
          }
        ],
        "signature": "— Dari yang ikut menghitung mundur bersamamu"
      },
      "letter": {
        "label": "surat akhir tahun",
        "title": "Terima kasih untuk 365 hari yang tidak selalu mudah.",
        "body": "Kalau aku membuka lagi kalender tahun ini, isinya campur aduk. Ada tanggal yang kulingkari karena bahagia, ada juga minggu-minggu yang ingin cepat-cepat kulewati. Tapi di hampir setiap halamannya, entah bagaimana, ada kamu.\n\nKamu yang membalas pesan panjangku di jam yang tidak masuk akal. Kamu yang mengajak keluar sebentar saat aku terlalu lama diam di kamar. Kamu yang tidak pernah bilang \"sudahlah\", tapi selalu bilang \"pelan-pelan saja\".\n\nAku belajar banyak tahun ini: bahwa rencana boleh berantakan, bahwa istirahat bukan kemalasan, dan bahwa teman yang tepat bisa membuat tahun terberat pun terasa bisa dijalani.\n\nJadi sebelum kembang api pertama menyala, aku ingin kamu tahu: apa pun yang menunggu di 2027, aku ada di sini. Untuk merayakan, untuk menemani, atau sekadar untuk mendengarkan.",
        "signature": "— Sampai jumpa di 2027"
      },
      "gallery": {
        "eyebrow": "potongan 2026",
        "title": "Setahun dalam Gambar"
      },
      "finale": {
        "eyebrow": "tahun baru, cerita baru",
        "title": "Selamat Tahun Baru",
        "body": "Kembang apinya akan habis dalam beberapa menit, tapi harapan yang kita nyalakan malam ini boleh menyala sepanjang tahun. Terima kasih sudah jadi bagian terbaik dari tahun yang lama. Ayo kita isi yang baru dengan lebih banyak tawa.",
        "signature": "Bersulang untuk kita 🥂"
      }
    }
  },

  'new-year-couple': {
    "label": "Tahun Baru untuk Pasangan",
    "note": "Gelembung sampanye, kilas balik setahun berdua, surat, dan satu pertanyaan sebelum tengah malam.",
    "preset": "champagne-toast",
    "sections": [
      "intro",
      "hero",
      "memories",
      "letter",
      "quote",
      "question",
      "finale"
    ],
    "content": {
      "intro": {
        "hint": "ketuk untuk bersulang",
        "label": ""
      },
      "hero": {
        "eyebrow": "malam pergantian tahun",
        "titleTop": "Tahun Berganti,",
        "titleBottom": "Kamu Tetap Rumahku",
        "subtitle": "Di antara dentang jam dan riuh terompet, ada satu hal yang tidak ingin kuganti saat tahun berganti: kamu, dan cara kita saling memilih setiap hari."
      },
      "memories": {
        "eyebrow": "kilas balik",
        "title": "Tahun Kita, Dalam Beberapa Babak",
        "items": [
          {
            "title": "Awal tahun yang canggung",
            "body": "Kita masih belajar membaca diam satu sama lain. Ternyata diam-mu yang paling panjang biasanya berarti kamu cuma lapar.",
            "photoId": "",
            "date": "Januari"
          },
          {
            "title": "Pertengkaran yang membuat kita dewasa",
            "body": "Kita pernah sama-sama keras kepala. Tapi kita juga sama-sama memilih pulang dan bicara, bukan pergi.",
            "photoId": "",
            "date": "Pertengahan tahun"
          },
          {
            "title": "Malam-malam biasa yang paling kusuka",
            "body": "Masak mi instan bersama, menonton film yang tidak selesai, dan tertidur di tengah obrolan. Ternyata itu yang paling ingin kuulang.",
            "photoId": "",
            "date": "Sepanjang tahun"
          }
        ]
      },
      "letter": {
        "label": "untukmu, sebelum tengah malam",
        "title": "Satu tahun lagi, dan aku masih jatuh cinta dengan cara yang sama.",
        "body": "Tahun ini kita tidak selalu romantis. Ada hari-hari kita sibuk sampai lupa bertanya kabar, ada malam-malam kita tidur dengan punggung saling membelakangi. Tapi besoknya, selalu ada salah satu dari kita yang lebih dulu mengulurkan tangan.\n\nItu yang paling kusyukuri. Bukan momen-momen besar yang kita unggah, tapi kebiasaan kecil untuk kembali. Caramu menyisakan potongan terakhir untukku. Caramu mengingat hal yang pernah kuceritakan sambil lalu.\n\nAku tidak tahu 2027 akan membawa apa. Mungkin pekerjaan baru, mungkin kota baru, mungkin masalah yang belum terbayang. Tapi aku tahu aku ingin menghadapinya dengan tanganmu di genggamanku.\n\nJadi saat hitungan mundur sampai di angka nol nanti, lihat ke arahku. Ciuman pertama tahun ini, seperti biasa, untukmu.",
        "signature": "— Yang ingin bersamamu di setiap pergantian tahun"
      },
      "quote": {
        "text": "Aku tidak butuh tahun yang sempurna. Aku hanya butuh kamu, di setiap tahun yang tidak sempurna itu.",
        "source": "Catatan kecil di malam tahun baru",
        "translation": ""
      },
      "question": {
        "eyebrow": "sebelum jam dua belas",
        "title": "Mau lewati 2027 bersamaku?",
        "body": "Dengan semua kejutan, rencana yang berubah, dan hari-hari biasa di antaranya.",
        "yesLabel": "Mau, selalu",
        "noLabel": "Pikir dulu",
        "noBehavior": "dodge",
        "yesResponse": "Kalau begitu, ayo kita bersulang. Untuk tahun baru, dan untuk kita yang tidak ke mana-mana. 🥂",
        "noResponse": "Tidak apa-apa, pikirkan pelan-pelan. Aku tetap di sini, menunggumu di sisi gelas yang satunya."
      },
      "finale": {
        "eyebrow": "lima, empat, tiga, dua, satu",
        "title": "Selamat Tahun Baru, Sayang",
        "body": "Terompet akan berhenti, kembang api akan padam, dan kota akan kembali tidur. Tapi janji kecil malam ini tetap berlaku: apa pun yang datang tahun ini, kita hadapi berdua.",
        "signature": "Dengan cinta, di detik pertama 2027"
      }
    }
  },

  'christmas-kids': {
    "label": "Kartu Natal untuk Si Kecil",
    "note": "Gaya kartun yang ceria: kado yang bisa dibuka, alasan dia anak hebat, dan hitung mundur ke malam Natal.",
    "preset": "gingerbread",
    "sections": [
      "intro",
      "hero",
      "unwrap",
      "reasons",
      "countdown",
      "letter",
      "finale"
    ],
    "content": {
      "intro": {
        "hint": "ketuk kadonya, ada kejutan!",
        "label": "Untuk Si Kecil"
      },
      "hero": {
        "eyebrow": "hore, sudah natal!",
        "titleTop": "Selamat Natal,",
        "titleBottom": "Anak Hebat!",
        "subtitle": "Lampu pohon sudah menyala, kue jahe sudah keluar dari oven, dan ada beberapa kado kecil yang menunggu untuk dibuka. Siap?"
      },
      "unwrap": {
        "eyebrow": "di bawah pohon natal",
        "title": "Tiga Kado untukmu",
        "doneNote": "Semua kado sudah terbuka! Tapi kado paling besar tidak muat di kotak: rasa sayang Ayah dan Ibu yang tidak ada habisnya.",
        "items": [
          {
            "tag": "Kado 1",
            "title": "Tiket Hari Bebas",
            "body": "Satu hari penuh kamu yang jadi kaptennya: kamu pilih sarapannya, kamu pilih tempat mainnya, kamu pilih film sebelum tidur.",
            "photoId": ""
          },
          {
            "tag": "Kado 2",
            "title": "Kupon Kue Jahe",
            "body": "Berlaku untuk membuat kue jahe bersama, menghias sesukamu, dan boleh makan satu sebelum makan malam. Rahasia kita, ya!",
            "photoId": ""
          },
          {
            "tag": "Kado 3",
            "title": "Petualangan Malam Natal",
            "body": "Kita akan berjalan-jalan melihat lampu Natal di kompleks, pakai senter, sambil mencari rumah dengan lampu paling terang.",
            "photoId": ""
          }
        ]
      },
      "reasons": {
        "eyebrow": "kata ayah & ibu",
        "title": "Kenapa Kamu Anak yang Luar Biasa",
        "items": [
          {
            "icon": "star",
            "title": "Kamu pemberani",
            "body": "Ingat waktu kamu mencoba hal baru walaupun takut? Itu namanya berani. Kami bangga sekali."
          },
          {
            "icon": "heart",
            "title": "Kamu suka berbagi",
            "body": "Kamu memberikan mainanmu ke teman yang sedih. Hati sebaik itu adalah kado Natal paling indah."
          },
          {
            "icon": "sparkle",
            "title": "Tawamu menular",
            "body": "Kalau kamu tertawa, seisi rumah ikut tertawa. Rumah jadi terang seperti pohon Natal."
          },
          {
            "icon": "sunflower",
            "title": "Kamu terus tumbuh",
            "body": "Tahun ini kamu belajar banyak hal baru. Setiap hari kamu jadi sedikit lebih hebat dari kemarin."
          }
        ]
      },
      "countdown": {
        "eyebrow": "sabar ya, sebentar lagi",
        "title": "Menuju Malam Natal",
        "targetAt": "2026-12-24T18:00",
        "passedLabel": "Malam Natal sudah tiba! Waktunya buka kado dan makan kue jahe. 🎄"
      },
      "letter": {
        "label": "surat dari ayah & ibu",
        "title": "Untuk anak kami yang paling kami sayang,",
        "body": "Tahun ini kamu tumbuh tinggi sekali. Celana tahun lalu sudah kependekan, dan kamu sekarang bisa meraih toples kue di rak atas (iya, kami tahu).\n\nTapi yang paling membuat kami bangga bukan tinggimu. Kami bangga karena kamu belajar meminta maaf, belajar menunggu giliran, dan belajar memeluk adik atau teman yang sedang menangis.\n\nNatal adalah waktu untuk mengingat bahwa kita semua dicintai. Dan kamu, Nak, dicintai lebih dari semua lampu, kado, dan kue jahe di dunia ini.\n\nSelamat Natal. Teruslah jadi anak yang baik hati dan penuh rasa ingin tahu.",
        "signature": "— Peluk erat, Ayah & Ibu"
      },
      "finale": {
        "eyebrow": "selamat natal!",
        "title": "Merry Christmas, Jagoan!",
        "body": "Sekarang matikan layarnya, lalu cari Ayah dan Ibu. Ada satu pelukan Natal yang belum diberikan, dan itu khusus untukmu.",
        "signature": "Dengan sayang yang tidak ada habisnya"
      }
    }
  },

  'santa-letter': {
    "label": "Surat dari Sinterklas",
    "note": "Surat ajaib dari Kutub Utara untuk anak-anak: catatan kebaikan mereka tahun ini dan pesan dari Sinterklas.",
    "preset": "north-pole",
    "sections": [
      "intro",
      "hero",
      "letter",
      "reasons",
      "countdown",
      "finale"
    ],
    "content": {
      "intro": {
        "hint": "ada surat dari Kutub Utara! ketuk untuk membuka",
        "label": ""
      },
      "hero": {
        "eyebrow": "kiriman khusus dari kutub utara",
        "titleTop": "Surat untukmu",
        "titleBottom": "dari Sinterklas",
        "subtitle": "Surat ini diantar oleh rusa tercepat di Kutub Utara. Ia terbang melewati salju, awan, dan bintang-bintang, hanya untuk sampai di tanganmu."
      },
      "letter": {
        "label": "kutub utara, desember",
        "title": "Halo, temanku yang baik,",
        "body": "Ho ho ho! Di sini salju sedang turun lebat, dan para peri sibuk sekali di bengkel mainan. Tapi aku menyempatkan diri menulis surat ini, karena namamu ada di Daftar Anak Baik tahun ini.\n\nPara peri pengamatku bercerita banyak tentangmu. Katanya kamu sudah belajar merapikan mainan sendiri, berani mencoba makanan baru, dan pernah menghibur teman yang sedang sedih. Itu hal-hal yang membuat Kutub Utara bersinar lebih terang.\n\nIngat ya, kebaikan tidak hanya untuk bulan Desember. Kebaikan kecil yang kamu lakukan setiap hari, seperti berkata terima kasih atau berbagi bekal, adalah sihir Natal yang sesungguhnya.\n\nMalam Natal nanti, tidurlah lebih awal. Rusa-rusaku perlu mendarat diam-diam!",
        "signature": "— Sinterklas, dari Kutub Utara"
      },
      "reasons": {
        "eyebrow": "dari buku catatan sinterklas",
        "title": "Catatan Kebaikanmu Tahun Ini",
        "items": [
          {
            "icon": "star",
            "title": "Membantu di rumah",
            "body": "Para peri melihatmu membantu merapikan meja makan. Satu bintang emas untukmu!"
          },
          {
            "icon": "heart",
            "title": "Berbagi dengan teman",
            "body": "Kamu membagi bekal dengan teman yang lupa membawa makanan. Hati yang hangat, cocok untuk musim dingin."
          },
          {
            "icon": "sparkle",
            "title": "Berani mencoba",
            "body": "Kamu tetap mencoba walaupun awalnya takut. Bahkan rusa terbang pun dulu belajar terbang pelan-pelan."
          },
          {
            "icon": "moon",
            "title": "Tidur tepat waktu",
            "body": "Hampir setiap malam! Para peri menandai ini dengan pensil berwarna perak."
          }
        ]
      },
      "countdown": {
        "eyebrow": "kereta salju sedang bersiap",
        "title": "Sinterklas Berangkat Dalam",
        "targetAt": "2026-12-24T20:00",
        "passedLabel": "Kereta salju sudah terbang! Cepat tidur, Sinterklas sedang dalam perjalanan. 🦌"
      },
      "finale": {
        "eyebrow": "sampai jumpa malam natal",
        "title": "Tetaplah Jadi Anak yang Baik",
        "body": "Aku akan selalu mengingat namamu di Kutub Utara. Selamat Natal, temanku. Semoga rumahmu penuh tawa, kue hangat, dan pelukan dari orang-orang yang menyayangimu.",
        "signature": "Ho ho ho, Sinterklas & para peri"
      }
    }
  },

  apology: {
    label: 'Permintaan Maaf',
    note: 'Hujan di balik jendela, surat yang jujur, cerita apa yang terjadi, dan janji untuk berubah.',
    preset: 'rainy-window',
    style: {
      hero: { bgImage: '/image/apology/hero.webp', bgOverlay: 0.25 },
      finale: { bgImage: '/image/apology/finale.webp', bgOverlay: 0.35 },
    },
    sections: ['intro', 'hero', 'letter', 'story', 'quote', 'finale'],
    content: {
      intro: { hint: 'ketuk untuk membaca', label: 'maaf' },
      hero: {
        eyebrow: 'dari aku, untukmu',
        titleTop: 'Aku Minta Maaf,',
        titleBottom: 'dan Aku Serius',
        subtitle: 'Di luar sedang hujan, dan di sini aku menulis hal yang seharusnya kukatakan sejak awal. Kamu tidak harus memaafkanku sekarang. Aku hanya ingin kamu membacanya.',
      },
      letter: {
        label: 'surat yang jujur',
        title: 'Aku salah, dan aku tidak akan mencari alasan.',
        body: 'Aku sudah memikirkan kejadian itu berulang kali. Awalnya aku sibuk membela diri, mencari bagian di mana aku merasa benar. Tapi semakin lama aku sadar: yang penting bukan siapa yang benar, melainkan kamu yang terluka karena sikapku.\n\nAku minta maaf karena tidak mendengarkan saat kamu butuh didengar. Aku minta maaf karena kata-kataku lebih tajam dari yang pantas. Dan aku minta maaf karena butuh waktu selama ini untuk mengakuinya.\n\nAku tidak menulis ini supaya semuanya langsung kembali seperti semula. Kepercayaan tidak pulih karena satu surat. Aku menulis ini karena kamu pantas mendengar permintaan maaf yang utuh, tanpa "tapi" di belakangnya.',
        signature: '— Yang sedang belajar menjadi lebih baik',
      },
      story: {
        eyebrow: 'yang kupelajari',
        title: 'Dari Sini, Aku Ingin Berubah',
        note: '',
        items: [
          { date: 'Waktu itu', title: 'Aku tidak mendengarkan', body: 'Kamu mencoba bicara, dan aku malah sibuk menyiapkan jawaban. Aku mendengar kata-katamu, tapi tidak mendengarkan perasaanmu.', photoId: '' },
          { date: 'Setelahnya', title: 'Aku memilih diam', body: 'Aku pikir diam akan meredakan semuanya. Ternyata diamku justru membuatmu merasa sendirian.', photoId: '' },
          { date: 'Mulai sekarang', title: 'Aku akan bertanya lebih dulu', body: 'Sebelum membela diri, aku akan bertanya apa yang kamu rasakan, lalu benar-benar mendengarkan jawabannya.', photoId: '' },
        ],
      },
      quote: {
        text: 'Permintaan maaf yang tulus tidak berakhir di kata maaf. Ia berlanjut dalam cara aku memperlakukanmu besok, lusa, dan hari-hari sesudahnya.',
        source: 'Janjiku',
        translation: '',
      },
      finale: {
        eyebrow: 'setelah hujan',
        title: 'Aku Akan Menunggu dengan Sabar',
        body: 'Ambil waktu sebanyak yang kamu butuhkan. Kalau nanti kamu siap bicara, aku ada di sini dan kali ini aku akan mendengarkan. Hujan selalu reda pada waktunya. Aku harap kita juga begitu.',
        signature: 'Maaf, sungguh 🤍',
      },
    },
  },
} satisfies Record<string, OccasionBlueprint>;

export type OccasionId = keyof typeof OCCASIONS;

export const OCCASION_IDS = Object.keys(OCCASIONS) as OccasionId[];

export function isOccasionId(value: unknown): value is OccasionId {
  return typeof value === 'string' && value in OCCASIONS;
}
